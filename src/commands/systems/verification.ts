import type { CommandData, SlashCommandProps, CommandOptions } from "commandkit";
import { ActionRowBuilder, ApplicationCommandOptionType, ButtonBuilder, EmbedBuilder, TextChannel } from "discord.js";

import { EMBED_DESCRIPTION, EMBED_TITLE } from "@data/verification/verification-embed";
import { BUTTON_EMOJI, BUTTON_ID, BUTTON_LABEL, BUTTON_STYLE } from "@data/verification/verification-button";

import Configuration from "@schemas/Configuration";

export const data: CommandData = {
  name: "verification",
  description: "Система верификации",
  options: [
    {
      name: "message",
      description: "Управление специальным сообщением для верификации",
      type: ApplicationCommandOptionType.SubcommandGroup,
      options: [
        {
          name: "create",
          description: "Отправка специального сообщения в заданный канал верификации",
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
              if (!document.verificationChannelId)
                throw new Error(
                  `🔴 Канал для верификации не установлен, воспользуйтесь командой </systems verification setup:1162424704120934481>.`
                );

              const verificationChannelId = document.verificationChannelId;
              const verificationChannel = interaction.guild.channels.cache.get(verificationChannelId)! as TextChannel;

              const verificationEmbed = new EmbedBuilder()
                .setTitle(EMBED_TITLE)
                .setDescription(EMBED_DESCRIPTION)
                .setTimestamp()
                .setFooter({
                  text: interaction.client.user.username,
                  iconURL: interaction.client.user.displayAvatarURL(),
                });

              const verificationButton = new ButtonBuilder()
                .setCustomId(BUTTON_ID)
                .setLabel(BUTTON_LABEL)
                .setStyle(BUTTON_STYLE)
                .setEmoji(BUTTON_EMOJI);

              const verificationButtonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(verificationButton);

              verificationChannel.send({ embeds: [verificationEmbed], components: [verificationButtonRow] });

              interaction.editReply(
                `🟢 Система верификации установлена. Специальное сообщение для возможности верификации отправлено в канал ${verificationChannel}.`
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
