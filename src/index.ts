import "dotenv/config";

import { AuroraBot } from "./AuroraBot.js";

export const bot = new AuroraBot();

bot.start().catch(err => {
  console.error("Failed to start AuroraBot!");
  console.error(err);
});

function shutdown() {
  console.log("Stop signal received, shutting down...");
  bot.shutdown()
    .then(() => console.log("Shutdown complete"))
    .catch(console.error);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
