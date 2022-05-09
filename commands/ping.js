const { SlashCommandBuilder } = require("@discordjs/builders");

const emojis = [
  { ms: 200, emoji: ":grin:" },
  { ms: 350, emoji: ":relaxed:" },
  { ms: 500, emoji: ":slight_smile:" },
  { ms: 750, emoji: ":neutral_face:" },
  { ms: 1000, emoji: ":slight_frown:" },
  { ms: 2000, emoji: ":cry:" },
  { ms: Math.max, emoji: ":confounded:" },
];

module.exports = {
  enabled: true,
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!"),
  async execute(interaction) {
    var start = new Date().getTime();

    await interaction.reply({ content: "Pong!", ephemeral: true });

    var pingMilliseconds = Math.round(new Date().getTime() - start);
    var emoji = emojis.find((e) => pingMilliseconds < e.ms).emoji;

    await interaction.editReply({
      content: `Pong! *(took ${pingMilliseconds} ms ${emoji})*`,
      ephemeral: true,
    });
  },
};
