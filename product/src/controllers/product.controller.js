import { uploadImage } from "../services/imagekit.service.js";
import { ProductModel } from "../models/product.model.js";

export async function productController(req, res) {
    try {
        const { title, description, price } = req.body;
        const sellerId = req.user.id || req.user._id;

        // Image required check — validator file check nahi karta
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                error: { message: "At least one image is required" },
            });
        }

        // ImageKit pe upload karo (mocked in tests)
        const uploadedImages = await Promise.all(
            req.files.map((file) => uploadImage({ buffer: file.buffer })),
        );

        const product = await ProductModel.create({
            title,
            description,
            price,
            seller: sellerId,
            image: uploadedImages.map((img) => ({
                url: img.url,
                thumbnail: img.thumbnailUrl,
                id: img.id,
            })),
        });

        return res.status(201).json({
            success: true,
            data: { product },
        });
    } catch (error) {
        // Temporary debug — test me error dekhnay ke liye
        console.error("productController error:", error.message, error.stack);
        return res.status(500).json({
            success: false,
            error: { message: "Internal server error" },
        });
    }
}
