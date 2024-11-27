import { Schema, model } from "mongoose";

export interface IPayout {
  userId: string;
  messageId: string;
  payout: number;
  date: Date;
}

const payoutSchema = new Schema<IPayout>({
  userId: { type: String, required: true },
  messageId: { type: String, required: true },
  payout: { type: Number, required: true },
  date: { type: Date, required: true },
});

const Payout = model<IPayout>("Sale", payoutSchema);

export default Payout;
