import "dotenv/config";

import whyIsNodeRunning from "why-is-node-running";
import { AuroraBot } from "./AuroraBot.js";

export const bot = new AuroraBot();

bot.start().catch(err => {
  console.error("Failed to start AuroraBot!");
  console.error(err);
});

function debugShutdown() {
  setTimeout(() => {
    console.log("Still shutting down?");
    whyIsNodeRunning();
  }, 12500).unref();
}

process.on("SIGINT", debugShutdown);
process.on("SIGTERM", debugShutdown);
