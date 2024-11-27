import { BaseInteraction, GuildBasedChannel } from "discord.js";

export const getChannel = (interaction: BaseInteraction, channelId: string): GuildBasedChannel | undefined => {
  if (!interaction.inCachedGuild()) return;

  return interaction.guild.channels.cache.get(channelId);
};
