import {
  AutocompleteInteraction, ButtonInteraction,
  ChatInputCommandInteraction,
  Guild,
  Interaction, SelectMenuInteraction,
  SharedNameAndDescription,
  SlashCommandBuilder
} from "discord.js";
import { AuroraBot } from "./AuroraBot.js";
import { splitRemainder } from "./utils/index.js";

export interface CommandHandler {
  data: SlashCommandBuilder | SharedNameAndDescription;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
  autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;

  interactionsPrefix?: string;
  onButtonInteraction?: (id: string, interaction: ButtonInteraction) => Promise<void>;
  onSelectMenuInteraction?: (id: string, interaction: SelectMenuInteraction) => Promise<void>;
}

export class CommandError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CommandError";
  }
}

export async function registerCommands(bot: AuroraBot, guild: Guild): Promise<void> {
  const existingCommands = await guild.commands.fetch();
  const existingCommandNames = existingCommands.map(c => c.name);
  const existingCommandNameSet = new Set(existingCommandNames);

  await Promise.all(Array.from(bot._commandHandlers.values()).map(async ({ data }) => {
    try {
      if (existingCommandNameSet.has(data.name)) {
        return;
      }

      console.log(`Registering command /${data.name} in guild ${guild.id}`);
      await guild.commands.create(data);
    } catch (err) {
      console.error(`Failed to register command /${data.name} in guild ${guild.id}`);
      console.error(err);
    }
  }));
}

export async function handleIncomingCommand(bot: AuroraBot, i: Interaction): Promise<void> {
  if (!i.isChatInputCommand()) return;
  const command = bot._commandHandlers.get(i.commandName);
  if (!command) return;

  if (!i.inGuild()) {
    await i.reply({ content: "You don't have permission to use this command or cannot use it here" });
    return;
  }

  try {
    await command.execute(i as ChatInputCommandInteraction);
  } catch (e: any) {
    if (e instanceof CommandError) {
      await i.reply({ content: e.message });
      return;
    }

    console.error(`An error occurred while executing command ${i.commandName}`, e);
    await i.reply({ content: `An unexpected error occurred while executing this command.` });
  }
}

export async function handleIncomingAutocomplete(bot: AuroraBot, i: Interaction): Promise<void> {
  if (!i.isAutocomplete()) return;
  const command = bot._commandHandlers.get(i.commandName);
  if (!command) return;

  if (!i.inGuild()) {
    return i.respond([]);
  }

  try {
    await command.autocomplete?.(i);
  } catch (e: any) {
    console.error(e);
    return i.respond([]);
  }
}

export async function handleIncomingInteraction(bot: AuroraBot, i: Interaction): Promise<void> {
  if (!i.isButton() && !i.isStringSelectMenu()) return;
  const [prefix, id] = splitRemainder(i.customId, ":", 2);
  if (!prefix || !id) return;
  const command = bot._interactionPrefixes.get(prefix);
  if (!command) return;

  if (!i.inGuild()) {
    await i.reply({
      content: `${i.user.toString()}: You don't have permission to use this interaction`
    });
    return;
  }

  try {
    if      (i.isButton())           await command.onButtonInteraction?.(id, i as ButtonInteraction);
    else if (i.isStringSelectMenu()) await command.onSelectMenuInteraction?.(id, i as SelectMenuInteraction);
  } catch (e: any) {
    if (e instanceof CommandError) {
      await i.reply({ content: e.message });
      return;
    }

    console.error(e);
    await i.reply({ content: `An unexpected error occurred while executing this command.` });
  }
}
