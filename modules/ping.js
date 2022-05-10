const { SlashCommandBuilder } = require("@discordjs/builders");

const dayjs = require("dayjs");
var relativeTime = require("dayjs/plugin/relativeTime");
dayjs.extend(relativeTime);

const emojis = [
  { ms: 200, emoji: ":grin:" },
  { ms: 350, emoji: ":relaxed:" },
  { ms: 500, emoji: ":slight_smile:" },
  { ms: 750, emoji: ":neutral_face:" },
  { ms: 1000, emoji: ":slight_frown:" },
  { ms: 2000, emoji: ":cry:" },
  { ms: Math.max, emoji: ":confounded:" },
];

const start = Date.now();

module.exports = {
  enabled: true,

  name: "Ping",
  description: "This module allows users to ping the bot and receive a reply.",

  commands: [
    {
      data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies with Pong!"),

      async execute(interaction) {
        let start = new Date().getTime();

        await interaction.reply({
          content: `Pong from bot!\nBot started ${dayjs(start).fromNow()}`,
          ephemeral: true,
        });

        let pingMilliseconds = Math.round(new Date().getTime() - start);
        let emoji = emojis.find((e) => pingMilliseconds < e.ms).emoji;

        await interaction.editReply({
          content: `Pong from bot!\nBot started ${dayjs(
            start
          ).fromNow()}\n*(took ${pingMilliseconds} ms ${emoji})*`,
          ephemeral: true,
        });
      },
    },
  ],

  events: [],
};
