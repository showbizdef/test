import { Schema, model } from "mongoose";

export interface IRule {
  category: string;
  rule: string;
  penalty: string;
}

const ruleSchema = new Schema<IRule>({
  category: { type: String, required: true, unique: true },
  rule: { type: String, required: true },
  penalty: { type: String, required: true },
});

const Rule = model<IRule>("Rule", ruleSchema);

export default Rule;
