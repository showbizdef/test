import { ButtonStyle } from "discord.js";

export const LOGGING_BUTTONS = [
  { id: "promotion-log-button", label: "Повышение", style: ButtonStyle.Secondary, emoji: "🟢" },
  { id: "dismissal-log-button", label: "Увольнение", style: ButtonStyle.Secondary, emoji: "🔴" },
  { id: "reprimand-assign-log-button", label: "Выдача выговора", style: ButtonStyle.Secondary, emoji: "🟠" },
  { id: "reprimand-remove-log-button", label: "Снятие выговора", style: ButtonStyle.Secondary, emoji: "🟠" },
  { id: "blacklist-assign-log-button", label: "Занесение в чёрный список", style: ButtonStyle.Secondary, emoji: "⚫" },
  { id: "blacklist-remove-log-button", label: "Вынос из чёрного списка", style: ButtonStyle.Secondary, emoji: "⚫" },
];
