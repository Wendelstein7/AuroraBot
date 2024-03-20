import { SlashCommandBuilder } from "discord.js";
import { Module } from "../Module.js";

import dayjs from "dayjs";
import dayjsRelativeTime from "dayjs/plugin/relativeTime.js";
dayjs.extend(dayjsRelativeTime);

interface EmojiSpec {
  ms   : number;
  emoji: string;
}

const emojis: EmojiSpec[] = [
  { ms: 200 , emoji: ":grin:" },
  { ms: 350 , emoji: ":relaxed:" },
  { ms: 500 , emoji: ":slight_smile:" },
  { ms: 750 , emoji: ":neutral_face:" },
  { ms: 1000, emoji: ":slight_frown:" },
  { ms: 2000, emoji: ":cry:" }
];

export default class Ping extends Module {
  name = "Ping";
  description = "This module allows users to ping the bot and receive a reply.";

  async start() {
    this.bot.registerCommand({
      data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies with Pong!"),

      async execute(interaction) {
        const start = new Date().getTime();

        await interaction.reply({
          content: `Pong from bot!\nBot started ${dayjs(start).fromNow()}`,
          ephemeral: true,
        });

        const pingMilliseconds = Math.round(new Date().getTime() - start);
        const emoji = emojis.find((e) => pingMilliseconds < e.ms)?.emoji ?? ":confounded:";

        await interaction.editReply({
          content: `Pong from bot!\nBot started ${dayjs(start).fromNow()}\n*(took ${pingMilliseconds} ms ${emoji})*`
        });
      }
    });
  }
}
