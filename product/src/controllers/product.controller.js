export async function productController(req, res) {
    try {
        const { title, desription, price } = req.body;
        //price is an object with amount and currency

        if (!title || !amount) {
            return res
                .status(400)
                .json({ message: "Title and amount are required" });
        }

        const sellerId = req.user.id; //extract seller id from the authenticated user

        const images = [];

        const file = await Promise.all(
            (req.files || []).map((file) =>
                uploadImage({
                    buffer: file.buffer,
                }),
            ),
        );
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
}
