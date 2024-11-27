import { CommandKit } from "commandkit";
import {
  EmbedBuilder,
  TextChannel,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalSubmitInteraction,
  type Client,
  type Interaction,
} from "discord.js";

import { VERIFICATION_APPLICATIONS_CHANNEL_ID } from "@constants/channels";
import {
  COMPANY_DEPUTY_DIRECTOR_ROLE_ID,
  COMPANY_DIRECTOR_ROLE_ID,
  COMPANY_OWNER_ROLE_ID,
  DISCORD_MASTER_ROLE_ID,
  VERIFICATION_WAIT_ROLE_ID,
} from "@constants/roles";

export default async function (interaction: Interaction, client: Client<true>, handler: CommandKit) {
  if (!interaction.isModalSubmit()) return;

  async function sendVerificationRequest(interaction: ModalSubmitInteraction, nickname: string, screenshotURL: string) {
    if (!interaction.inCachedGuild()) return;

    // канал с заявками
    const verificationApplicationsChannel = interaction.client.channels.cache.get(
      VERIFICATION_APPLICATIONS_CHANNEL_ID
    ) as TextChannel;

    // роль "Ожидание верификации"
    const verificationWaitRole = interaction.guild.roles.cache.get(VERIFICATION_WAIT_ROLE_ID)!;

    // проверка валидности ссылки на скриншот
    if (!screenshotURL.startsWith("https://imgur.com/")) {
      throw new Error();
    }

    // ембед запроса верификации
    const verificationRequestEmbed = new EmbedBuilder()
      .setTitle(`🕵️ Запрос на верификацию от игрока ${nickname}`)
      .setDescription(
        `Игрок ${interaction.member.user} запрашивает верификацию. Тщательно рассмотрите его заявку и примите решение, нажав на соответствующую кнопку, прикреплённую к сообщению.`
      )
      .setTimestamp()
      .setFooter({
        text: interaction.member.user.id,
        iconURL: interaction.member.user.displayAvatarURL(),
      });

    // ембед ответа при отправке заявки
    const applicationSendResponseEmbed = new EmbedBuilder()
      .setTitle("🤓 Заявка на верификацию успешно отправлена")
      .setDescription(
        `Ваша заявка будет рассмотрена в кратчайшие сроки. Как только она будет рассмотрена, Вам придёт уведомление в личные сообщения от ${interaction.client.user}.`
      )
      .setTimestamp()
      .setFooter({
        text: interaction.client.user.username,
        iconURL: interaction.client.user.displayAvatarURL(),
      });

    // кнопки для проверки заявки на верификацию
    const applicationButtonsRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setLabel("Скриншот").setEmoji("🖼️").setStyle(ButtonStyle.Link).setURL(screenshotURL),
      new ButtonBuilder()
        .setCustomId("approve-verification")
        .setLabel("Одобрить")
        .setEmoji("✅")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("deny-verification")
        .setLabel("Отказать")
        .setEmoji("❎")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("close-verification")
        .setLabel("Закрыть")
        .setEmoji("⛔")
        .setStyle(ButtonStyle.Secondary)
    );

    // отправка заявки в канал с заявками
    await verificationApplicationsChannel.send({
      content: `<@&${COMPANY_OWNER_ROLE_ID}> <@&${COMPANY_DIRECTOR_ROLE_ID}> <@&${COMPANY_DEPUTY_DIRECTOR_ROLE_ID}> <@&${DISCORD_MASTER_ROLE_ID}>`,
      embeds: [verificationRequestEmbed],
      components: [applicationButtonsRow],
    });

    // смена никнейма на тот, который указал игрок при заполнении модального окна
    await interaction.member.setNickname(nickname);

    // ответ отправившему заявку
    await interaction.editReply({ embeds: [applicationSendResponseEmbed] });

    // выдача роли "Ожидание верификации" при отправке заявки
    await interaction.guild.members.addRole({
      user: interaction.member.user.id,
      role: verificationWaitRole,
    });
  }

  async function sendErrorResponse(interaction: ModalSubmitInteraction) {
    // ембед ошибки (некорректно-введённой ссылки)
    const errorEmbed = new EmbedBuilder()
      .setTitle("🔗 Указана некорректная ссылка")
      .setDescription(
        `Вы указали некорректную ссылку на изображение. Используйте поддерживаемый фотохостинг [imgur.com](https://imgur.com) и перепроверьте, указали ли Вы валидную ссылку (валидной ссылкой считается ссылка, начинающаяся с \`https://imgur.com/\`). В случае, если Вы уверенны в корректности указанной Вами ссылки, свяжитесь с <@&${DISCORD_MASTER_ROLE_ID}>.`
      )
      .setTimestamp()
      .setFooter({
        text: interaction.client.user.username,
        iconURL: interaction.client.user.displayAvatarURL(),
      });

    // ответ отправившему заявку
    await interaction.editReply({
      embeds: [errorEmbed],
    });
  }

  switch (interaction.customId) {
    case "verification-modal": {
      try {
        await interaction.deferReply({ ephemeral: true });

        // поля модального окна верификации
        const nickname = interaction.fields.getTextInputValue("nickname-input");
        const screenshotURL = interaction.fields.getTextInputValue("screenshot-input");

        await sendVerificationRequest(interaction, nickname, screenshotURL);
      } catch (error) {
        await sendErrorResponse(interaction);
      }
      break;
    }
  }
}
