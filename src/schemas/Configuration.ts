import { Schema, model } from "mongoose";

export interface IConfiguration {
  guildId: string;
  verificationChannelId: string;
  loggingChannelId: string;
  managementChannelId: string;
  payoutChannelId: string;
  subscriptionListChannelId: string;
  subscriptionRenewalChannelId: string;
  subscriptionRenewalCheckChannelId: string;
  managementFAQChannelId: string;
  botFAQChannelId: string;
  rulesChannelId: string;
}

const configurationSchema = new Schema<IConfiguration>({
  guildId: { type: String, required: false, unique: true },
  verificationChannelId: { type: String, required: false },
  loggingChannelId: { type: String, required: false },
  managementChannelId: { type: String, required: false },
  payoutChannelId: { type: String, required: false },
  subscriptionListChannelId: { type: String, required: false },
  subscriptionRenewalChannelId: { type: String, required: false },
  subscriptionRenewalCheckChannelId: { type: String, required: false },
  managementFAQChannelId: { type: String, required: false },
  botFAQChannelId: { type: String, required: false },
  rulesChannelId: { type: String, required: false },
});

const Configuration = model<IConfiguration>("Configuration", configurationSchema);

export default Configuration;
