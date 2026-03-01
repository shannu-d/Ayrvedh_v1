import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    price: number;
    originalPrice?: number;
    description: string;
    category: string;
    image: string;
    images: string[];
    rating: number;
    numReviews: number;
    stock: number;
    featured: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
    {
        name: {
            type: String,
            required: [true, 'Product name is required'],
            trim: true,
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price cannot be negative'],
        },
        originalPrice: {
            type: Number,
            min: 0,
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            trim: true,
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            trim: true,
        },
        image: {
            type: String,
            default: '',
        },
        images: {
            type: [String],
            default: [],
        },
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        numReviews: {
            type: Number,
            default: 0,
        },
        stock: {
            type: Number,
            required: [true, 'Stock is required'],
            min: 0,
            default: 0,
        },
        featured: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

export const Product = mongoose.model<IProduct>('Product', productSchema);
