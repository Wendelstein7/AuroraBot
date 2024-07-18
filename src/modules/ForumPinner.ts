import dayjs from "dayjs";
import dayjsRelativeTime from "dayjs/plugin/relativeTime.js";
import { ChannelType, Events, SlashCommandBuilder, ThreadChannel } from "discord.js";
import { Module } from "../Module.js";
import { DEBUG, UNPINNED_THREAD_CHECK_INTERVAL_MS } from "../utils/vars.js";

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

    // Check for unpinned threads on startup, and every 5 minutes
    if (UNPINNED_THREAD_CHECK_INTERVAL_MS > 0) {
      this.bot.client.on(Events.ClientReady, async () => {
        this.checkUnpinnedThreads()
          .catch(err => console.error("Error checking for unpinned threads (on startup):", err));

        setInterval(() => {
          this.checkUnpinnedThreads()
            .catch(err => console.error("Error checking for unpinned threads (interval):", err));
        }, UNPINNED_THREAD_CHECK_INTERVAL_MS).unref();
      });
    }
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

    // fetchStarterMessage should work (the first message of a thread has the same ID as the thread itself), but fall
    // back to fetching all messages if it doesn't work for some reason
    const firstMessage = (await thread.fetchStarterMessage())
      ?? await thread.messages.fetch().then(m => m.first());

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

  /** Checks all the forum channels for any unarchived threads with no pins */
  private async checkUnpinnedThreads() {
    const forumChannels = this.bot.client.channels.cache.filter(c => c.type === ChannelType.GuildForum);

    for (const channel of forumChannels.values()) {
      const { threads } = await channel.threads.fetch();

      for (const thread of threads.values()) {
        if (this.alreadyPinnedThreads.has(thread.id) || thread.archived || thread.lastPinTimestamp) {
          continue; // Skip threads that already have a pin
        }

        if (DEBUG) console.log(`Found unpinned thread ${thread.id}`);
        try {
          await this.pinPost(thread);
        } catch (e) {
          console.error("Error pinning post:", e);
        }
      }
    }
  }
}
