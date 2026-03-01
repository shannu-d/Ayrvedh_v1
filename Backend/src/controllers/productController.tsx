import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { Herb } from '../models/Herb';

export const productController = {
    /**
     * GET /api/products
     * Public — list products with optional filter/sort/pagination
     */
    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const { category, search, sort, page = '1', limit = '8' } = req.query as Record<string, string>;

            const filter: Record<string, any> = {};
            if (category) filter.category = category;
            if (search) {
                filter.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                ];
            }

            let sortObj: Record<string, 1 | -1> = { createdAt: -1 };
            if (sort === 'price-asc') sortObj = { price: 1 };
            else if (sort === 'price-desc') sortObj = { price: -1 };
            else if (sort === 'rating') sortObj = { rating: -1 };

            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            const skip = (pageNum - 1) * limitNum;

            const [products, total] = await Promise.all([
                Product.find(filter).sort(sortObj).skip(skip).limit(limitNum),
                Product.countDocuments(filter),
            ]);

            res.status(200).json({
                products,
                total,
                page: pageNum,
                pages: Math.ceil(total / limitNum),
            });
        } catch (error) {
            console.error('Get products error:', error);
            res.status(500).json({ message: 'Failed to fetch products' });
        }
    },

    /**
     * GET /api/products/featured
     * Public — featured products for homepage
     */
    async getFeatured(req: Request, res: Response): Promise<void> {
        try {
            const products = await Product.find({ featured: true }).limit(8);
            res.status(200).json({ products });
        } catch (error) {
            console.error('Get featured error:', error);
            res.status(500).json({ message: 'Failed to fetch featured products' });
        }
    },

    /**
     * GET /api/products/categories
     * Public — distinct categories list
     */
    async getCategories(req: Request, res: Response): Promise<void> {
        try {
            const categories = await Product.distinct('category');
            res.status(200).json({ categories });
        } catch (error) {
            console.error('Get categories error:', error);
            res.status(500).json({ message: 'Failed to fetch categories' });
        }
    },

    /**
     * GET /api/products/:id
     * Public — single product
     */
    async getById(req: Request, res: Response): Promise<void> {
        try {
            const product = await Product.findById(req.params.id);
            if (!product) {
                res.status(404).json({ message: 'Product not found' });
                return;
            }
            // Try to find a matching herb by name (fuzzy match first word)
            const firstWord = product.name.split(' ')[0];
            const herb = await Herb.findOne({
                $or: [
                    { name: { $regex: product.name, $options: 'i' } },
                    { name: { $regex: firstWord, $options: 'i' } },
                    { otherNames: { $regex: firstWord, $options: 'i' } },
                ]
            });

            // ── Language-aware content merge ────────────────────────────────
            // If ?lang= is provided and != 'en', overlay translated fields
            let herbData: any = herb ? herb.toObject() : null;
            const lang = (req.query.lang as string || 'en').toLowerCase();

            if (herbData && lang !== 'en') {
                const translation = herbData.translations?.[lang];
                if (translation) {
                    if (translation.description) herbData.description = translation.description;
                    if (translation.benefits?.length) herbData.benefits = translation.benefits;
                    if (translation.uses?.length) herbData.uses = translation.uses;
                    if (translation.indications?.length) herbData.indications = translation.indications;
                    if (translation.healthBenefitGroups?.length) herbData.healthBenefitGroups = translation.healthBenefitGroups;
                    herbData._translatedLang = lang;
                }
            }

            res.status(200).json({ product, herb: herbData });
        } catch (error) {
            console.error('Get product error:', error);
            res.status(500).json({ message: 'Failed to fetch product' });
        }
    },

    /**
     * POST /api/products — Admin only
     */
    async create(req: Request, res: Response): Promise<void> {
        try {
            const { name, price, originalPrice, description, category, image, images, stock, featured, herb: herbData } = req.body;
            const product = await Product.create({
                name,
                price,
                originalPrice,
                description,
                category,
                image: image || '',
                images: images || (image ? [image] : []),
                stock,
                featured: featured || false,
            });
            // Upsert herb data if provided
            if (herbData && Object.keys(herbData).length > 0) {
                await Herb.findOneAndUpdate(
                    { name: { $regex: name, $options: 'i' } },
                    { ...herbData, name: herbData.name || name, category: herbData.category || [category] },
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                );
            }
            res.status(201).json({ message: 'Product created', product });
        } catch (error) {
            console.error('Create product error:', error);
            res.status(500).json({ message: 'Failed to create product' });
        }
    },

    /**
     * PATCH /api/products/:id — Admin only
     */
    async update(req: Request, res: Response): Promise<void> {
        try {
            const { herb: herbData, ...productData } = req.body;
            const product = await Product.findByIdAndUpdate(
                req.params.id,
                { ...productData },
                { new: true, runValidators: true }
            );
            if (!product) {
                res.status(404).json({ message: 'Product not found' });
                return;
            }
            // Upsert herb data if provided
            if (herbData && Object.keys(herbData).length > 0) {
                const firstWord = product.name.split(' ')[0];
                await Herb.findOneAndUpdate(
                    { $or: [{ name: { $regex: product.name, $options: 'i' } }, { name: { $regex: firstWord, $options: 'i' } }] },
                    { ...herbData, name: herbData.name || product.name, category: herbData.category || [product.category] },
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                );
            }
            res.status(200).json({ message: 'Product updated', product });
        } catch (error) {
            console.error('Update product error:', error);
            res.status(500).json({ message: 'Failed to update product' });
        }
    },

    /**
     * DELETE /api/products/:id — Admin only
     */
    async remove(req: Request, res: Response): Promise<void> {
        try {
            const product = await Product.findByIdAndDelete(req.params.id);
            if (!product) {
                res.status(404).json({ message: 'Product not found' });
                return;
            }
            res.status(200).json({ message: 'Product deleted' });
        } catch (error) {
            console.error('Delete product error:', error);
            res.status(500).json({ message: 'Failed to delete product' });
        }
    },
};
