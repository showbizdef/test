import { Document, Schema, model } from "mongoose";

export interface ISystems extends Document {
  guildId: string;
}

const systemsSchema = new Schema<ISystems>({});

const System = model<ISystems>("System", systemsSchema);

export default System;
