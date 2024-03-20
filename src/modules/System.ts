import { Module } from "../Module.js";

export default class System extends Module {
  name = "System";
  description = "This module implements various core functions.";

  async start() {
    this.bot.client.on("rateLimit", data => {
      console.log(`Rate limit exceeded! (Expires in ${data.timeout ?? "?"} ms)`);
    });

    this.bot.client.on("guildUnavailable", guild => {
      console.log(`Guild ${guild.name} has become unavailable. This could be due to Discord outages.`);
    });

    this.bot.client.on("warn", warning => {
      console.warn("Warning:", warning);
    });
  }
}
