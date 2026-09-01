import mongoose, { Schema, Document } from "mongoose";

export interface ISite extends Document {
  name: string;
  url: string;
  logoUrl: string;
  category: mongoose.Types.ObjectId;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const siteSchema: Schema = new Schema<ISite>(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    logoUrl: { type: String, required: true, default: "" },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.models.Site ||
  mongoose.model<ISite>("Site", siteSchema);
