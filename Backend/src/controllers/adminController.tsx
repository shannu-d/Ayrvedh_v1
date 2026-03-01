import { Request, Response } from 'express';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { Herb } from '../models/Herb';

export const adminController = {
    /**
     * GET /api/admin/dashboard
     * Aggregate stats for admin dashboard
     */
    async getDashboard(req: Request, res: Response): Promise<void> {
        try {
            const [totalUsers, totalProducts, totalOrders, revenueResult] = await Promise.all([
                User.countDocuments(),
                Product.countDocuments(),
                Order.countDocuments(),
                Order.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }]),
            ]);

            res.status(200).json({
                totalUsers,
                totalProducts,
                totalOrders,
                totalRevenue: revenueResult[0]?.total || 0,
            });
        } catch (error) {
            console.error('Dashboard error:', error);
            res.status(500).json({ message: 'Failed to fetch dashboard data' });
        }
    },

    /**
     * GET /api/admin/users
     * List all users (admin)
     */
    async getUsers(req: Request, res: Response): Promise<void> {
        try {
            const users = await User.find().sort({ createdAt: -1 }).select('-password');
            res.status(200).json({ users });
        } catch (error) {
            console.error('Get users error:', error);
            res.status(500).json({ message: 'Failed to fetch users' });
        }
    },

    /**
     * DELETE /api/admin/users/:id
     * Delete a user (cannot delete self or other admins)
     */
    async deleteUser(req: Request, res: Response): Promise<void> {
        try {
            const selfId = (req as any).user?.id;
            if (req.params.id === selfId) {
                res.status(400).json({ message: 'You cannot delete your own account' });
                return;
            }
            const user = await User.findById(req.params.id);
            if (!user) {
                res.status(404).json({ message: 'User not found' });
                return;
            }
            if (user.role === 'admin') {
                res.status(403).json({ message: 'Cannot delete an admin user' });
                return;
            }
            await User.findByIdAndDelete(req.params.id);
            res.status(200).json({ message: 'User deleted successfully' });
        } catch (error) {
            console.error('Delete user error:', error);
            res.status(500).json({ message: 'Failed to delete user' });
        }
    },

    /**
     * PATCH /api/admin/users/:id/role
     * Toggle admin role for a user
     */
    async updateUserRole(req: Request, res: Response): Promise<void> {
        try {
            const { role } = req.body;
            if (!['user', 'admin'].includes(role)) {
                res.status(400).json({ message: 'Invalid role' });
                return;
            }
            const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
            if (!user) {
                res.status(404).json({ message: 'User not found' });
                return;
            }
            res.status(200).json({ message: 'User role updated', user });
        } catch (error) {
            console.error('Update user role error:', error);
            res.status(500).json({ message: 'Failed to update user role' });
        }
    },

    /**
     * GET /api/admin/herbs
     */
    async getHerbs(req: Request, res: Response): Promise<void> {
        try {
            const herbs = await Herb.find().sort({ name: 1 });
            res.status(200).json({ herbs });
        } catch (error) {
            console.error('Get herbs error:', error);
            res.status(500).json({ message: 'Failed to fetch herbs' });
        }
    },

    /**
     * POST /api/admin/herbs
     */
    async addHerb(req: Request, res: Response): Promise<void> {
        try {
            const herb = await Herb.create(req.body);
            res.status(201).json({ message: 'Herb added successfully', herb });
        } catch (error) {
            console.error('Add herb error:', error);
            res.status(500).json({ message: 'Failed to add herb' });
        }
    },

    /**
     * PATCH /api/admin/herbs/:id
     */
    async updateHerb(req: Request, res: Response): Promise<void> {
        try {
            const herb = await Herb.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
            if (!herb) {
                res.status(404).json({ message: 'Herb not found' });
                return;
            }
            res.status(200).json({ message: 'Herb updated successfully', herb });
        } catch (error) {
            console.error('Update herb error:', error);
            res.status(500).json({ message: 'Failed to update herb' });
        }
    },

    /**
     * DELETE /api/admin/herbs/:id
     */
    async deleteHerb(req: Request, res: Response): Promise<void> {
        try {
            const herb = await Herb.findByIdAndDelete(req.params.id);
            if (!herb) {
                res.status(404).json({ message: 'Herb not found' });
                return;
            }
            res.status(200).json({ message: 'Herb deleted successfully' });
        } catch (error) {
            console.error('Delete herb error:', error);
            res.status(500).json({ message: 'Failed to delete herb' });
        }
    },
};
