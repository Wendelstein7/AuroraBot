import { Client, GatewayIntentBits, Interaction } from "discord.js";
import {
  CommandHandler,
  handleIncomingAutocomplete,
  handleIncomingCommand,
  handleIncomingInteraction, registerCommands
} from "./CommandHandler.js";
import { Module } from "./Module.js";
import modules, { ModuleName } from "./modules.js";

import batchingToposort from "batching-toposort";
import PQueue from "p-queue";
import { DISCORD_BOT_TOKEN, DISCORD_GUILD_ID, ENABLED_MODULES } from "./utils/vars.js";

const MAX_PARALLEL_MODULES = 8;
const moduleLoadQueue = new PQueue({ concurrency: MAX_PARALLEL_MODULES });

export class AuroraBot {
  public client: Client;
  public modules: Map<ModuleName, Module> = new Map();

  public _commandHandlers: Map<string, CommandHandler> = new Map();
  public _interactionPrefixes: Map<string, CommandHandler> = new Map();

  private stopping = false;

  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
      ]
    });

    // Global event handlers (modules can register their own event handlers)
    this.client.on("ready", this.onReady.bind(this));
    this.client.on("interactionCreate", this.onInteractionCreate.bind(this));
  }

  async start(): Promise<void> {
    await this.initModules();
    await this.connect();

    process.on("SIGINT", () => this.shutdown().catch(console.error));
    process.on("SIGTERM", () => this.shutdown().catch(console.error));
  }
  
  private async initModules() {
    // Gather all the enabled modules and their dependencies to be loaded in parallel in groups
    const moduleInstances: Record<string, Module> = {};
    const moduleDag: Record<string, string[]> = {};

    const enabledModules = new Set(ENABLED_MODULES);

    for (const [name, module] of Object.entries(modules)) {
      if (!enabledModules.has(name)) {
        console.log(`Skipping disabled module: ${name}`);
        continue;
      }

      const moduleInstance = new module(this);
      moduleInstances[name] = moduleInstance;

      // Check that the module's dependencies are also enabled
      const missingDependencies = moduleInstance.dependencies
        ?.filter(dep => !enabledModules.has(dep));

      if (missingDependencies?.length) {
        console.error(`Module ${name} is missing dependencies, skipping it: ${missingDependencies.join(", ")}`);
        continue;
      }

      // Add the module dependencies to the DAG, so they are loaded in the correct order later
      moduleDag[name] = moduleInstance.dependencies ?? [];
    }

    const batchedModules = batchingToposort(moduleDag);

    // Load the modules in parallel in groups. Modules that are depended on will be loaded first. The rest will be
    // loaded in batches of size MAX_PARALLEL_MODULES.
    for (let i = batchedModules.length - 1; i >= 0; i--) { // The graph is backwards, so iterate in reverse
      await moduleLoadQueue.addAll(batchedModules[i].map(n =>
        () => this.loadModule(n as ModuleName, moduleInstances[n])));
    }

    console.log(`Loaded ${this.modules.size} modules`);
  }

  private async loadModule<K extends ModuleName>(name: K, moduleInstance: InstanceType<typeof modules[K]>) {
    try {
      console.log(`Loading module: ${name}`);

      this.modules.set(name as ModuleName, moduleInstance);
      await moduleInstance.start();
    } catch (error) {
      console.error(`Failed to load module: ${name}`, error);
    }
  }

  private async connect() {
    if (!DISCORD_BOT_TOKEN) {
      console.error("No bot token provided");
      return;
    }

    console.log("Connecting to Discord...");
    await this.client.login(DISCORD_BOT_TOKEN);
  }

  private async shutdown() {
    console.log("Stop signal received, shutting down...");
    this.stopping = true;

    console.log("Stopping modules...");
    for (const module of this.modules.values()) {
      try {
        await module.stop();
      } catch (error) {
        console.error("Failed to stop module", error);
      }
    }

    console.log("Shutting down Discord client..");
    await this.client.destroy();
  }

  private onReady() {
    const { user } = this.client;

    if (user) console.log(`Logged in as ${user.displayName}`);
    else console.error("Failed to get user object from client");

    // Register the commands for the main guild
    // TODO: Should we register commands for *all* guilds?
    if (DISCORD_GUILD_ID) {
      const guild = this.client.guilds.cache.get(DISCORD_GUILD_ID);
      if (guild) {
        console.log(`Registering commands for guild ${guild.name}`);
        registerCommands(this, guild).catch(console.error);
      } else {
        console.error(`Failed to get guild with ID ${DISCORD_GUILD_ID}`);
      }
    }
  }

  private onInteractionCreate(i: Interaction) {
    if (this.stopping) return;

    // Check all the interaction types
    handleIncomingCommand(this, i).catch(console.error);
    handleIncomingAutocomplete(this, i).catch(console.error);
    handleIncomingInteraction(this, i).catch(console.error);
  }

  public registerCommand(handler: CommandHandler) {
    const name = handler.data.name;
    this._commandHandlers.set(name, handler);

    if (handler.interactionsPrefix) {
      this._interactionPrefixes.set(handler.interactionsPrefix.replace(/:$/, ""), handler);
    }
  }

  /**
   * @returns The instance of the module with the given name, or `undefined` if
   * it is not enabled or loaded yet.
   */
  public getModule<K extends ModuleName>(name: K): InstanceType<typeof modules[K]> | undefined {
    return this.modules.get(name) as InstanceType<typeof modules[K]> | undefined;
  }
}
