import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface UserSiteAccessEntry {
    siteId: mongoose.Types.ObjectId;
    role: mongoose.Types.ObjectId;
    additionalPermissions: mongoose.Types.ObjectId[];
}

export interface UserInterface extends Document {
    nome: string;
    cognome: string;
    email: string;
    password: string;
    isSuperAdmin: boolean;
    siteAccess: UserSiteAccessEntry[];
    isActive: boolean;
}

const userSchema = new Schema<UserInterface>({
    nome: { type: String, required: true },
    cognome: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isSuperAdmin: {
        type: Boolean,
        default: false,
    },
    siteAccess: {
        type: [
            {
                siteId: { type: Schema.Types.ObjectId, ref: 'WordPressSite', required: true },
                role: { type: Schema.Types.ObjectId, ref: 'Role', required: true },
                additionalPermissions: {
                    type: [{ type: Schema.Types.ObjectId, ref: 'Permission' }],
                    default: [],
                },
            },
        ],
        default: [],
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

userSchema.pre<UserInterface>('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error as Error);
    }
});

export default mongoose.model<UserInterface>('User', userSchema);