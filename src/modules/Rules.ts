import { SlashCommandBuilder } from "discord.js";
import { Module } from "../Module.js";
import { truncate } from "../utils/index.js";

const rules: string[] = [
  "1. Treat everyone with respect. Absolutely no harassment, witch hunting, sexism, racism, or hate speech will be tolerated.",
  "2. No spam, excessive swearing or any other behaviour intended to cause annoyance or irritation amongst others.",
  "3. No NSFW or obscene content. This includes text, images, or links featuring nudity, sex, hard violence, or other graphically disturbing content.",
  "4. If you see something that makes you feel unsafe, let staff know by ping or direct message. We want this server to be a welcoming space!",
  "5. Your (server-)username should be something that is both pronounceable and typeable using an (US)-International keyboard without modifier keys.",
  "6. Have a good time and let us know how we can improve!",
  "7. Do not feed trolls or fuel bullying, harassment or other unwanted behaviour. Stop participating in the conversation and report to staff.",
];

export default class Rules extends Module {
  name = "Rules";
  description = "This module allows users to request a specific rule by number for quick reference";

  async start() {
    this.bot.registerCommand({
      data: new SlashCommandBuilder()
        .setName("rule")
        .setDescription("Replies with the chosen rule")
        .addIntegerOption(opt => opt
          .setName("rule")
          .setDescription("Select a rule")
          .setRequired(true)
          .setMinValue(1)
          .setMaxValue(rules.length)
          .setChoices(rules.map((rule, i) => ({ name: `${truncate(rule, 100)}`, value: i + 1 })))),

      async execute(interaction) {
        const rule = interaction.options.getInteger("rule");
        if (!rule) throw new Error("Invalid rule number");
        await interaction.reply({ content: `Rule ${rules[rule - 1]}` });
      },
    });
  }
}
