import type { CommandData, SlashCommandProps, CommandOptions } from "commandkit";
import Configuration from "@schemas/Configuration";

export const data: CommandData = {
  name: "init",
  description: "Инцициализация бота на сервере, создание конфигурационной записи в базе данных",
};

export async function run({ interaction, client, handler }: SlashCommandProps) {
  if (!interaction.inCachedGuild()) return;

  await interaction.deferReply({ ephemeral: true });

  await Configuration.findOne({ guildId: interaction.guild.id })
    .then((document) => {
      if (document) throw new Error(`🔴 Бот уже проинициализирован на данном сервере.`);

      const newConfiguration = new Configuration({ guildId: interaction.guild.id })
        .save()
        .then(() => interaction.editReply("🟢 Бот успешно зарегистрирован на сервере и готов к работе."))
        .catch((error) => interaction.editReply(`🔴 Произошла ошибка.\n\n\`\`\`${error}\`\`\``));
    })
    .catch((error) => interaction.editReply(error.message));
}

export const options: CommandOptions = {
  guildOnly: true,
  userPermissions: ["Administrator"],
  deleted: false,
};
