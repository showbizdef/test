import type { CommandData, SlashCommandProps, CommandOptions } from "commandkit";
import { ActionRowBuilder, ApplicationCommandOptionType, ButtonBuilder, EmbedBuilder, TextChannel } from "discord.js";

import { EMBED_DESCRIPTION, EMBED_TITLE } from "@data/logging/logging-embed";
import { LOGGING_BUTTONS } from "@data/logging/logging-buttons";

import Configuration from "@schemas/Configuration";

export const data: CommandData = {
  name: "logging",
  description: "Система логирования",
  options: [
    {
      name: "message",
      description: "Управление специальным сообщением для логирования",
      type: ApplicationCommandOptionType.SubcommandGroup,
      options: [
        {
          name: "create",
          description: "Отправка специального сообщения в заданный канал логирования",
          type: ApplicationCommandOptionType.Subcommand,
        },
      ],
    },
  ],
};

export async function run({ interaction, client, handler }: SlashCommandProps) {
  if (!interaction.inCachedGuild()) return;

  switch (interaction.options.getSubcommandGroup()) {
    case "message": {
      switch (interaction.options.getSubcommand()) {
        case "create": {
          await interaction.deferReply({ ephemeral: true });

          Configuration.findOne({ guildId: interaction.guild.id })
            .then((document) => {
              if (!document) throw new Error(`🔴 Не удалось получить информацию из базы данных.`);
              if (!document.loggingChannelId)
                throw new Error(
                  `🔴 Канал для логирования не установлен, воспользуйтесь командой </systems logging setup:1162424704120934481>.`
                );

              const loggingChannelId = document.loggingChannelId;
              const loggingChannel = interaction.guild.channels.cache.get(loggingChannelId)! as TextChannel;

              const loggingEmbed = new EmbedBuilder()
                .setTitle(EMBED_TITLE)
                .setDescription(EMBED_DESCRIPTION)
                .setTimestamp()
                .setFooter({
                  text: interaction.client.user.username,
                  iconURL: interaction.client.user.displayAvatarURL(),
                });

              const buttons = LOGGING_BUTTONS.map(({ id, label, style, emoji }) =>
                new ButtonBuilder().setCustomId(id).setLabel(label).setStyle(style).setEmoji(emoji)
              );

              const buttonsPerRow = 2;
              const rows: ActionRowBuilder<ButtonBuilder>[] = [];
              for (let i: number = 0; i < buttons.length; i += buttonsPerRow) {
                const row = new ActionRowBuilder<ButtonBuilder>().addComponents(buttons.slice(i, i + buttonsPerRow));
                rows.push(row);
              }

              loggingChannel.send({ embeds: [loggingEmbed], components: rows });

              interaction.editReply(
                `🟢 Система логирования успешно установлена. Специальное сообщение для возможности логирования отправлено в канал ${loggingChannel}.`
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
  guildOnly: true,
  botPermissions: ["Administrator"],
  deleted: false,
};
