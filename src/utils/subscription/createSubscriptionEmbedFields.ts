import { ISubscription } from "@schemas/Subscription";

export function createSubscriptionEmbedFields(subscriptions: ISubscription[]) {
  return subscriptions.map((member) => {
    const subscriptionStatusIcon: { [key: string]: string } = {
      продлена: "<:online_status:1163435053049724988>",
      "не продлена": "<:idle_status:1163435049983676436>",
    };
    const status = subscriptionStatusIcon[member.subscriptionStatus];
    return {
      name: "Подписка",
      value: `<@${member.userId}>\n\n<:offline_status:1163435906758344774> UID: **${member.accountId}**\n${status} Статус подписки: **${member.subscriptionStatus}**`,
      inline: true,
    };
  });
}
