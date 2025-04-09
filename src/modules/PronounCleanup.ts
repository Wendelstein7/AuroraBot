import { SlashCommandBuilder, GuildMemberRoleManager, bold, roleMention } from "discord.js";
import { Module } from "../Module.js";
import { PRONOUN_ROLE_IDS } from "../utils/vars.js";

export default class PronounCleanup extends Module {
  name = "PronounCleanup";
  description = "This module allows users to remove all their legacy pronoun roles, which have been superseded by " +
    "Discord's built-in pronouns feature.";

  async start() {
    // Register the slash command
    this.bot.registerCommand({
      data: new SlashCommandBuilder()
        .setName("clearpronouns")
        .setDescription("Removes all your legacy pronoun roles (superseded by Discord's built-in pronouns feature)."),

      async execute(interaction) {
        // Ensure the command is used in a guild
        if (!interaction.guild || !interaction.member) {
          await interaction.reply({
            content: "This command can only be used in a server.",
            ephemeral: true
          });
          return;
        }

        // Defer the reply to give us time to process
        await interaction.deferReply({ ephemeral: true });

        try {
          // Get the member's roles and find their pronoun roles
          const memberRoles = (interaction.member.roles as GuildMemberRoleManager);
          const userRoleIds = [...memberRoles.cache.keys()];
          const pronounRolesToRemove = PRONOUN_ROLE_IDS.filter(r => userRoleIds.includes(r));

          if (pronounRolesToRemove.length === 0) {
            await interaction.editReply({
              content: "You don't have any legacy pronoun roles to remove. " +
                "Make sure your Discord profile's pronouns field is up to date!",
            });
            return;
          }

          // Remove the pronoun roles
          await memberRoles.remove(pronounRolesToRemove);

          await interaction.editReply({
            content: `Successfully removed ${bold(pronounRolesToRemove.length.toString())} legacy pronoun role(s): ` +
              pronounRolesToRemove.map(roleMention).join(", ") +
              "\nMake sure your Discord profile's pronouns field is up to date!",
          });
        } catch (error) {
          console.error("Error in /clearpronouns command:", error);
          await interaction.editReply({
            content: "An error occurred while trying to remove legacy pronoun roles. " +
              "Please try again later or contact staff."
          });
        }
      }
    });
  }
}
