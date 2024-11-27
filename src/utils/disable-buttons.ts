import { ActionRowBuilder, ButtonBuilder, ButtonComponent } from "discord.js";

export const disableButtons = (buttons: ButtonComponent[]) => {
  let updatedRow = new ActionRowBuilder<ButtonBuilder>();
  const components = [];

  for (const button of buttons) {
    components.push(
      button.label === "Скриншот оплаты" ? ButtonBuilder.from(button) : ButtonBuilder.from(button).setDisabled(true)
    );
    updatedRow.setComponents(components);
  }

  return updatedRow;
};
