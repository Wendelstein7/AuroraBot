require("dotenv").config();

const fs = require("node:fs");
const { Client, Intents } = require("discord.js");

// Create a Discord client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// Load commands from the commands directory
client.commands = new Collection();
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  // Set a new item in the Collection
  // With the key as the command name and the value as the exported module
  client.commands.set(command.data.name, command);
}

// Bot interaction logic
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command || !command.enabled) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
});

// When the client is ready, this code is ran once
client.once("ready", () => {
  console.log("Bot is online!");
});

// Start the bot
console.log("Starting bot...", process.env.HELLO);
client.login(process.env.DISCORD_BOT_TOKEN);
