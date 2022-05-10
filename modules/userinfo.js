const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

const dayjs = require("dayjs");
var relativeTime = require("dayjs/plugin/relativeTime");
dayjs.extend(relativeTime);

module.exports = {
  enabled: true,

  name: "Userinfo",
  description:
    "This module allows querying various information about guild-members.",

  commands: [
    {
      data: new SlashCommandBuilder()
        .setName("userinfo")
        .setDescription(
          "Retrieves information about yourself or another user in this guild."
        )
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("The user to retrieve information about.")
        ),

      async execute(interaction) {
        const user = await (
          interaction.options.getUser("user") || interaction.user
        ).fetch();
        const member = await interaction.guild.members.fetch(user);

        const embed = new MessageEmbed()
          .setTitle("User information")
          .setDescription(`About <@${user.id}>`)
          .setThumbnail(user.displayAvatarURL())
          .setColor(member.displayHexColor)
          .addFields(
            {
              name: "Account created",
              value: `${user.createdAt.toLocaleDateString("en-uk", {
                month: "long",
                year: "numeric",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
              })}\n(${dayjs(user.createdAt).fromNow()})`,
              // inline: true,
            },
            {
              name: "Joined guild",
              value: `${member.joinedAt.toLocaleDateString("en-uk", {
                month: "long",
                year: "numeric",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
              })}\n(${dayjs(member.joinedAt).fromNow()})`,
              // inline: true,
            },
            {
              name: "Nitro boosting",
              value: member.premiumSince
                ? `Yes, since ${member.premiumSince.toLocaleDateString(
                    "en-uk",
                    {
                      month: "long",
                      year: "numeric",
                      day: "numeric",
                      hour: "numeric",
                      minute: "numeric",
                    }
                  )}\n(${dayjs(member.premiumSince).fromNow()})`
                : "No",
              // inline: true,
            },
            {
              name: "Type",
              value: user.system ? "System" : user.bot ? "Bot" : "User",
              // inline: true,
            },
            {
              name: "Nickname",
              value: member.nickname ? `\`${member.nickname}\`` : "_none_",
              // inline: true,
            },
            {
              name: "Tag",
              value: `\`${user.tag}\``,
              // inline: true,
            },
            {
              name: "ID",
              value: `\`${user.id}\``,
              // inline: true,
            }
          );

        await interaction.reply({ embeds: [embed], ephemeral: true });
      },
    },
  ],

  events: [],
};
