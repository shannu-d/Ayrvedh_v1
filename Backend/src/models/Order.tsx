import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
    productId: mongoose.Types.ObjectId;
    name: string;
    image: string;
    price: number;
    quantity: number;
}

export interface IShippingAddress {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
}

export interface IOrder extends Document {
    _id: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    items: IOrderItem[];
    shippingAddress: IShippingAddress;
    total: number;
    status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
    createdAt: Date;
    updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
    {
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        name: { type: String, required: true },
        image: { type: String, default: '' },
        price: { type: Number, required: true, min: 0 },
        quantity: { type: Number, required: true, min: 1 },
    },
    { _id: false }
);

const shippingAddressSchema = new Schema<IShippingAddress>(
    {
        fullName: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true },
    },
    { _id: false }
);

const orderSchema = new Schema<IOrder>(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        items: { type: [orderItemSchema], required: true },
        shippingAddress: { type: shippingAddressSchema, required: true },
        total: { type: Number, required: true, min: 0 },
        status: {
            type: String,
            enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'],
            default: 'Processing',
        },
    },
    { timestamps: true }
);

export const Order = mongoose.model<IOrder>('Order', orderSchema);
