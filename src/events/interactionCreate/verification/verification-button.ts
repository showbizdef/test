import {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  Role,
  EmbedBuilder,
  type Client,
  type Interaction,
} from "discord.js";
import type { CommandKit } from "commandkit";

import { INSURANCE_STAFF_ROLE_ID, VERIFICATION_WAIT_ROLE_ID } from "@constants/roles";

import { hasRole } from "@utils/roles/hasRole";

import { verificationModalFields } from "@data/verification/verification-modal-fields";

export default async function (interaction: Interaction, client: Client<true>, handler: CommandKit) {
  if (!interaction.isButton()) return;
  if (!interaction.inCachedGuild()) return;

  switch (interaction.customId) {
    case "verification-button": {
      if (hasRole(interaction, VERIFICATION_WAIT_ROLE_ID)) {
        await interaction.deferReply({ ephemeral: true });

        const hasVerificationWaitRoleEmbed = new EmbedBuilder()
          .setTitle("🤨 Что-то тут не так")
          .setDescription(
            "Похоже, что Вы уже отправили заявку на верификацию. Подождите ещё чуть-чуть, заявки рассматриваются без особых задержек."
          )
          .setTimestamp()
          .setFooter({
            text: interaction.client.user.username,
            iconURL: interaction.client.user.displayAvatarURL(),
          });

        await interaction.editReply({
          embeds: [hasVerificationWaitRoleEmbed],
        });

        return;
      } else if (hasRole(interaction, INSURANCE_STAFF_ROLE_ID)) {
        await interaction.deferReply({ ephemeral: true });

        const hasInsuranceStaffRoleEmbed = new EmbedBuilder()
          .setTitle("🤨 Что-то тут не так")
          .setDescription(
            `Похоже, что Вы уже верифицированы и получили роль <#${INSURANCE_STAFF_ROLE_ID}>. Вам незачем повторно отправлять заявку на верификацию.`
          )
          .setTimestamp()
          .setFooter({
            text: interaction.client.user.username,
            iconURL: interaction.client.user.displayAvatarURL(),
          });

        await interaction.editReply({
          embeds: [hasInsuranceStaffRoleEmbed],
        });

        return;
      }

      const modal = new ModalBuilder().setCustomId("verification-modal").setTitle("Верификация");

      const fields = verificationModalFields.map((field) => {
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
