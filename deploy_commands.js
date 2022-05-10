require("dotenv").config();

const fs = require("node:fs");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");

const commands = [];

// Load modules from the modules folder
const moduleFiles = fs
  .readdirSync("./modules")
  .filter((file) => file.endsWith(".js"));

for (const file of moduleFiles) {
  const module = require(`./modules/${file}`);

  if (!module.enabled) continue;

  for (const command of module.commands) {
    commands.push(command.data.toJSON());
  }
}

const rest = new REST({ version: "9" }).setToken(process.env.DISCORD_BOT_TOKEN);

rest
  .put(
    Routes.applicationGuildCommands(
      process.env.DISCORD_CLIENT_ID,
      process.env.DISCORD_GUILD_ID
    ),
    { body: commands }
  )
  .then(() =>
    console.log(
      `Successfully registered ${commands.length} application commands.`
    )
  )
  .catch(console.error);
