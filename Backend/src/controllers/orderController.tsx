import { Request, Response } from 'express';
import { Order } from '../models/Order';
import { Product } from '../models/Product';

export const orderController = {
    /**
     * POST /api/orders
     * Create order for logged-in user (protected)
     */
    async create(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            const { items, shippingAddress } = req.body;

            if (!items || items.length === 0) {
                res.status(400).json({ message: 'Order must have at least one item' });
                return;
            }

            // Resolve each item from the database to get current price/name
            let total = 0;
            const resolvedItems = [];
            for (const item of items) {
                const product = await Product.findById(item.productId || item.product?._id);
                if (!product) {
                    res.status(400).json({ message: `Product not found: ${item.productId}` });
                    return;
                }
                if (product.stock < item.quantity) {
                    res.status(400).json({ message: `Insufficient stock for ${product.name}` });
                    return;
                }
                resolvedItems.push({
                    productId: product._id,
                    name: product.name,
                    image: product.image,
                    price: product.price,
                    quantity: item.quantity,
                });
                total += product.price * item.quantity;

                // Reduce stock
                await Product.findByIdAndUpdate(product._id, { $inc: { stock: -item.quantity } });
            }

            const order = await Order.create({
                user: userId,
                items: resolvedItems,
                shippingAddress,
                total,
                status: 'Processing',
            });

            res.status(201).json({ message: 'Order placed successfully', order });
        } catch (error) {
            console.error('Create order error:', error);
            res.status(500).json({ message: 'Failed to place order' });
        }
    },

    /**
     * GET /api/orders/my
     * Get logged-in user's orders (protected)
     */
    async getMyOrders(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
            res.status(200).json({ orders });
        } catch (error) {
            console.error('Get my orders error:', error);
            res.status(500).json({ message: 'Failed to fetch orders' });
        }
    },

    /**
     * GET /api/orders — Admin only
     * List all orders
     */
    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const orders = await Order.find()
                .populate('user', 'name email')
                .sort({ createdAt: -1 });
            res.status(200).json({ orders });
        } catch (error) {
            console.error('Get all orders error:', error);
            res.status(500).json({ message: 'Failed to fetch orders' });
        }
    },

    /**
     * PATCH /api/orders/:id/status — Admin only
     */
    async updateStatus(req: Request, res: Response): Promise<void> {
        try {
            const { status } = req.body;
            const validStatuses = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];
            if (!validStatuses.includes(status)) {
                res.status(400).json({ message: 'Invalid status' });
                return;
            }
            const order = await Order.findByIdAndUpdate(
                req.params.id,
                { status },
                { new: true }
            );
            if (!order) {
                res.status(404).json({ message: 'Order not found' });
                return;
            }
            res.status(200).json({ message: 'Order status updated', order });
        } catch (error) {
            console.error('Update order status error:', error);
            res.status(500).json({ message: 'Failed to update status' });
        }
    },
};
