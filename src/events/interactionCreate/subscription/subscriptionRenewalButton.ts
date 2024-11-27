import type { CommandKit } from "commandkit";
import { ModalBuilder, ActionRowBuilder, TextInputBuilder, type Client, type Interaction } from "discord.js";

import { subscriptionRenewalModalFields } from "@data/subscription/subscriptionRenewalModalFields";

export default async function (interaction: Interaction, client: Client<true>, handler: CommandKit) {
  if (!interaction.isButton()) return;
  if (!interaction.inCachedGuild()) return;

  switch (interaction.customId) {
    case "subscription-renewal-button": {
      const modal = new ModalBuilder().setCustomId("subscription-renewal-modal").setTitle("Продление подписки");

      const fields = subscriptionRenewalModalFields.map(({ id, label, placeholder, style, required }) => {
        return new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId(id)
            .setLabel(label)
            .setPlaceholder(placeholder)
            .setStyle(style)
            .setRequired(required)
        );
      });

      modal.addComponents(fields);
      await interaction.showModal(modal);

      break;
    }
  }
}
