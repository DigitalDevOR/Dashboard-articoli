import mongoose, { Schema, Document } from "mongoose";

export interface AdminProfile extends Document {
  userName: string;
  email: string;
  password: string;
}

// Definizione dello schema
const adminProfileSchema = new Schema<AdminProfile>(
  {
    userName: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

// Middleware pre-save per assicurarsi che esista solo un admin
adminProfileSchema.pre("save", async function (next) {
  // Se il documento è nuovo (creazione)
  if (this.isNew) {
    const adminCount = await mongoose.models.Admin.countDocuments();
    if (adminCount > 0) {
      const err = new Error("Esiste già un admin nel sistema");
      // @ts-ignore
      err.status = 400;
      return next(err);
    }
  }
  next();
});

export default mongoose.model<AdminProfile>("Admin", adminProfileSchema);
