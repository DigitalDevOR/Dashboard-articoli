import mongoose, { Schema, Document } from 'mongoose';

type UserRole = mongoose.Types.ObjectId[];

export interface UserInterface extends Document {
    nome: string;
    cognome: string;
    email: string;
    password: string;
    roles: UserRole; // Ruolo dell'utente (ad esempio, "admin", "user", ecc.)
}

const userSchema = new Schema<UserInterface>({
    nome: { type: String, required: true },
    cognome: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    roles: {
        type: [{ type: Schema.Types.ObjectId, ref: 'Role' }],
        required: true,
    },
}, { timestamps: true });

export default mongoose.model<UserInterface>('User', userSchema);