import { CommandKit } from "commandkit";
import {
  EmbedBuilder,
  TextChannel,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  type Client,
  type Interaction,
} from "discord.js";

import Configuration from "@schemas/Configuration";

import { COMPANY_OWNER_ROLE_ID } from "@constants/roles";

export default async function (interaction: Interaction, client: Client<true>, handler: CommandKit) {
  if (!interaction.isModalSubmit()) return;
  if (!interaction.inCachedGuild()) return;

  switch (interaction.customId) {
    case "subscription-renewal-modal": {
      await interaction.deferReply({ ephemeral: true });

      // поля модального окна
      const nickname = interaction.fields.getTextInputValue("renewal-nickname-input");
      const screenshotURL = interaction.fields.getTextInputValue("renewal-payment-input");

      // проверка валидности ссылки
      if (!screenshotURL.startsWith("https://imgur.com/")) {
        return interaction.editReply("🔴 Некорректный формат ссылки.");
      }

      await Configuration.findOne({ guildId: interaction.guild.id })
        .then((document) => {
          if (!document) throw new Error(`🔴 Не удалось получить информацию из базы данных.`);
          if (!document.subscriptionRenewalCheckChannelId)
            throw new Error(
              `🔴 Канал для проверки заявок на продление подписки не установлен, воспользуйтесь командой </systems subscription setup:1162424704120934481>.`
            );

          const subscriptionRenewalCheckChannelId = document.subscriptionRenewalCheckChannelId;
          const subscriptionRenewalCheckChannel = interaction.guild.channels.cache.get(
            subscriptionRenewalCheckChannelId
          )! as TextChannel;

          // ембед продления подписки
          const renewalRequestEmbed = new EmbedBuilder()
            .setTitle(`💵 Продление подписки игрока ${nickname}`)
            .setDescription(
              `Игрок ${interaction.member.user} продлевает ежемесячную подписку, приложив скриншот оплаты. Тщательно рассмотрите его заявку и примите решение, нажав на соответствующую кнопку, прикреплённую к сообщению.`
            )
            .setTimestamp()
            .setFooter({
              text: interaction.member.user.id,
              iconURL: interaction.member.user.displayAvatarURL(),
            });

          // ембед ответа при отправке заявки
          const renewalRequestResponseEmbed = new EmbedBuilder()
            .setTitle("✅ Заявка на продление подписки успешно отправлена")
            .setDescription(
              `Ваша заявка будет рассмотрена в кратчайшие сроки. Как только она будет рассмотрена, Вам придёт уведомление в личные сообщения от ${interaction.client.user}.`
            )
            .setTimestamp()
            .setFooter({
              text: interaction.client.user.username,
              iconURL: interaction.client.user.displayAvatarURL(),
            });

          // кнопки для проверки заявки на продление подписки
          const renewalRequestRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
              .setURL(screenshotURL)
              .setLabel("Скриншот оплаты")
              .setEmoji("🖼️")
              .setStyle(ButtonStyle.Link),
            new ButtonBuilder()
              .setCustomId("subs-renewal-approve")
              .setLabel("Продлить")
              .setEmoji("✅")
              .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
              .setCustomId("subs-renewal-deny")
              .setLabel("Не продлевать")
              .setEmoji("❎")
              .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
              .setCustomId("subs-renewal-close")
              .setLabel("Закрыть")
              .setEmoji("⛔")
              .setStyle(ButtonStyle.Secondary)
          );

          subscriptionRenewalCheckChannel.send({
            content: `<@&${COMPANY_OWNER_ROLE_ID}>`,
            embeds: [renewalRequestEmbed],
            components: [renewalRequestRow],
          });

          interaction.editReply({ embeds: [renewalRequestResponseEmbed] });
        })
        .catch((error) => interaction.editReply(error.message));

      break;
    }
  }
}
