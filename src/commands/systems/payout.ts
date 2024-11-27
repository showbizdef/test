import type { CommandData, SlashCommandProps, CommandOptions } from "commandkit";
import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  EmbedBuilder,
  Role,
  TextChannel,
} from "discord.js";

import Payout from "@schemas/Payout";
import ManagementMember, { IManagementMember } from "@schemas/ManagementMember";

import { isValidDateFormat } from "@utils/is-valid-date-format";

import { WITHDRAWAL_PERCENT } from "@constants/payment";
import { COMPANY_DIRECTOR_ROLE_ID, COMPANY_DEPUTY_DIRECTOR_ROLE_ID } from "@constants/roles";
import { PROMOTION_LOG_CHANNEL_ID } from "@constants/channels";

import { formatNumber } from "@utils/format-number";
import { isValidGuap } from "@utils/is-valid-guap";
import { hasRole } from "@utils/roles/hasRole";

export const data: CommandData = {
  name: "payout",
  description: "Perform operations with your sales",
  options: [
    {
      name: "get",
      description: "Gets a list of sales",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "date",
          description: "Choose a specific sales date (eg. 01/10/2023)",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
      ],
    },
    {
      name: "create",
      description: "Creates a special payment message",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "amount",
          description: "Payment amount",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
        {
          name: "purpose",
          description: "Indicate a payment purpose",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
    },
    {
      name: "delete",
      description: "Deletes a specific payment by message id",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "message-id",
          description: "Sale's messageId",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
    },
  ],
};

export async function run({ interaction, client, handler }: SlashCommandProps) {
  if (!interaction.inCachedGuild()) return;

  function getTodayStart() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  function getTomorrowStart() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  }

  async function calculateShares(
    interaction: ChatInputCommandInteraction,
    member: IManagementMember,
    totalSales: number,
    date: Date
  ) {
    if (!interaction.inCachedGuild()) return;

    const formattedTotalSales = formatNumber(totalSales.toString());
    const formattedSharesPercent = formatNumber(Math.floor(totalSales * member.shares_pct).toString());
    const formattedWithdrawalPercent = formatNumber(
      Math.floor(formattedSharesPercent - formattedSharesPercent * WITHDRAWAL_PERCENT).toString()
    );

    const formattedDate = `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`;

    const payoutEmbed = new EmbedBuilder()
      .setTitle("💰 Выплата средств")
      .setDescription(`Выплата средств игроку ${interaction.user} за ${formattedDate}.`)
      .setFields([
        { name: "Общая сумма", value: `${formattedTotalSales.toLocaleString()}$`, inline: true },
        {
          name: `Доля (${Math.floor(member.shares_pct * 100)}%)`,
          value: `${formattedSharesPercent.toLocaleString()}$`,
          inline: true,
        },
        { name: "Сумма с -5%", value: `${formattedWithdrawalPercent.toLocaleString()}$` },
      ])
      .setTimestamp()
      .setFooter({
        text: interaction.member.user.id,
        iconURL: interaction.member.user.displayAvatarURL(),
      });

    const payoutRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("payout-done")
        .setLabel("Выплачено")
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("✅")
    );

    await interaction.channel?.send({ embeds: [payoutEmbed], components: [payoutRow] });

    await interaction.editReply(`🟢 Сообщение для выплаты средств успешно отправлено в канал ${interaction.channel}.`);
  }

  async function createCustomPayout(
    interaction: ChatInputCommandInteraction,
    amount: string,
    purpose: string,
    date: Date
  ) {
    if (!interaction.inCachedGuild()) return;
    if (!isValidGuap(amount))
      return interaction.editReply(
        `🔴 Вы неверно указали значение в поле \`Сколько забашлял?\`, проверьте ещё раз и исправьте ошибку. Поле должно состоять только из цифр и может включать в себя знак доллара ($) в конце. Разделять сумму можно символами: точка (.), запятая (,) и пробелом.`
      );

    const formattedAmount = formatNumber(amount);
    const formattedWithdrawalPercent = formatNumber(
      Math.floor(formattedAmount - formattedAmount * WITHDRAWAL_PERCENT).toString()
    );

    const formattedDate = `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`;

    const payoutEmbed = new EmbedBuilder()
      .setTitle("💰 Выплата средств")
      .setDescription(`Выплата средств игроку ${interaction.user} за ${formattedDate}.`)
      .setFields([
        { name: "Сумма", value: `${formattedAmount.toLocaleString()}$`, inline: true },
        { name: "Сумма с -5%", value: `${formattedWithdrawalPercent.toLocaleString()}$`, inline: true },
        { name: "Назначение средств", value: purpose },
      ])
      .setTimestamp()
      .setFooter({
        text: interaction.member.user.id,
        iconURL: interaction.member.user.displayAvatarURL(),
      });

    const payoutRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("payout-done")
        .setLabel("Выплачено")
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("✅")
    );

    await interaction.channel?.send({ embeds: [payoutEmbed], components: [payoutRow] });
    await interaction.editReply(`🟢 Сообщение для выплаты средств успешно отправлено в канал ${interaction.channel}.`);
  }

  switch (interaction.options.getSubcommand()) {
    case "get": {
      await interaction.deferReply({ ephemeral: true });

      if (!(hasRole(interaction, COMPANY_DIRECTOR_ROLE_ID) || hasRole(interaction, COMPANY_DEPUTY_DIRECTOR_ROLE_ID)))
        throw new Error("🔴 У Вас нет доступа.");

      // дата, введённая пользователем
      const date = interaction.options.getString("date");

      try {
        let startDate: Date, endDate: Date;

        if (!date) {
          startDate = getTodayStart();
          endDate = getTomorrowStart();
        } else if (isValidDateFormat(date)) {
          const [day, month, year] = date.split("/").map(Number);
          startDate = new Date(year, month - 1, day);
          endDate = new Date(year, month - 1, day + 1);
        } else {
          return interaction.editReply(
            "🔴 Вы ввели некорректный формат даты. Корректным форматом считается: `ДД/ММ/ГГГГ`."
          );
        }

        const sales = await Payout.find({
          userId: interaction.user.id,
          date: {
            $gte: startDate.toISOString(),
            $lt: endDate.toISOString(),
          },
        });

        const totalSales = sales.reduce((accumulator, currentValue) => accumulator + currentValue.payout, 0);

        const managementMember = await ManagementMember.findOne({ userId: interaction.user.id })
          .then((member) => {
            if (!member) throw new Error("🔴 Указанный Вами пользователь не был найден в базе данных.");
            if (sales.length === 0) throw new Error("🔴 Не найдено продаж за указанный период.");

            calculateShares(interaction, member, totalSales, startDate);
          })
          .catch((error) => {
            interaction.editReply(error.message);
          });
      } catch (error) {
        await interaction.editReply(error.message);
      }

      break;
    }
    case "create": {
      try {
        await interaction.deferReply({ ephemeral: true });

        const amount = interaction.options.getString("amount")!;
        const purpose = interaction.options.getString("purpose")!;

        const date = new Date();

        await createCustomPayout(interaction, amount, purpose, date);
      } catch (error) {
        console.error(error);
        await interaction.editReply("🔴 Ошибка при обработке запроса.");
      }
      break;
    }
    case "delete": {
      try {
        await interaction.deferReply({ ephemeral: true });

        const messageId = interaction.options.getString("message-id")!;
        const promotionLogChannel = interaction.guild.channels.cache.get(PROMOTION_LOG_CHANNEL_ID);

        if (!promotionLogChannel || !(promotionLogChannel instanceof TextChannel)) {
          return interaction.editReply("🔴 Не удалось найти канал для логов повышения.");
        }

        const message = await promotionLogChannel.messages.fetch(messageId);

        if (!message) {
          return interaction.editReply(`Не удалось найти и удалить сообщение с ID ${messageId}.`);
        }

        const deleteResult = await Payout.deleteOne({ userId: interaction.user.id, messageId: messageId });

        if (deleteResult.deletedCount === 0) {
          return interaction.editReply("🔴 Запись не найдена в базе данных.");
        } else {
          await message.delete();
          await interaction.editReply("🟢 Запись повышения в базе данных и сообщение успешно удалены.");
        }
      } catch (error) {
        console.error(error);
        await interaction.editReply("🔴 Произошла ошибка при удалении сообщения и записи повышения.");
      }

      break;
    }
  }
}

export const options: CommandOptions = {
  guildOnly: true,
  userPermissions: ["Administrator"],
  deleted: false,
};
