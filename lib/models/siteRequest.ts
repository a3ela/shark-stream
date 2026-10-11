import mongoose, { Schema, Document } from "mongoose";

export interface ISiteRequest extends Document {
  name: string;
  url: string;
  categoryId: mongoose.Types.ObjectId;
  submittedBy: string; // user id
  submittedByEmail: string;
  status: "pending" | "approved" | "rejected";
  notes?: string;
  aiRecommendation?: "approved" | "rejected";
  aiReason?: string;
  aiMetadata?: {
    ads?: "none" | "low" | "high";
    quality?: string;
    tags?: string[];
    requiresLogin?: boolean;
    categorySuggestion?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const SiteRequestSchema: Schema = new Schema<ISiteRequest>(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    submittedBy: { type: String, required: true },
    submittedByEmail: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    notes: { type: String, default: "" },
    aiRecommendation: {
      type: String,
      enum: ["approved", "rejected"],
    },
    aiReason: { type: String, default: "" },
    aiMetadata: {
      ads: { type: String, enum: ["none", "low", "high"], default: "none" },
      quality: { type: String, default: "" },
      tags: { type: [String], default: [] },
      requiresLogin: { type: Boolean, default: false },
      categorySuggestion: { type: String, default: "" },
    },
  },
  { timestamps: true },
);

export default mongoose.models.SiteRequest ||
  mongoose.model<ISiteRequest>("SiteRequest", SiteRequestSchema);
