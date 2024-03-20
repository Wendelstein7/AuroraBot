import { AuroraBot } from "./AuroraBot.js";

export abstract class Module {
  abstract readonly name: string;
  abstract readonly description: string;

  /** Names of other modules that this module depends on - the dependencies will be started before this module. */
  dependencies: string[] = [];

  constructor(protected bot: AuroraBot) {}

  async start(): Promise<void> { /* noop */ }
  async stop(): Promise<void> { /* noop */ }
}
