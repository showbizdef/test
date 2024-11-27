import type { CommandData, SlashCommandProps, CommandOptions } from "commandkit";
import { ApplicationCommandOptionType, TextChannel } from "discord.js";

import Configuration from "@schemas/Configuration";
import { hasRole } from "@utils/roles/hasRole";
import { COMPANY_OWNER_ROLE_ID, DISCORD_MASTER_ROLE_ID } from "@constants/roles";

export const data: CommandData = {
  name: "systems",
  description: "Управление системами сервера",
  options: [
    {
      name: "verification",
      description: "Управление системой верификации",
      type: ApplicationCommandOptionType.SubcommandGroup,
      options: [
        {
          name: "setup",
          description: "Установка канала для системы верификации",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "channel",
              description: "Канал, в котором вы хотите установить систему верификации",
              type: ApplicationCommandOptionType.Channel,
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: "logging",
      description: "Управление системой логирования",
      type: ApplicationCommandOptionType.SubcommandGroup,
      options: [
        {
          name: "setup",
          description: "Установка канала для системы логирования",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "channel",
              description: "Канал, в котором вы хотите установить систему верификации",
              type: ApplicationCommandOptionType.Channel,
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: "management",
      description: "Управление системой руководства",
      type: ApplicationCommandOptionType.SubcommandGroup,
      options: [
        {
          name: "setup",
          description: "Установка канала для отображения списка руководящего состава",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "channel",
              description: "Канал, в котором вы хотите установить систему руководства",
              type: ApplicationCommandOptionType.Channel,
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: "subscription",
      description: "Управление системой подписки",
      type: ApplicationCommandOptionType.SubcommandGroup,
      options: [
        {
          name: "setup",
          description: "Установка каналов для системы ежемесячной подписки",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "list-channel",
              description: "Установите канал для отображения списка игроков купивших подписку",
              type: ApplicationCommandOptionType.Channel,
              required: true,
            },
            {
              name: "renewal-channel",
              description: "Установите канал для специального сообщения с возможностью продления подписки",
              type: ApplicationCommandOptionType.Channel,
              required: true,
            },
            {
              name: "renewal-check-channel",
              description: "Установите канал, куда будут попадать заявления для продления подписки",
              type: ApplicationCommandOptionType.Channel,
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: "rules",
      description: "Управление правилами",
      type: ApplicationCommandOptionType.SubcommandGroup,
      options: [
        {
          name: "setup",
          description: "Установка канала для правил",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "channel",
              description: "Установите канал, где будут находиться правила",
              type: ApplicationCommandOptionType.Channel,
              required: true,
            },
          ],
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
    case "verification": {
      switch (interaction.options.getSubcommand()) {
        case "setup": {
          await interaction.deferReply({ ephemeral: true });

          const channel = interaction.options.getChannel("channel")!;

          await Configuration.findOne({ guildId: interaction.guild.id })
            .then((document) => {
              if (!document)
                throw new Error(
                  `🔴 Бот не проинициализирован на сервере. Воспользуйтесь командой </init:1162414777369362492>.`
                );
              if (!(channel instanceof TextChannel))
                throw new Error(`🔴 Вы не можете установить систему верификации в канале ${channel}.`);

              document.verificationChannelId = channel.id;
              document
                .save()
                .then(() =>
                  interaction.editReply(
                    `🟢 Вы успешно установили канал ${channel} в качестве канала для системы верификации.`
                  )
                )
                .catch((error) =>
                  interaction.editReply(
                    `🔴 Произошла ошибка во время сохранения идентификатора канала в базе данных.\n\n\`\`\`${error}\`\`\``
                  )
                );
            })
            .catch((error) => interaction.editReply(error.message));
          break;
        }
      }
      break;
    }
    case "logging": {
      switch (interaction.options.getSubcommand()) {
        case "setup": {
          await interaction.deferReply({ ephemeral: true });

          const channel = interaction.options.getChannel("channel")!;

          await Configuration.findOne({ guildId: interaction.guild.id })
            .then((document) => {
              if (!document)
                throw new Error(
                  `🔴 Бот не проинициализирован на сервере. Воспользуйтесь командой </init:1162414777369362492>.`
                );
              if (!(channel instanceof TextChannel))
                throw new Error(`🔴 Вы не можете установить систему логирования в канале ${channel}.`);

              document.loggingChannelId = channel.id;
              document
                .save()
                .then(() =>
                  interaction.editReply(
                    `🟢 Вы успешно установили канал ${channel} в качестве канала для системы логирования.`
                  )
                )
                .catch((error) =>
                  interaction.editReply(
                    `🔴 Произошла ошибка во время сохранения идентификатора канала в базе данных.\n\n\`\`\`${error}\`\`\``
                  )
                );
            })
            .catch((error) => interaction.editReply(error.message));
          break;
        }
      }
      break;
    }
    case "management": {
      switch (interaction.options.getSubcommand()) {
        case "setup": {
          await interaction.deferReply({ ephemeral: true });

          const channel = interaction.options.getChannel("channel")!;

          await Configuration.findOne({ guildId: interaction.guild.id })
            .then((document) => {
              if (!document)
                throw new Error(
                  `🔴 Бот не проинициализирован на сервере. Воспользуйтесь командой </init:1162414777369362492>.`
                );
              if (!(channel instanceof TextChannel))
                throw new Error(`🔴 Вы не можете установить систему руководства в канале ${channel}.`);

              document.managementChannelId = channel.id;
              document
                .save()
                .then(() =>
                  interaction.editReply(
                    `🟢 Вы успешно установили канал ${channel} в качестве канала для системы руководства.`
                  )
                )
                .catch((error) =>
                  interaction.editReply(
                    `🔴 Произошла ошибка во время сохранения идентификатора канала в базе данных.\n\n\`\`\`${error}\`\`\``
                  )
                );
            })
            .catch((error) => interaction.editReply(error.message));
          break;
        }
      }
      break;
    }
    case "subscription": {
      switch (interaction.options.getSubcommand()) {
        case "setup": {
          await interaction.deferReply({ ephemeral: true });

          const subscriptionListChannel = interaction.options.getChannel("list-channel")!;
          const subscriptionRenewalChannel = interaction.options.getChannel("renewal-channel")!;
          const subscriptionRenewalCheckChannel = interaction.options.getChannel("renewal-check-channel")!;

          await Configuration.findOne({ guildId: interaction.guild.id })
            .then((document) => {
              if (!document)
                throw new Error(
                  `🔴 Бот не проинициализирован на сервере. Воспользуйтесь командой </init:1162414777369362492>.`
                );
              if (!(subscriptionListChannel instanceof TextChannel))
                throw new Error(
                  `🔴 Вы не можете установить канал ${subscriptionListChannel} для отображения списка игроков купивших подписку.`
                );
              if (!(subscriptionRenewalChannel instanceof TextChannel))
                throw new Error(
                  `🔴 Вы не можете установить канал ${subscriptionRenewalChannel} для специального сообщения с возможностью продления подписки.`
                );
              if (!(subscriptionRenewalCheckChannel instanceof TextChannel))
                throw new Error(
                  `🔴 Вы не можете установить канал ${subscriptionRenewalCheckChannel} для проверки заявок на продление подписки.`
                );

              document.subscriptionListChannelId = subscriptionListChannel.id;
              document.subscriptionRenewalChannelId = subscriptionRenewalChannel.id;
              document.subscriptionRenewalCheckChannelId = subscriptionRenewalCheckChannel.id;
              document
                .save()
                .then(() =>
                  interaction.editReply(
                    `🟢 Вы успешно настроили систему подписки. Текущая конфигурация:\n\n<#${document.subscriptionListChannelId}> — канал со списком игроков купивших подписку (для установки воспользуйтесь командой </subscription list_message create:1163154951552376882>);\n<#${document.subscriptionRenewalChannelId}> — канал со специальным сообщением для продления подписки (для установки воспользуйтесь командой </subscription renewal_message create:1163154951552376882>);\n<#${document.subscriptionRenewalCheckChannelId}> — канал для проверки заявок на продление подписки.`
                  )
                )
                .catch((error) =>
                  interaction.editReply(
                    `🔴 Произошла ошибка во время сохранения идентификатора канала в базе данных.\n\n\`\`\`${error}\`\`\``
                  )
                );
            })
            .catch((error) => interaction.editReply(error.message));
          break;
        }
      }
      break;
    }
    case "rules": {
      switch (interaction.options.getSubcommand()) {
        case "setup": {
          await interaction.deferReply({ ephemeral: true });
          const rulesChannel = interaction.options.getChannel("channel")!;

          await Configuration.findOne({ guildId: interaction.guildId })
            .then((document) => {
              if (!document)
                throw new Error(
                  `🔴 Бот не проинициализирован на сервере. Воспользуйтесь командой </init:1162414777369362492>.`
                );
              if (!(rulesChannel instanceof TextChannel))
                throw new Error(`🔴 Вы не можете установить правила в канале ${rulesChannel}.`);

              document.rulesChannelId = rulesChannel.id;
              document
                .save()
                .then((document) =>
                  interaction.editReply(
                    `🟢 Вы успешно установили канал <#${document.rulesChannelId}> в качестве канала для отображения правил.`
                  )
                )
                .catch((error) =>
                  interaction.editReply(
                    `🔴 Произошла ошибка во время сохранения идентификатора канала в базе данных.\n\n\`\`\`${error}\`\`\``
                  )
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
  userPermissions: ["Administrator"],
  deleted: false,
};
