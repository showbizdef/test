import { Schema, model } from "mongoose";

export interface ISubscription {
  userId: string;
  accountId: string;
  rank: number;
  subscriptionStatus: string;
}

const subscriptionSchema = new Schema<ISubscription>({
  userId: { type: String, required: true },
  accountId: { type: String, required: true },
  rank: { type: Number, required: true },
  subscriptionStatus: { type: String, required: true },
});

const Subscription = model<ISubscription>("Subscription", subscriptionSchema);

export default Subscription;
