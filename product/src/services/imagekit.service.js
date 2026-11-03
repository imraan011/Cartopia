import ImageKit from "imagekit";
import { v4 as uuidv4 } from "uuid";

// ImageKit client — env vars se configure hoga
const imagekitClient = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

/**
 * Uploads an image buffer to ImageKit.
 * Returns normalized { url, thumbnailUrl, id } shape.
 */
export async function uploadImage({ buffer, folder = "/products" }) {
    const result = await imagekitClient.upload({
        file: buffer,
        fileName: uuidv4(),
        folder,
    });
    return {
        url: result.url,
        thumbnailUrl: result.thumbnailUrl || result.url,
        id: result.fileId,
    };
}
