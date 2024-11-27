import { TextInputStyle } from "discord.js";

export const promotionLogModalFields = [
  {
    id: "nickname-input",
    name: "Никнейм, кого повысили",
    style: TextInputStyle.Short,
    placeholder: "Katsu Edge",
    required: true,
  },
  {
    id: "from-rank-input",
    name: "С какой порядковой должности был повышен?",
    style: TextInputStyle.Short,
    placeholder: "1",
    required: true,
  },
  {
    id: "to-rank-input",
    name: "До какой порядковой должности был повышен?",
    style: TextInputStyle.Short,
    placeholder: "2",
    required: true,
  },
  { id: "guap-input", name: "Сколько забашлял?", style: TextInputStyle.Short, placeholder: "5000000", required: true },
  {
    id: "ainfo-input",
    name: "Доп. информация (опционально)",
    style: TextInputStyle.Short,
    placeholder: "Закинул Katsu Edge",
    required: false,
  },
];

export const dismissalLogModalFields = [
  {
    id: "nickname-input",
    name: "Никнейм, кого уволили",
    style: TextInputStyle.Short,
    placeholder: "Dagon Edge",
    required: true,
  },
  {
    id: "reason-input",
    name: "Причина увольнения",
    style: TextInputStyle.Paragraph,
    placeholder: "Косякнул не по-детски",
    required: true,
  },
];

export const reprimandAssignModalFields = [
  {
    id: "nickname-input",
    name: "Никнейм, кому был выдан выговор",
    style: TextInputStyle.Short,
    placeholder: "Dagon Edge",
    required: true,
  },
  {
    id: "reason-input",
    name: "Причина выдачи выговора",
    style: TextInputStyle.Short,
    placeholder: "Играл в Brawl Stars в холле",
    required: true,
  },
];

export const reprimandRemoveModalFields = [
  {
    id: "nickname-input",
    name: "Никнейм, кому был снят выговор",
    style: TextInputStyle.Short,
    placeholder: "Dagon Edge",
    required: true,
  },
  { id: "guap-input", name: "Сколько забашлял?", style: TextInputStyle.Short, placeholder: "6000000", required: true },
];

export const blacklistAssignModalFields = [
  {
    id: "nickname-input",
    name: "Никнейм, кто был занесён в чёрный список",
    style: TextInputStyle.Short,
    placeholder: "Dagon Edge",
    required: true,
  },
  {
    id: "reason-input",
    name: "Причина занесения",
    style: TextInputStyle.Short,
    placeholder: "Украл казну",
    required: true,
  },
  {
    id: "reinstatement-input",
    name: "С возможностью восстановления? (Да/Нет)",
    style: TextInputStyle.Short,
    placeholder: "Нет",
    required: true,
  },
];

export const blacklistRemoveModalFields = [
  {
    id: "nickname-input",
    name: "Никнейм, кто был вынесен из чёрного списка",
    style: TextInputStyle.Short,
    placeholder: "Dagon Edge",
    required: true,
  },
  { id: "guap-input", name: "Сколько забашлял?", style: TextInputStyle.Short, placeholder: "30000000", required: true },
];
