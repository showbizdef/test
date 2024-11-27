import type { CommandData, SlashCommandProps, CommandOptions } from "commandkit";
import { APIEmbedField, ApplicationCommandOptionType, EmbedBuilder, TextChannel, User } from "discord.js";

import ManagementMember from "@schemas/ManagementMember";
import Configuration from "@schemas/Configuration";

import { COMPANY_OWNER_ROLE_ID, DISCORD_MASTER_ROLE_ID } from "@constants/roles";
import { capitalize } from "@utils/capitalize";
import { hasRole } from "@utils/roles/hasRole";

import {
  INTRODUCTION_EMBED_DESCRIPTION,
  INTRODUCTION_EMBED_TITLE,
  MANAGEMENT_EMBED_TITLE,
  OWNERS_EMBED_DESCRIPTION,
  OWNERS_EMBED_TITLE,
} from "@data/management/management-embeds";

export const data: CommandData = {
  name: "management",
  description: "Руководство страховой компании",
  options: [
    {
      name: "member",
      description: "Управление членами руководства",
      type: ApplicationCommandOptionType.SubcommandGroup,
      options: [
        {
          name: "add",
          description: "Добавить нового члена руководства",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "user",
              description: "Упомяните пользователя, которого хотите назначить",
              type: ApplicationCommandOptionType.User,
              required: true,
            },
            {
              name: "account-id",
              description: "UID аккаунты аризоны",
              type: ApplicationCommandOptionType.String,
              required: true,
            },
            {
              name: "nickname",
              description: "Игровой никнейм",
              type: ApplicationCommandOptionType.String,
              required: true,
            },
            {
              name: "position",
              description: "Ранг (9/10/11)",
              type: ApplicationCommandOptionType.Number,
              min_value: 9,
              max_value: 11,
              required: true,
            },
            {
              name: "responsibilities",
              description: "Обязанности",
              type: ApplicationCommandOptionType.String,
            },
          ],
        },
        {
          name: "remove",
          description: "Снять члена руководства",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "user",
              description: "Упомяните пользователя, которого хотите снять",
              type: ApplicationCommandOptionType.User,
              required: true,
            },
          ],
        },
        {
          name: "shares",
          description: "Определите процент доли члена руководства",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "user",
              description: "Упомяните пользователя, процент доли которого хотите изменить",
              type: ApplicationCommandOptionType.User,
              required: true,
            },
            {
              name: "percent",
              description: "Введите процент доли (от 0 до 100)",
              type: ApplicationCommandOptionType.Number,
              min_value: 0,
              max_value: 100,
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: "message",
      description: "Управление сообщением со списком руководящего состава",
      type: ApplicationCommandOptionType.SubcommandGroup,
      options: [
        {
          name: "create",
          description: "Создайте сообщение со списком руководящего состава",
          type: ApplicationCommandOptionType.Subcommand,
        },
      ],
    },
  ],
};

export async function run({ interaction, client, handler }: SlashCommandProps) {
  if (!interaction.inCachedGuild()) return;
  if (!(hasRole(interaction, COMPANY_OWNER_ROLE_ID) || hasRole(interaction, DISCORD_MASTER_ROLE_ID)))
    return interaction.reply({ content: "🔴 У Вас нет доступа.", ephemeral: true });

  switch (interaction.options.getSubcommandGroup()) {
    case "member": {
      switch (interaction.options.getSubcommand()) {
        case "add": {
          try {
            await interaction.deferReply({ ephemeral: true });

            const user: User = interaction.options.getUser("user")!;
            const accountId: string = interaction.options.getString("account-id")!;
            const nickname: string = interaction.options.getString("nickname")!;
            const position: number = interaction.options.getNumber("position")!;
            const responsibilities: string = interaction.options.getString("responsibilities") || "";

            const newManagementMember = new ManagementMember({
              userId: user.id,
              accountId,
              nickname,
              position,
              responsibilities,
            });

            await newManagementMember.save();
            
            const POSITIONS: { [key: number]: string } = {
              9: "заместителя директора",
              10: "директора",
              11: "владельца",
            };

            const formattedPosition = POSITIONS[position];

            interaction.editReply(
              `🟢 Вы успешно внесли ${user} в базу данных, как нового ${formattedPosition} компании.`
            );
          } catch (error) {
            interaction.editReply(
              `🔴 Произошла ошибка во время записи нового члена руководства. Отправьте следующую ошибку Вашему дискорд мастеру.\n\n\`\`\`${error}\`\`\``
            );
          }
          break;
        }
        case "remove": {
          try {
            await interaction.deferReply({ ephemeral: true });

            const user: User = interaction.options.getUser("user")!;
            const managementMember = await ManagementMember.findOneAndDelete({ userId: user.id });

            if (!managementMember?.value) {
              return interaction.editReply("🔴 Указанный Вами пользователь не был найден в базе данных.");
            }

            const deletedDocument = managementMember.value;

            const POSITIONS: { [key: number]: string } = {
              9: "заместитель",
              10: "лидер",
              11: "владелец",
            };

            const formattedPosition = capitalize(POSITIONS[deletedDocument.position]);

            interaction.editReply(
              `🟢 ${formattedPosition} <@${deletedDocument.userId}> был успешно удалён из базы данных.`
            );
          } catch (error) {
            interaction.editReply(`🔴 Произошла ошибка при удалении члена руководства: \`\`\`${error.message}\`\`\``);
          }
          break;
        }
        case "shares": {
          try {
            await interaction.deferReply({ ephemeral: true });

            const user: User = interaction.options.getUser("user")!;
            const percent: number = interaction.options.getNumber("percent")!;
            const member = await ManagementMember.findOneAndUpdate(
              { userId: user.id },
              { shares_pct: percent / 100 },
              { new: true }
            );

            if (!member) {
              return interaction.editReply("🔴 Указанный Вами пользователь не был найден в базе данных.");
            }

            const POSITIONS: { [key: number]: string } = {
              9: "заместителя директора",
              10: "директора",
              11: "владельца",
            };

            const position = POSITIONS[member.position];
            const userId = member.userId;

            interaction.editReply(
              `🟢 Процент ${position} <@${userId}> был успешно обновлён. Текущее значение: **${Math.floor(member.shares_pct * 100)}%**.`
            );
          } catch (error) {
            interaction.editReply(`🔴 Ошибка при обновлении доли: \`\`\`${error.message}\`\`\``);
          }
          break;
        }
      }
      break;
    }

    case "message": {
      switch (interaction.options.getSubcommand()) {
        case "create": {
          await interaction.deferReply({ ephemeral: true });

          const owners = await ManagementMember.find({ position: 11 });
          const director = await ManagementMember.findOne({ position: 10 });
          const deputies = await ManagementMember.find({ position: 9 });

          const directorField = {
            name: "Директор компании",
            value: `<@${director?.userId}> — ${director?.responsibilities}`,
          };

          const deputyFields = deputies.map((deputy) => ({
            name: "Заместитель компании",
            value: `<@${deputy.userId}> — ${deputy.responsibilities}`,
            inline: true,
          }));

          const fields: APIEmbedField[] = [directorField, ...deputyFields];

          Configuration.findOne({ guildId: interaction.guild.id })
            .then((document) => {
              if (!document) throw new Error(`🔴 Не удалось получить информацию из базы данных.`);
              if (!document.loggingChannelId)
                throw new Error(
                  `🔴 Канал для отображения списка руководства не установлен, воспользуйтесь командой </systems management setup:1162424704120934481>.`
                );

              const managementChannelId = document.managementChannelId;
              const managementChannel = interaction.guild.channels.cache.get(managementChannelId)! as TextChannel;

              const introductionEmbed = new EmbedBuilder()
                .setTitle(INTRODUCTION_EMBED_TITLE)
                .setDescription(INTRODUCTION_EMBED_DESCRIPTION)
                .setTimestamp()
                .setFooter({
                  text: interaction.client.user!.username,
                  iconURL: interaction.client.user!.displayAvatarURL(),
                })
                .addFields(fields);

              managementChannel.send({ embeds: [introductionEmbed] });
              interaction.editReply("🟢 Сообщение с актуальным списком руководства было отправлено.");
            })
            .catch((error) => {
              interaction.editReply(error.message);
            });
          break;
        }
      }
      break;
    }
  }
}
