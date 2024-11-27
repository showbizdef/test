import { BaseInteraction, Role } from "discord.js";

export const hasRole = (interaction: BaseInteraction, roleId: string): boolean | undefined => {
  if (!interaction.inCachedGuild()) return;

  return interaction.member.roles.cache.some((role: Role) => role.id === roleId);
};
