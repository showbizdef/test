import { ActionRowBuilder, ModalBuilder, TextInputBuilder, type Client, type Interaction } from "discord.js";
import type { CommandKit } from "commandkit";

import {
  blacklistAssignModalFields,
  blacklistRemoveModalFields,
  dismissalLogModalFields,
  promotionLogModalFields,
  reprimandAssignModalFields,
  reprimandRemoveModalFields,
} from "@data/logging/logging-modals-fields";

export default async function (interaction: Interaction, client: Client<true>, handler: CommandKit) {
  if (!interaction.isButton()) return;
  if (!interaction.inCachedGuild()) return;

  switch (interaction.customId) {
    case "promotion-log-button": {
      const modal = new ModalBuilder().setCustomId("promotion-log-modal").setTitle("Лог повышения");

      const fields = promotionLogModalFields.map((field) => {
        return new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId(field.id)
            .setLabel(field.name)
            .setPlaceholder(field.placeholder)
            .setStyle(field.style)
            .setRequired(field.required)
        );
      });

      modal.addComponents(fields);
      await interaction.showModal(modal);

      break;
    }
    case "dismissal-log-button": {
      const modal = new ModalBuilder().setCustomId("dismissal-log-modal").setTitle("Лог увольнения");

      const fields = dismissalLogModalFields.map((field) => {
        return new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId(field.id)
            .setLabel(field.name)
            .setPlaceholder(field.placeholder)
            .setStyle(field.style)
            .setRequired(field.required)
        );
      });

      modal.addComponents(fields);
      await interaction.showModal(modal);

      break;
    }
    case "reprimand-assign-log-button": {
      const modal = new ModalBuilder().setCustomId("reprimand-assign-log-modal").setTitle("Лог выдачи выговора");

      const fields = reprimandAssignModalFields.map((field) => {
        return new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId(field.id)
            .setLabel(field.name)
            .setPlaceholder(field.placeholder)
            .setStyle(field.style)
            .setRequired(field.required)
        );
      });

      modal.addComponents(fields);
      await interaction.showModal(modal);

      break;
    }
    case "reprimand-remove-log-button": {
      const modal = new ModalBuilder().setCustomId("reprimand-remove-log-modal").setTitle("Лог снятия выговора");

      const fields = reprimandRemoveModalFields.map((field) => {
        return new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId(field.id)
            .setLabel(field.name)
            .setPlaceholder(field.placeholder)
            .setStyle(field.style)
            .setRequired(field.required)
        );
      });

      modal.addComponents(fields);
      await interaction.showModal(modal);

      break;
    }
    case "blacklist-assign-log-button": {
      const modal = new ModalBuilder()
        .setCustomId("blacklist-assign-log-modal")
        .setTitle("Лог занесения в чёрный список");

      const fields = blacklistAssignModalFields.map((field) => {
        return new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId(field.id)
            .setLabel(field.name)
            .setPlaceholder(field.placeholder)
            .setStyle(field.style)
            .setRequired(field.required)
        );
      });

      modal.addComponents(fields);
      await interaction.showModal(modal);

      break;
    }
    case "blacklist-remove-log-button": {
      const modal = new ModalBuilder()
        .setCustomId("blacklist-remove-log-modal")
        .setTitle("Лог выноса из чёрного списка");

      const fields = blacklistRemoveModalFields.map((field) => {
        return new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId(field.id)
            .setLabel(field.name)
            .setPlaceholder(field.placeholder)
            .setStyle(field.style)
            .setRequired(field.required)
        );
      });

      modal.addComponents(fields);
      await interaction.showModal(modal);

      break;
    }
  }
}
