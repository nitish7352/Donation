import crypto from "crypto";

const ADMIN_SECRET = process.env.ADMIN_SECRET || "helphands_secure_token_secret_key_2026";

// Generate an authentication token for admin
export function generateAdminToken(payload = {}) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const data = Buffer.from(
    JSON.stringify({
      role: "admin",
      exp: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
      ...payload
    })
  ).toString("base64url");

  const signature = crypto
    .createHmac("sha256", ADMIN_SECRET)
    .update(`${header}.${data}`)
    .digest("base64url");

  return `${header}.${data}.${signature}`;
}

// Verify admin token
export function verifyAdminToken(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [header, data, signature] = parts;
  const expectedSig = crypto
    .createHmac("sha256", ADMIN_SECRET)
    .update(`${header}.${data}`)
    .digest("base64url");

  if (signature !== expectedSig) return null;

  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
    if (payload.exp && Date.now() > payload.exp) {
      return null; // Expired
    }
    return payload;
  } catch {
    return null;
  }
}

// Express middleware to protect sensitive admin routes
export function requireAdminAuth(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  let token = null;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.slice(7).trim();
  } else if (req.headers["x-admin-token"]) {
    token = req.headers["x-admin-token"];
  }

  const payload = verifyAdminToken(token);
  if (!payload || payload.role !== "admin") {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Admin authentication required to access this resource."
    });
  }

  req.adminUser = payload;
  next();
}
