import { ChannelType, Events, SlashCommandBuilder, ThreadChannel } from "discord.js";
import { Module } from "../Module.js";

import dayjs from "dayjs";
import dayjsRelativeTime from "dayjs/plugin/relativeTime.js";
import { DEBUG } from "../utils/vars.js";
dayjs.extend(dayjsRelativeTime);

export default class ForumPinner extends Module {
  name = "Forum Pinner";
  description = "Automatically pins the first message of a forum post for easy retrieval.";

  // In-memory cache of threads that already have a pinned message, so we don't call fetchPinned or fetchMessages more
  // than necessary (very rate limited)
  alreadyPinnedThreads = new Set<string>();

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
          await this.pinPost(channel as ThreadChannel, true);
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

    // Automatically pin the first post when a new forum thread is created
    this.bot.client.on(Events.ThreadCreate, async (thread) => {
      if (DEBUG) console.log(`Thread created: ${thread.id}  type: ${thread.type}`);
      if (thread.type !== ChannelType.PublicThread) {
        if (DEBUG) console.log(`Not a public forum thread, skipping: ${thread.type}`);
        return;
      }

      try {
        await this.pinPost(thread);
      } catch (e) {
        console.error("Error pinning post:", e);
      }
    });

    // Since a new forum thread's first message might be undefined(?!), re-check and pin the first message whenever a
    // new message arrives in a forum thread too.
    this.bot.client.on(Events.MessageCreate, async (msg) => {
      if (msg.channel.type !== ChannelType.PublicThread) return;
      const thread = msg.channel as ThreadChannel;

      if (DEBUG) console.log(`Thread new message: ${thread.id}  type: ${thread.type}  message: ${msg.id}`);

      try {
        await this.pinPost(thread);
      } catch (e) {
        console.error("Error pinning post:", e);
      }
    });
  }

  private async pinPost(thread: ThreadChannel, force = false) {
    if (DEBUG) console.log(`Looking for post to pin in thread ${thread.id} (force: ${force})`);

    // Unless forced, skip checking for messages to pin if the channel already has a pinned message (even if it's not
    // the first message in the thread)
    if (!force) {
      if (this.alreadyPinnedThreads.has(thread.id)) {
        if (DEBUG) console.log("Thread already has pinned messages (cached), skipping");
        return;
      }

      const pinnedMessages = await thread.messages.fetchPinned();
      if (pinnedMessages.size > 0) {
        this.alreadyPinnedThreads.add(thread.id);
        if (DEBUG) console.log("Thread already has pinned messages (uncached), skipping");
        return;
      }
    }

    const messages = await thread.messages.fetch();

    const firstMessage = messages.first();
    if (DEBUG) console.log(`First message: ${firstMessage?.id}`);
    if (!firstMessage) throw new Error("No messages found in thread!");

    if (firstMessage?.pinned) {
      this.alreadyPinnedThreads.add(thread.id);
      if (DEBUG) console.log("First message already pinned");
      return;
    }

    await firstMessage.pin();
    this.alreadyPinnedThreads.add(thread.id); // Only add to cache if pinning was successful
  }
}
