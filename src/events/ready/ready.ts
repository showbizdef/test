import type { Client } from "discord.js";
import type { CommandKit } from "commandkit";

export default function (client: Client<true>, handler: CommandKit) {
  console.log(`✅ [${client.user.username.toUpperCase()}] READY`);
}
