import imagekit from "imagekit";
import uuid from "uuid";

export const imagekit = new imagekit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

export async function uploadImage({ buffer, folder = "/products" }) {
    const result = await imagekit.upload({
        file: buffer,
        fileName: uuid.v4(),
        folder,
    });
    return {
        url: result.url,
        thumbnailUrl: result.thumbnailUrl || result.url,
        id: result.fileId,
    };
}
