import mongoose, { Document, Schema } from 'mongoose';

export interface IWordpressSite extends Document {
    name: string;
    wpUrl: string;
    username: string;
    appPasswordEncrypted: string;
    enabled: boolean;
}

const WordpressSiteSchema: Schema = new Schema({
  name: { type: String, required: true },
  wpUrl: { type: String, required: true },
  username: { type: String, required: true },
  appPasswordEncrypted: { type: String, required: true },
  enabled: { type: Boolean, required: true, default: true },
}, {
  timestamps: true
});

WordpressSiteSchema.index({ name: 1, wpUrl: 1 }, { unique: true });

export default mongoose.model<IWordpressSite>('WordpressSite', WordpressSiteSchema);