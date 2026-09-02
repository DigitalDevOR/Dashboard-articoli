import mongoose, { Schema, Document } from 'mongoose';

export const USER_ROLES = ['KissKiss', 'KissKiss Napoi', 'Radio Ibiza', 'Admin', 'SuperAdmin'] as const;

export type UserRoleName = typeof USER_ROLES[number];

export interface RolesInterface extends Document {
    roleName: UserRoleName;
}

const rolesSchema = new Schema<RolesInterface>({
    roleName: { type: String, required: true, unique: true, enum: USER_ROLES }
}, { timestamps: true });

export default mongoose.model<RolesInterface>('Role', rolesSchema);