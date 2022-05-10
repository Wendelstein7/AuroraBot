const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

const dayjs = require("dayjs");
var relativeTime = require("dayjs/plugin/relativeTime");
dayjs.extend(relativeTime);

const premiumTiers = {
  NONE: 0,
  TIER_1: 1,
  TIER_2: 2,
  TIER_3: 3,
};

module.exports = {
  enabled: true,

  name: "Info",
  description:
    "This module allows querying various information about guilds and their members.",

  commands: [
    {
      data: new SlashCommandBuilder()
        .setName("guildinfo")
        .setDescription("Retrieves information about the current guild.")
        .addBooleanOption((option) =>
          option
            .setName("visible")
            .setDescription(
              "Whether or not the reply should be visible to everyone in the channel."
            )
        ),

      async execute(interaction) {
        const guild = await interaction.guild.fetch();
        const preview = await interaction.guild.fetchPreview();
        if (guild.emojis) await guild.emojis.fetch();
        if (guild.stickers) await guild.stickers.fetch();

        const embed = new MessageEmbed()
          .setTitle("Guild information")
          .setDescription(`About **${guild.name}** (${guild.nameAcronym})`)
          .setThumbnail(guild.iconURL())
          .setColor(0xffffff)
          .setImage(guild.bannerURL() ?? guild.splashURL())
          .addFields(
            {
              name: "Description",
              value: preview.description ?? "_none_",
              inline: false,
            },
            {
              name: "Created",
              value: `${guild.createdAt.toLocaleDateString("en-uk", {
                month: "long",
                year: "numeric",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
              })}\n(${dayjs(guild.createdAt).fromNow()})`,
              inline: true,
            },
            {
              name: "Members",
              value: `Total: ${
                guild.memberCount.toString() ?? "_unknown_"
              }\nPresent: ${
                guild.approximatePresenceCount.toString() ?? "_unknown_"
              }`,
              inline: true,
            },
            {
              name: "Nitro",
              value: `Tier ${premiumTiers[guild.premiumTier]} (boosted ${
                guild.premiumSubscriptionCount
              } times)`,
              inline: true,
            },
            {
              name: "Owner",
              value: `<@${guild.ownerId}>`,
              inline: true,
            },
            {
              name: "Emojis",
              value: guild.emojis ? guild.emojis.cache.size.toString() : "0",
              inline: true,
            },
            {
              name: "Stickers",
              value: guild.stickers
                ? guild.stickers.cache.size.toString()
                : "0",
              inline: true,
            },
            {
              name: "Verified",
              value: guild.verified ? "Yes" : "No",
              inline: true,
            },
            {
              name: "Partnered",
              value: guild.partnered ? "Yes" : "No",
              inline: true,
            },
            {
              name: "ID",
              value: `\`${guild.id}\``,
              inline: true,
            }
          );

        await interaction.reply({
          embeds: [embed],
          ephemeral: !interaction.options.getBoolean("visible"),
        });
      },
    },
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
        )
        .addBooleanOption((option) =>
          option
            .setName("visible")
            .setDescription(
              "Whether or not the reply should be visible to everyone in the channel."
            )
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
              inline: true,
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
              inline: true,
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
              inline: true,
            },
            {
              name: "Type",
              value: user.system ? "System" : user.bot ? "Bot" : "User",
              inline: true,
            },
            {
              name: "Nickname",
              value: member.nickname ? `\`${member.nickname}\`` : "_none_",
              inline: true,
            },
            {
              name: "Tag",
              value: `\`${user.tag}\``,
              inline: true,
            },
            {
              name: "ID",
              value: `\`${user.id}\``,
              inline: true,
            }
          );

        await interaction.reply({
          embeds: [embed],
          ephemeral: !interaction.options.getBoolean("visible"),
        });
      },
    },
  ],

  events: [],
};
