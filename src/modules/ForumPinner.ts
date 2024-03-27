import { ChannelType, SlashCommandBuilder, ThreadChannel } from "discord.js";
import { Module } from "../Module.js";

import dayjs from "dayjs";
import dayjsRelativeTime from "dayjs/plugin/relativeTime.js";
import { DEBUG } from "../utils/vars.js";
dayjs.extend(dayjsRelativeTime);

export default class ForumPinner extends Module {
  name = "Forum Pinner";
  description = "Automatically pins the first message of a forum post for easy retrieval.";

  async start() {
    this.bot.registerCommand({
      data: new SlashCommandBuilder()
        .setName("pin")
        .setDescription("Pin the first message of the post!"),

      execute: async (interaction) => {
        if (!interaction.memberPermissions?.has("ManageMessages")) {
          await interaction.reply({
            content: "You do not have permissions to use this command!",
            ephemeral: true
          });
          return;
        }

        const channel = interaction.channel;
        if (channel && channel.type !== ChannelType.PublicThread) {
          await interaction.reply({
            content: "You need to be in a forum post!",
            ephemeral: true
          });
          return;
        }

        try {
          await this.pinPost(channel as ThreadChannel);
          await interaction.reply({
            content: "First message (that I found) pinned!",
            ephemeral: true
          });
        } catch (e) {
          console.error("Error pinning post:", e);
          await interaction.reply({
            content: "There was an error executing this command!",
            ephemeral: true
          });
        }
      }
    });

    this.bot.client.on("threadCreate", async (thread) => {
      if (DEBUG) console.log(`Thread created: ${thread.id}  type: ${thread.type}`);
      if (thread.type !== ChannelType.PublicThread) return;

      try {
        await this.pinPost(thread);
      } catch (e) {
        console.error("Error pinning post:", e);
      }
    });
  }

  private async pinPost(thread: ThreadChannel) {
    if (DEBUG) console.log(`Looking for post to pin in thread ${thread.id}`);

    const messages = await thread.messages.fetch();

    const firstMessage = messages.first();
    if (DEBUG) console.log(`First message: ${firstMessage?.id}`);

    if (firstMessage?.pinned) {
      if (DEBUG) console.log("First message already pinned");
      return;
    }

    return firstMessage?.pin();
  }
}
