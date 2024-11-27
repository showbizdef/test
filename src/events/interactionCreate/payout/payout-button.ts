import {
  EmbedBuilder,
  type Client,
  type Interaction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonComponent,
} from "discord.js";
import type { CommandKit } from "commandkit";

export default async function (interaction: Interaction, client: Client<true>, handler: CommandKit) {
  if (!interaction.isButton()) return;

  switch (interaction.customId) {
    case "payout-done": {
      const message = interaction.message;
      const receivedEmbed = message.embeds[0];
      const payoutButton = message.components[0].components[0] as ButtonComponent;

      if (interaction.user.id !== receivedEmbed.footer?.text) {
        await interaction.reply({ content: "🫵 Это не твоё!", ephemeral: true });
        return;
      }

      const updatedEmbed = EmbedBuilder.from(receivedEmbed).setTitle(receivedEmbed.title + ` \`[ВЫПЛАЧЕНО]\` `);
      const updatedRow = new ActionRowBuilder<ButtonBuilder>().setComponents(
        ButtonBuilder.from(payoutButton).setDisabled(true)
      );

      await interaction.update({ embeds: [updatedEmbed], components: [updatedRow] });
    }
  }
}
