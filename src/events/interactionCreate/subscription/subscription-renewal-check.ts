import type { CommandKit } from "commandkit";
import { ButtonComponent, EmbedBuilder, type Client, type Interaction } from "discord.js";

import Subscription from "@schemas/Subscription";

import { COMPANY_OWNER_ROLE_ID } from "@constants/roles";

import { hasRole } from "@utils/roles/hasRole";
import { disableButtons } from "@utils/disable-buttons";
import { updateSubscriptionMessage } from "@utils/subscription/updateSubscriptionMessage";

export default async function (interaction: Interaction, client: Client<true>, handler: CommandKit) {
  if (!interaction.isButton()) return;
  if (!interaction.inCachedGuild()) return;

  switch (interaction.customId) {
    case "subs-renewal-approve": {
      if (!hasRole(interaction, COMPANY_OWNER_ROLE_ID))
        return interaction.reply({ content: "🔴 У Вас нет доступа.", ephemeral: true });

      const message = interaction.message;
      const receivedEmbed = message.embeds[0];

      const userId = receivedEmbed.footer?.text!;
      const messageButtons = message.components[0].components as ButtonComponent[];

      await Subscription.findOne({ userId })
        .then((document) => {
          if (!document) throw new Error("🔴 Игрок не найден в базе данных.");

          // обновление статуса подписки
          document.subscriptionStatus = "продлена";

          // сохранение документа
          document
            .save()
            .then((savedDocument) => {
              // обновленные компоненты сообщения
              const updatedRow = disableButtons(messageButtons);
              const newEmbed = new EmbedBuilder()
                .setTitle("✅ Запрос на продление подписки одобрен")
                .setDescription(
                  `Запрос на продление подписки игрока <@${savedDocument.userId}> был рассмотрен и одобрен пользователем ${interaction.member.user}.`
                )
                .setTimestamp()
                .setFooter({
                  text: interaction.client.user.username,
                  iconURL: interaction.client.user.displayAvatarURL(),
                });

              // обновление сообщения новыми компонентами
              interaction.update({
                embeds: [receivedEmbed, newEmbed],
                components: [updatedRow],
              });

              // уведомление игрока в личные сообщения
              interaction.client.users.send(userId, {
                embeds: [
                  new EmbedBuilder()
                    .setTitle("✅ Подписка продлена")
                    .setDescription(
                      "Ваша ежемесячная подписка успешно продлена. Благодарим за то, что остаётесь с нами! 💖"
                    )
                    .setTimestamp()
                    .setFooter({
                      text: interaction.client.user.username,
                      iconURL: interaction.client.user.displayAvatarURL(),
                    }),
                ],
              });

              // апдейт сообщения со списком подписок
              updateSubscriptionMessage(interaction);
            })
            .catch((error) => {
              return interaction.reply({ content: `${error.message}`, ephemeral: true });
            });
        })
        .catch((error) => {
          return interaction.reply({ content: `${error.message}`, ephemeral: true });
        });

      break;
    }
    case "subs-renewal-deny": {
      if (!hasRole(interaction, COMPANY_OWNER_ROLE_ID))
        return interaction.reply({ content: "🔴 У Вас нет доступа.", ephemeral: true });

      const message = interaction.message;
      const receivedEmbed = message.embeds[0];

      const userId = receivedEmbed.footer?.text!;
      const messageButtons = message.components[0].components as ButtonComponent[];

      // обновленные компоненты сообщения
      const updatedRow = disableButtons(messageButtons);
      const newEmbed = new EmbedBuilder()
        .setTitle("❎ Запрос на продление подписки отклонён")
        .setDescription(
          `Запрос на продление подписки игрока <@${userId}> был рассмотрен и отклонён пользователем ${interaction.member.user}.`
        )
        .setTimestamp()
        .setFooter({
          text: interaction.client.user.username,
          iconURL: interaction.client.user.displayAvatarURL(),
        });

      // обновление сообщения новыми компонентами
      interaction.update({
        embeds: [receivedEmbed, newEmbed],
        components: [updatedRow],
      });

      // уведомление игрока в личные сообщения
      interaction.client.users.send(userId, {
        embeds: [
          new EmbedBuilder()
            .setTitle("❎ Подписка не продлена")
            .setDescription(
              "Ваш запрос на продление подписки был отклонён. Подробности и причину отклонения узнавайте у владельцев."
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
    case "subs-renewal-close": {
      if (!hasRole(interaction, COMPANY_OWNER_ROLE_ID))
        return interaction.reply({ content: "🔴 У Вас нет доступа.", ephemeral: true });

      const message = interaction.message;
      const receivedEmbed = message.embeds[0];

      const userId = receivedEmbed.footer?.text!;
      const messageButtons = message.components[0].components as ButtonComponent[];

      // обновленные компоненты сообщения
      const updatedRow = disableButtons(messageButtons);
      const newEmbed = new EmbedBuilder()
        .setTitle("⛔ Запрос на продление подписки закрыт")
        .setDescription(
          `Запрос на продление подписки игрока <@${userId}> был закрыт пользователем ${interaction.member.user}.`
        )
        .setTimestamp()
        .setFooter({
          text: interaction.client.user.username,
          iconURL: interaction.client.user.displayAvatarURL(),
        });

      // обновление сообщения новыми компонентами
      interaction.update({
        embeds: [receivedEmbed, newEmbed],
        components: [updatedRow],
      });

      break;
    }
  }
}
