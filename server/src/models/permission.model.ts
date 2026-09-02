import mongoose, { Schema, Document } from 'mongoose';

export interface PermissionInterface extends Document {
    name: string;
    label: string;
    category: string;
    description?: string;
    isActive: boolean;
}

const permissionSchema = new Schema<PermissionInterface>({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    label: {
        type: String,
        required: true,
        trim: true,
    },
    category: {
        type: String,
        required: true,
        trim: true,
        default: 'site',
    },
    description: {
        type: String,
        default: '',
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

export default mongoose.model<PermissionInterface>('Permission', permissionSchema);
