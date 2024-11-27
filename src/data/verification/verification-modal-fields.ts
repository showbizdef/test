import { TextInputStyle } from "discord.js";

export const verificationModalFields = [
  { id: "nickname-input", name: "Ваш никнейм", style: TextInputStyle.Short, placeholder: "Dagon Edge", required: true },
  {
    id: "screenshot-input",
    name: "Скриншот статистики (/stats + /time)",
    style: TextInputStyle.Short,
    placeholder: "Ссылка на изображение",
    required: true,
  },
];
