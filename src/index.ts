import * as dotenv from "dotenv";
dotenv.config();

import { Client, GatewayIntentBits } from "discord.js";
import { CommandKit } from "commandkit";

import mongoose from "mongoose";
import * as path from "path";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

const commandsPath = path.join(__dirname, "commands");

new CommandKit({
  client,
  commandsPath: path.join(__dirname, "commands"),
  eventsPath: path.join(__dirname, "events"),
  skipBuiltInValidations: true,
});

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "");
    console.log("✅ [MONGODB] READY");
    client.login(process.env.TOKEN);
  } catch (error) {
    console.error(error);
  }
})();
