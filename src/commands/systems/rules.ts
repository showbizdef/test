import Configuration from "@schemas/Configuration";
import type { CommandData, SlashCommandProps, CommandOptions } from "commandkit";
import { ApplicationCommandOptionType } from "discord.js";

export const data: CommandData = {
  name: "rules",
  description: "Система правил",
  options: [
    {
      name: "add",
      description: "Добавление правила",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "category",
          description: "Категория, к которой относится добавляемое правило",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
        {
          name: "rule",
          description: "Новое правило",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
    },
    {
      name: "message",
      description: "Управление сообщением с правилами",
      type: ApplicationCommandOptionType.SubcommandGroup,
      options: [
        {
          name: "create",
          description: "Создание сообщения с правилами",
          type: ApplicationCommandOptionType.Subcommand,
        },
        {
          name: "update",
          description: "Обновление сообщения с правилами",
          type: ApplicationCommandOptionType.Subcommand,
        },
      ],
    },
  ],
};

export async function run({ interaction, client, handler }: SlashCommandProps) {
  if (!interaction.inCachedGuild()) return;

  switch (interaction.options.getSubcommand()) {
    case "add": {
      await interaction.deferReply({ ephemeral: true });
      break;
    }
  }

  switch (interaction.options.getSubcommandGroup()) {
    case "message": {
      switch (interaction.options.getSubcommand()) {
        case "create": {
          await interaction.deferReply({ ephemeral: true });

          Configuration.findOne({ guildId: interaction.guildId })
            .then((document) => {
              if (!document)
                throw new Error(
                  `🔴 Бот не проинициализирован на сервере. Воспользуйтесь командой </init:1162414777369362492>.`
                );
            })
            .catch((error) => interaction.editReply(error.message));
          break;
        }
        case "update": {
          await interaction.deferReply({ ephemeral: true });

          Configuration.findOne({ guildId: interaction.guildId })
            .then((document) => {
              if (!document)
                throw new Error(
                  `🔴 Бот не проинициализирован на сервере. Воспользуйтесь командой </init:1162414777369362492>.`
                );
            })
            .catch((error) => interaction.editReply(error.message));
          break;
        }
      }
      break;
    }
  }
}

export const options: CommandOptions = {
  devOnly: true,
  guildOnly: true,
  userPermissions: ["Administrator"],
  deleted: true,
};
