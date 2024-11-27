import {
  BaseInteraction,
  CommandInteraction,
  Embed,
  EmbedBuilder,
  EmbedField,
  GuildBasedChannel,
  TextChannel,
} from "discord.js";

import Configuration from "@schemas/Configuration";
import { ISubscription } from "@schemas/Subscription";

import { getChannel } from "@utils/channels/getChannel";
import { getSubscriptions } from "@utils/subscription/getSubscriptions";
import { createSubscriptionEmbedFields } from "@utils/subscription/createSubscriptionEmbedFields";

import {
  TIER_EIGHT_EMBED_TITLE,
  TIER_EIGHT_SUBSCRIPTION_LIMIT,
  TIER_SEVEN_EMBED_TITLE,
  TIER_SEVEN_SUBSCRIPTION_LIMIT,
} from "@data/subscription/subscriptionListEmbed";

export async function updateSubscriptionMessage(interaction: CommandInteraction | BaseInteraction) {
  if (!interaction.inCachedGuild()) return;

  // получаем конфигурационный документ из базы данных
  const document = await Configuration.findOne({ guildId: interaction.guildId });

  if (!document) {
    throw new Error("🔴 Бот не проинициализирован на сервере. Воспользуйтесь командой </init:1162414777369362492>.");
  }

  // получаем подписки на 7-8 ранги
  const [tierSevenSubscriptions, tierEightSubscriptions]: ISubscription[][] = await getSubscriptions();

  // получаем канал со списком подписок
  const subscriptionListChannel: GuildBasedChannel | undefined = getChannel(
    interaction,
    document.subscriptionListChannelId
  );

  if (!subscriptionListChannel) {
    throw new Error("🔴 Канал не найден.");
  }

  if (!(subscriptionListChannel instanceof TextChannel)) {
    throw new Error(
      `🔴 Вы не можете изменить сообщение в канале ${subscriptionListChannel}, так как это не текстовый канал.`
    );
  }

  // получаем последнее сообщение из канала со списком подписок
  const subscriptionsListChannelLastMessageId: string | null = subscriptionListChannel.lastMessageId;

  if (!subscriptionsListChannelLastMessageId) {
    throw new Error(
      `🔴 Сообщение со списком не найдено. Проверьте нет ли в канале ${subscriptionListChannel} других сообщений, кроме сообщения со списком от ${interaction.client.user}.`
    );
  }

  // получаем сообщение со списком
  const subscriptionsListMessage = await subscriptionListChannel.messages.fetch(subscriptionsListChannelLastMessageId);

  // получаем ембеды из последнего сообщения
  const [firstEmbed, secondEmbed, thirdEmbed]: Embed[] = subscriptionsListMessage.embeds;

  // по новой создаём поля подписок (обновление)
  const secondEmbedFields = createSubscriptionEmbedFields(tierSevenSubscriptions);
  const thirdEmbedFields = createSubscriptionEmbedFields(tierEightSubscriptions);

  // обновляем второй ембед (7 ранги)
  const updatedSecondEmbed = createUpdatedEmbed(
    secondEmbed,
    TIER_SEVEN_EMBED_TITLE,
    tierSevenSubscriptions.length,
    TIER_SEVEN_SUBSCRIPTION_LIMIT,
    secondEmbedFields,
    interaction.client.user.displayAvatarURL()
  );

  // обновляем третий ембед (8 ранги)
  const updatedThirdEmbed = createUpdatedEmbed(
    thirdEmbed,
    TIER_EIGHT_EMBED_TITLE,
    tierEightSubscriptions.length,
    TIER_EIGHT_SUBSCRIPTION_LIMIT,
    thirdEmbedFields,
    interaction.client.user.displayAvatarURL()
  );

  // редактируем сообщение со списком
  await subscriptionsListMessage.edit({ embeds: [firstEmbed, updatedSecondEmbed, updatedThirdEmbed] });
}

function createUpdatedEmbed(
  oldEmbed: Embed,
  title: string,
  subscriptionCount: number,
  subscriptionLimit: number,
  fields: EmbedField[],
  iconURL: string
): EmbedBuilder {
  return EmbedBuilder.from(oldEmbed)
    .setTitle(`${title} | ${subscriptionCount}/${subscriptionLimit}`)
    .setFields(fields)
    .setTimestamp()
    .setFooter({ text: "Последнее обновление", iconURL });
}
