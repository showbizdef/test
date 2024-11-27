import { BaseInteraction, Role } from "discord.js";

export const getRole = (interaction: BaseInteraction, roleId: string): Role | undefined => {
  if (!interaction.inCachedGuild()) return;

  return interaction.guild.roles.cache.get(roleId);
};
