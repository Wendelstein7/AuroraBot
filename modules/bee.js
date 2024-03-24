const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  enabled: true,
  
  name: "Bee",
  description: "Replace every be in a string with :bee:",
  
  commands: [
    {
      data: new SlashCommandBuilder()
        .setName("bee")
        .setDescription("Beeify your message.")
        .addStringOption(option =>
          option.setName('input')
            .setDescription('String to beeify.'));
        
      async execute(interaction) {
        const bing = interaction.options.getUser('input') || "wojerbe";
        await interaction.reply({
          content: bing.replaceAll("be", ":bee:"),
          ephemeral: false,
        });
      }
    }
  ],
  events: [],
};
