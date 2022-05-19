require("dotenv").config();

const fs = require("node:fs");
const { Client, Collection, Intents } = require("discord.js");

// Create a Discord client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
client.commands = new Collection();

// Load modules from the modules folder
const moduleFiles = fs
  .readdirSync("./modules")
  .filter((file) => file.endsWith(".js"));

for (const file of moduleFiles) {
  const module = require(`./modules/${file}`);

  if (!module.enabled) continue;

  for (const command of module.commands) {
    client.commands.set(command.data.name, command);
  }

  for (const event of module.events) {
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
  }
}

// // Load commands from the commands directory
// client.commands = new Collection();
// const commandFiles = fs
//   .readdirSync("./commands")
//   .filter((file) => file.endsWith(".js"));
// for (const file of commandFiles) {
//   const command = require(`./commands/${file}`);

//   if (!command.enabled) continue;

//   client.commands.set(command.data.name, command);
// }

// const eventFiles = fs
//   .readdirSync("./events")
//   .filter((file) => file.endsWith(".js"));
// for (const file of eventFiles) {
//   const event = require(`./events/${file}`);

//   if (!event.enabled) continue;

//   if (event.once) {
//     client.once(event.name, (...args) => event.execute(...args));
//   } else {
//     client.on(event.name, (...args) => event.execute(...args));
//   }
// }

// Bot interaction logic
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

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

// Start the bot
console.info("Starting bot...", process.env.HELLO);
client.login(process.env.DISCORD_BOT_TOKEN);
