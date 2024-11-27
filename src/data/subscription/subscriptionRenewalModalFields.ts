import { TextInputStyle } from "discord.js";

export const subscriptionRenewalModalFields = [
  {
    id: "renewal-nickname-input",
    label: "Игровой никнейм",
    placeholder: "Dagon Edge",
    style: TextInputStyle.Short,
    required: true,
  },
  {
    id: "renewal-payment-input",
    label: "Скриншот оплаты",
    placeholder: "Ссылка на изображение (https://imgur.com/)",
    style: TextInputStyle.Short,
    required: true,
  },
];
