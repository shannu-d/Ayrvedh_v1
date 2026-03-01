import mongoose, { Document, Schema } from 'mongoose';

export interface IChatMessage {
    role: 'user' | 'model';
    text: string;
    timestamp: Date;
}

export interface IChat extends Document {
    user: mongoose.Types.ObjectId;
    messages: IChatMessage[];
    createdAt: Date;
    updatedAt: Date;
}

const chatMessageSchema = new Schema<IChatMessage>(
    {
        role: { type: String, enum: ['user', 'model'], required: true },
        text: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
    },
    { _id: false }
);

const chatSchema = new Schema<IChat>(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
        messages: { type: [chatMessageSchema], default: [] },
    },
    { timestamps: true }
);

export const Chat = mongoose.model<IChat>('Chat', chatSchema);
