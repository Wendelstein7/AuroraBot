import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { CommandError } from "../CommandHandler.js";
import { Module } from "../Module.js";

import dayjs from "dayjs";
import dayjsRelativeTime from "dayjs/plugin/relativeTime.js";
dayjs.extend(dayjsRelativeTime);

export default class Info extends Module {
  name = "Info";
  description = "This module allows querying various information about guilds and their members.";

  async start() {
    // /guildinfo
    this.bot.registerCommand({
      data: new SlashCommandBuilder()
        .setName("guildinfo")
        .setDescription("Retrieves information about the current guild.")
        .addBooleanOption(opt => opt
          .setName("visible")
          .setDescription("Whether the reply should be visible to everyone in the channel.")),

      async execute(interaction) {
        const { guild: baseGuild } = interaction;
        if (!baseGuild) throw new CommandError("Must be ran in a guild.");

        const [guild, preview] = await Promise.all([baseGuild.fetch(), baseGuild.fetchPreview()]);

        const embed = new EmbedBuilder()
          .setTitle("Guild information")
          .setDescription(`About **${guild.name}** (${guild.nameAcronym})`)
          .setThumbnail(guild.iconURL())
          .setColor(0xFFFFFF)
          .setImage(guild.bannerURL() ?? guild.splashURL())
          .addFields([
            {
              name: "Description",
              value: preview.description ?? "_none_",
              inline: false,
            },
            {
              name: "Created",
              value: `${guild.createdAt.toLocaleDateString("en-GB", {
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
              value: `Total: ${guild.memberCount.toString() ?? "_unknown_"}\n` +
                `Present: ${guild.approximatePresenceCount?.toString() ?? "_unknown_"}`,
              inline: true,
            },
            {
              name: "Nitro",
              value: `Tier ${guild.premiumTier} (boosted ${guild.premiumSubscriptionCount} times)`,
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
          ]);

        await interaction.reply({
          embeds: [embed],
          ephemeral: !interaction.options.getBoolean("visible"),
        });
      }
    });

    // /userinfo
    this.bot.registerCommand({
      data: new SlashCommandBuilder()
        .setName("userinfo")
        .setDescription("Retrieves information about yourself or another user in this guild.")
        .addUserOption(opt => opt
          .setName("user")
          .setDescription("The user to retrieve information about.")
          .setRequired(true))
        .addBooleanOption(opt => opt
          .setName("visible")
          .setDescription("Whether the reply should be visible to everyone in the channel.")),

      async execute(interaction) {
        const user = interaction.options.getUser("user");
        if (!user) throw new CommandError("User not found.");
        if (!interaction.guild) throw new CommandError("Must be ran in a guild.");

        const member = await interaction.guild.members.fetch(user.id);

        const embed = new EmbedBuilder()
          .setTitle("User information")
          .setDescription(`About <@${user.id}>`)
          .setThumbnail(user.displayAvatarURL())
          .setColor(member.displayHexColor)
          .addFields(
            {
              name: "Account created",
              value: `${user.createdAt.toLocaleDateString("en-GB", {
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
              value: member.joinedAt ? `${member.joinedAt.toLocaleDateString("en-GB", {
                month: "long",
                year: "numeric",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
              })}\n(${dayjs(member.joinedAt).fromNow()})` : "_none_",
              inline: true,
            },
            {
              name: "Nitro boosting",
              value: member.premiumSince
                ? `Yes, since ${member.premiumSince.toLocaleDateString(
                  "en-GB",
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
      }
    });
  }
}
