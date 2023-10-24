const { SlashCommandBuilder } = require("@discordjs/builders");

async function pinPost(thread) {
  let messages = await thread.messages.fetch();
  let firstMessage = messages.first();

  if(firstMessage.pinned)
    return;

  return await firstMessage.pin();
}

module.exports = {
  enabled: true,

  name: "Forum Pinner",
  description: "Automatically pins the first message of a forum post for easy retrieval.",

  commands: [
    {
      data: new SlashCommandBuilder()
        .setName("pin")
        .setDescription("Pin the first message of the post!"),

      async execute(interaction) {

        let channel = interaction.channel;

        if (channel.type !== "GUILD_PUBLIC_THREAD") {
          await interaction.reply({
            content: `You need to be in a forum post!`,
            ephemeral: true
          });
          return;
        }

        try {
          await pinPost(channel);
          await interaction.reply({
            content: `First message (that I found) pinned!`,
            ephemeral: true
          });
        } catch (e) {
          console.error(e);
          await interaction.reply({
            content: `There was an error executing this command!`,
            ephemeral: true
          });
        }
      }
    }
  ],

  events: [
    {
      name: "threadCreate",
      once: false,
      async execute(thread) {
        if (thread.type !== "GUILD_PUBLIC_THREAD")
          return;

        try {
          await pinPost(thread);
        } catch (e) {
          console.error(e);
        }
      }
    }
  ]
};
