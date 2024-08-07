import { Events } from "discord.js";
import { Module } from "../Module.js";

export default class System extends Module {
  name = "System";
  description = "This module implements various core functions.";

  async start() {
    // TODO: "rateLimit" event is no longer in Events - was it removed?
    this.bot.client.on("rateLimit", data => {
      console.log(`Rate limit exceeded! (Expires in ${data.timeout ?? "?"} ms)`);
    });

    this.bot.client.on(Events.GuildUnavailable, guild => {
      console.log(`Guild ${guild.name} has become unavailable. This could be due to Discord outages.`);
    });

    this.bot.client.on(Events.Warn, warning => {
      console.warn("Warning:", warning);
    });
  }
}
