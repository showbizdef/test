import { Schema, model } from "mongoose";

export interface IManagementMember {
  userId: string;
  accountId: string;
  nickname: string;
  position: number;
  shares_pct: number;
  responsibilities: string;
}

const managementMemberSchema = new Schema<IManagementMember>({
  userId: { type: String, required: true, unique: true },
  accountId: { type: String, required: true },
  nickname: { type: String, required: true },
  position: { type: Number, required: true },
  shares_pct: { type: Number },
  responsibilities: { type: String },
});

managementMemberSchema.pre("save", function (next) {
  if (this.position === 9) {
    this.shares_pct = 0.3;
  } else if (this.position === 10) {
    this.shares_pct = 0.4;
  }

  next();
});

const ManagementMember = model<IManagementMember>("ManagementMember", managementMemberSchema);

export default ManagementMember;
