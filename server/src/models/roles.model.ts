import mongoose, { Schema, Document } from 'mongoose';

export const USER_ROLES = ['Admin', 'Editor'] as const;

export type UserRoleName = typeof USER_ROLES[number];

export interface RolesInterface extends Document {
    roleName: UserRoleName;
    description?: string;
    permissions: mongoose.Types.ObjectId[];
    isActive: boolean;
}

const rolesSchema = new Schema<RolesInterface>({
    roleName: {
        type: String,
        required: true,
        unique: true,
        enum: USER_ROLES,
    },
    description: {
        type: String,
        default: '',
    },
    permissions: {
        type: [{ type: Schema.Types.ObjectId, ref: 'Permission' }],
        default: [],
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

export default mongoose.model<RolesInterface>('Role', rolesSchema);