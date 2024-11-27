import { CommandKit } from "commandkit";
import { EmbedBuilder, TextChannel, type Client, type Interaction } from "discord.js";

import Payout from "@schemas/Payout";

import {
  PROMOTION_LOG_CHANNEL_ID,
  DISMISSAL_LOG_CHANNEL_ID,
  REPRIMAND_LOG_CHANNEL_ID,
  BLACKLIST_LOG_CHANNEL_ID,
} from "@constants/channels";

import { formatNumber } from "@utils/format-number";
import { isValidGuap } from "@utils/is-valid-guap";

export default async function (interaction: Interaction, client: Client<true>, handler: CommandKit) {
  if (!interaction.isModalSubmit()) return;
  if (!interaction.inCachedGuild()) return;

  switch (interaction.customId) {
    case "promotion-log-modal": {
      await interaction.deferReply({ ephemeral: true });

      const promotionLogChannel = interaction.client.channels.cache.get(PROMOTION_LOG_CHANNEL_ID) as TextChannel;

      const nickname = interaction.fields.getTextInputValue("nickname-input");
      const fromRank = interaction.fields.getTextInputValue("from-rank-input");
      const toRank = interaction.fields.getTextInputValue("to-rank-input");
      const guap = interaction.fields.getTextInputValue("guap-input");
      const addInfo = interaction.fields.getTextInputValue("ainfo-input");

      if (!isValidGuap(guap)) {
        await interaction.editReply(
          `🤨 Вы неверно указали значение в поле \`Сколько забашлял?\`, проверьте ещё раз и исправьте ошибку. Поле должно состоять только из цифр, точки (.), запятой (,) и знака доллара ($).`
        );
        return;
      }

      const formattedGuap = formatNumber(guap).toLocaleString();

      const embed = new EmbedBuilder()
        .setTitle(`🟢 Повышение игрока ${nickname}`)
        .setDescription(
          `Игрок **${nickname}** был повышен ${
            +fromRank === 2 ? "со" : "с"
          } **${fromRank}-й** порядковой должности на **${toRank}-ю**, пополнив благосостояние нашей казны на сумму в размере **${formattedGuap}$**.`
        )
        .setFields([
          { name: "Доп. информация", value: addInfo === "" ? "Отсутствует" : addInfo, inline: true },
          { name: "Повысил(-а)", value: `${interaction.user}`, inline: true },
        ])
        .setTimestamp()
        .setFooter({
          text: interaction.client.user.username,
          iconURL: interaction.client.user.displayAvatarURL(),
        });

      try {
        await promotionLogChannel.send({
          embeds: [embed],
        });

        const date = new Date();
        date.setHours(date.getHours() + 3);

        const sale = new Payout({
          userId: interaction.user.id,
          messageId: promotionLogChannel.lastMessageId,
          payout: formatNumber(guap),
          date: date,
        });

        await sale.save();

        await interaction.editReply(`🟢 Вы успешно заполнили лог повышения игрока ${nickname}!`);
      } catch (error) {
        await interaction.editReply(`Произошла ошибка: ${error}.`);
        console.error(error);
      }

      break;
    }
    case "dismissal-log-modal": {
      await interaction.deferReply({ ephemeral: true });

      const dismissalLogChannel = interaction.client.channels.cache.get(DISMISSAL_LOG_CHANNEL_ID) as TextChannel;

      const nickname = interaction.fields.getTextInputValue("nickname-input");
      const reason = interaction.fields.getTextInputValue("reason-input");

      const embed = new EmbedBuilder()
        .setTitle(`🔴 Увольнение игрока ${nickname}`)
        .setDescription(`Игрок **${nickname}** был уволен.`)
        .setFields([
          { name: "Причина", value: reason, inline: true },
          { name: "Уволил(-а)", value: `${interaction.user}`, inline: true },
        ])
        .setTimestamp()
        .setFooter({
          text: interaction.client.user.username,
          iconURL: interaction.client.user.displayAvatarURL(),
        });

      await dismissalLogChannel.send({
        embeds: [embed],
      });

      await interaction.editReply(`🟢 Вы успешно заполнили лог увольнения игрока ${nickname}!`);

      break;
    }
    case "reprimand-assign-log-modal": {
      await interaction.deferReply({ ephemeral: true });

      const reprimandLogChannel = interaction.client.channels.cache.get(REPRIMAND_LOG_CHANNEL_ID) as TextChannel;

      const nickname = interaction.fields.getTextInputValue("nickname-input");
      const reason = interaction.fields.getTextInputValue("reason-input");

      const embed = new EmbedBuilder()
        .setTitle(`🟠 Выдача выговора игроку ${nickname}`)
        .setDescription(`Игроку **${nickname}** был выдан выговор.`)
        .setFields([
          { name: "Причина", value: reason, inline: true },
          { name: "Выдал(-а)", value: `${interaction.user}`, inline: true },
        ])
        .setTimestamp()
        .setFooter({
          text: interaction.client.user.username,
          iconURL: interaction.client.user.displayAvatarURL(),
        });

      await reprimandLogChannel.send({
        embeds: [embed],
      });

      await interaction.editReply(`🟢 Вы успешно заполнили лог выдачи выговора игроку ${nickname}!`);

      break;
    }
    case "reprimand-remove-log-modal": {
      await interaction.deferReply({ ephemeral: true });

      const reprimandLogChannel = interaction.client.channels.cache.get(REPRIMAND_LOG_CHANNEL_ID) as TextChannel;

      const nickname = interaction.fields.getTextInputValue("nickname-input");
      const guap = interaction.fields.getTextInputValue("guap-input");

      if (!isValidGuap(guap)) {
        return await interaction.editReply(
          `🤨 Вы неверно указали значение в поле \`Сколько забашлял?\`, проверьте ещё раз и исправьте ошибку. Поле должно состоять только из цифр, точки (.), запятой (,) и знака доллара ($).`
        );
      }

      const formattedGuap = formatNumber(guap).toLocaleString();

      const embed = new EmbedBuilder()
        .setTitle(`🟠 Снятие выговора игроку ${nickname}`)
        .setDescription(
          `Игроку **${nickname}** был снят выговор, пополнив благосостояние нашей казны на сумму в размере **${formattedGuap}$**.`
        )
        .setFields([{ name: "Снял(-а)", value: `${interaction.user}` }])
        .setTimestamp()
        .setFooter({
          text: interaction.client.user.username,
          iconURL: interaction.client.user.displayAvatarURL(),
        });

      await reprimandLogChannel.send({
        embeds: [embed],
      });

      await interaction.editReply(`🟢 Вы успешно заполнили лог снятия выговора игроку ${nickname}!`);

      break;
    }
    case "blacklist-assign-log-modal": {
      await interaction.deferReply({ ephemeral: true });

      const blacklistLogChannel = interaction.client.channels.cache.get(BLACKLIST_LOG_CHANNEL_ID) as TextChannel;

      const nickname = interaction.fields.getTextInputValue("nickname-input");
      const reason = interaction.fields.getTextInputValue("reason-input");
      const reinstatement = interaction.fields.getTextInputValue("reinstatement-input");

      const embed = new EmbedBuilder()
        .setTitle(`⚫ Занесение в чёрный список игрока ${nickname}`)
        .setDescription(
          `Игрок **${nickname}** был занесён в чёрный список ${
            reinstatement.toLowerCase() === "да" ? "с возможностью восстановления" : "без возможности восстановления"
          }.`
        )
        .setFields([
          { name: "Причина", value: reason, inline: true },
          { name: "Занес(-ла)", value: `${interaction.user}`, inline: true },
        ])
        .setTimestamp()
        .setFooter({
          text: interaction.client.user.username,
          iconURL: interaction.client.user.displayAvatarURL(),
        });

      await blacklistLogChannel.send({
        embeds: [embed],
      });

      await interaction.editReply(`🟢 Вы успешно заполнили лог занесения в чёрный список игрока ${nickname}!`);

      break;
    }
    case "blacklist-remove-log-modal": {
      await interaction.deferReply({ ephemeral: true });

      const blacklistLogChannel = interaction.client.channels.cache.get(BLACKLIST_LOG_CHANNEL_ID) as TextChannel;

      const nickname = interaction.fields.getTextInputValue("nickname-input");
      const guap = interaction.fields.getTextInputValue("guap-input");

      if (!isValidGuap(guap)) {
        return await interaction.editReply(
          `🤨 Вы неверно указали значение в поле \`Сколько забашлял?\`, проверьте ещё раз и исправьте ошибку. Поле должно состоять только из цифр, точки (.), запятой (,) и знака доллара ($).`
        );
      }

      const formattedGuap = formatNumber(guap).toLocaleString();

      const embed = new EmbedBuilder()
        .setTitle(`⚫ Вынос из чёрного списка игрока ${nickname}`)
        .setDescription(
          `Игрок **${nickname}** был вынесен из чёрного списка, пополнив благосостояние нашей казны на сумму в размере ${formattedGuap}$.`
        )
        .setFields([{ name: "Вынес(-ла)", value: `${interaction.user}` }])
        .setTimestamp()
        .setFooter({
          text: interaction.client.user.username,
          iconURL: interaction.client.user.displayAvatarURL(),
        });

      await blacklistLogChannel.send({
        embeds: [embed],
      });

      await interaction.editReply(`🟢 Вы успешно заполнили лог выноса из чёрного списка игрока ${nickname}!`);

      break;
    }
  }
}
