export async function productController(req, res) {
    try {
        const { title, desription, price } = req.body;

        if (!title || !amount) {
            return res
                .status(400)
                .json({ message: "Title and amount are required" });
        }

        const sellerId = req.user.id; //extract seller id from the authenticated user

        // const price={
        //     amount: Number(amount),
        //     currency: currency || "INR", //default currency is INR
        // }

        const product = await Product.create({
            title,
            desription,
            price,
            sellerId,
        });


    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
}
