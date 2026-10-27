import "dotenv/config";
import { app } from "./src/app.js";
import { connectToDatabase } from "./src/db/db.js";
import dns from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

connectToDatabase();

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});

// POST /auth/register – Create account as USER or SELLER. Validates email uniqueness, hashes password, issues refresh+access tokens. Emits user.created.
// POST /auth/login – Email+password login. On success: httpOnly refresh cookie + short-lived access token in body; logs device metadata.
// POST /auth/logout – Revokes current refresh session, clears cookies. Idempotent.
// GET /auth/me – Returns current user (id, roles, profile). Requires valid access token.

// GET /auth/users/me/addresses – List saved addresses; mark default.
// POST /auth/users/me/addresses – Add address (with validation for pincode/phone).
// DELETE /auth/users/me/addresses/:addressId – Remove address.
