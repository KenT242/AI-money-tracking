import mongoose, { Schema, Model } from "mongoose";
import { ICategory } from "@/types";

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["income", "expense", "both"],
      required: true,
    },
    icon: {
      type: String,
      default: "tag",
    },
    color: {
      type: String,
      default: "#3b82f6",
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: String,
      required: false, // null for default categories
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
CategorySchema.index({ userId: 1, name: 1 });
CategorySchema.index({ isDefault: 1 });

const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema);

export default Category;
