import ImageKit from "imagekit";
import { v4 as uuidv4 } from "uuid";

// Test environment ke liye ImageKit client instantiate nahi karenge — real API touch nahi hogi
const imagekitClient =
    process.env.NODE_ENV === "test"
        ? null
        : new ImageKit({
              publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
              privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
              urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
          });

/**
 * Uploads an image buffer to ImageKit.
 * In test mode, returns a mock image object immediately to prevent real storage uploads.
 */
export async function uploadImage({ buffer, folder = "/products" }) {
    if (process.env.NODE_ENV === "test") {
        const mockId = uuidv4();
        return {
            url: `https://ik.imagekit.io/test/${mockId}.png`,
            thumbnailUrl: `https://ik.imagekit.io/test/tr:n-ik_ml_thumbnail/${mockId}.png`,
            id: `mock_file_${mockId}`,
        };
    }

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
