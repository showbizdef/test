import {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  Message,
  ButtonComponent,
  type Client,
  type Interaction,
} from "discord.js";
import type { CommandKit } from "commandkit";

import { INSURANCE_STAFF_ROLE_ID, VERIFICATION_WAIT_ROLE_ID } from "@constants/roles";
import { disableButtons } from "@utils/disable-buttons";

export default async function (interaction: Interaction, client: Client<true>, handler: CommandKit) {
  if (!interaction.isButton()) return;
  if (!interaction.inCachedGuild()) return;

  switch (interaction.customId) {
    case "approve-verification": {
      const verificationWaitRole = interaction.guild.roles.cache.get(VERIFICATION_WAIT_ROLE_ID)!;
      const insuranceStaffRole = interaction.guild.roles.cache.get(INSURANCE_STAFF_ROLE_ID)!;

      const message = interaction.message;
      const receivedEmbed = message.embeds[0];

      const userId = receivedEmbed.footer?.text!;

      const messageButtons = message.components[0].components as ButtonComponent[];

      const updatedRow = disableButtons(messageButtons);
      const newEmbed = new EmbedBuilder()
        .setTitle("✨ Запрос на верификацию одобрен")
        .setDescription(
          `Запрос на верификацию от пользователя <@${userId}> был рассмотрен и одобрен модератором ${interaction.member.user}.`
        )
        .setTimestamp()
        .setFooter({
          text: interaction.client.user.username,
          iconURL: interaction.client.user.displayAvatarURL(),
        });

      // выдача роли сотрудника + снятие роли ожидания верификации
      await interaction.guild.members.addRole({
        user: userId,
        role: insuranceStaffRole,
      });
      await interaction.guild.members.removeRole({ user: userId, role: verificationWaitRole });

      // редакторивание сообщения
      await interaction.update({
        embeds: [receivedEmbed, newEmbed],
        components: [updatedRow],
      });

      // уведомление в личные сообщения
      await interaction.client.users.send(userId, {
        embeds: [
          new EmbedBuilder()
            .setTitle("✨ Ваш запрос на верификацию одобрен")
            .setDescription(
              "Вам выдана роль сотрудника Страховой компании и открыт доступ к остальной части сервера. Не забудьте ознакомиться с правилами, ведь их незнание не освобождает от ответственности; помните об уважении к себе и окружающим."
            )
            .setTimestamp()
            .setFooter({
              text: interaction.client.user.username,
              iconURL: interaction.client.user.displayAvatarURL(),
            }),
        ],
      });

      break;
    }
    case "deny-verification": {
      await interaction.deferReply({ ephemeral: true });

      const verificationWaitRole = interaction.guild.roles.cache.get(VERIFICATION_WAIT_ROLE_ID)!;

      const message = interaction.message;
      const receivedEmbed = message.embeds[0];

      const userId = receivedEmbed.footer?.text!;

      const messageButtons = message.components[0].components as ButtonComponent[];

      const updatedRow = disableButtons(messageButtons);

      await interaction.followUp(
        "Введите причину отказа, отправив сообщение в данный канал, в течение 60 секунд (заявка будет отклонена по завершению таймера)."
      );

      let reason = "";
      const collectorFilter = (response: Message) => {
        if (response.author.bot || response.author.id !== interaction.member.user.id) return;

        reason = response.content;
        response.delete();
      };

      await interaction.channel?.awaitMessages({
        // @ts-ignore
        filter: collectorFilter,
        max: 1,
        time: 60_000,
      });

      if (reason) {
        const newEmbed = new EmbedBuilder()
          .setTitle("⛔ Запрос на верификацию отклонён")
          .setDescription(
            `Запрос на верификацию от пользователя <@${userId}> был рассмотрен и отклонён модератором ${interaction.member.user}.`
          )
          .setFields([{ name: "Причина отказа", value: reason }])
          .setTimestamp()
          .setFooter({
            text: interaction.client.user.username,
            iconURL: interaction.client.user.displayAvatarURL(),
          });

        // редактирование сообщения
        await message.edit({
          embeds: [receivedEmbed, newEmbed],
          components: [updatedRow],
        });

        // снятие роли "Ожидание верификации"
        await interaction.guild.members.removeRole({ user: userId, role: verificationWaitRole });

        // уведомление в личные сообщение
        await interaction.client.users.send(userId, {
          embeds: [
            new EmbedBuilder()
              .setTitle("⛔ Ваш запрос на верификацию отклонён")
              .setDescription("Ваша заявка на верификацию была отклонена руководством сервера.")
              .setFields([{ name: "Причина", value: reason }])
              .setTimestamp()
              .setFooter({
                text: interaction.client.user.username,
                iconURL: interaction.client.user.displayAvatarURL(),
              }),
          ],
        });
      } else {
        // ответ, если причина не была указана
        await interaction.followUp({
          content: "❎ Вы не указали причину за указанный промежуток времени, попробуйте снова.",
          ephemeral: true,
        });
      }

      reason = "";
      break;
    }
    case "close-verification": {
      const message = interaction.message;
      const receivedEmbed = message.embeds[0];

      const messageButtons = message.components[0].components as ButtonComponent[];

      const newEmbed = new EmbedBuilder()
        .setTitle("⛔ Запрос на верификацию закрыт")
        .setDescription(
          `Запрос на верификацию от пользователя <@${receivedEmbed.footer?.text}> закрыт модератором ${interaction.member.user}.`
        )
        .setTimestamp()
        .setFooter({
          text: interaction.client.user.username,
          iconURL: interaction.client.user.displayAvatarURL(),
        });
      const updatedRow = disableButtons(messageButtons);

      await interaction.update({
        embeds: [receivedEmbed, newEmbed],
        components: [updatedRow],
      });

      break;
    }
  }
}
