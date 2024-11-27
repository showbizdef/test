import { ButtonStyle } from "discord.js";

export const subscriptionRenewalCheckButtons = [
  {
    id: "subs-renewal-screenshot",
    label: "Скриншот",
    emoji: "🖼️",
    style: ButtonStyle.Secondary,
  },
  {
    id: "subs-renewal-approve",
    label: "Продлить",
    emoji: "✅",
    style: ButtonStyle.Secondary,
  },
  {
    id: "subs-renewal-deny",
    label: "Не продлевать",
    emoji: "❎",
    style: ButtonStyle.Secondary,
  },
  {
    id: "subs-renewal-close",
    label: "Закрыть",
    emoji: "⛔",
    style: ButtonStyle.Secondary,
  },
];
