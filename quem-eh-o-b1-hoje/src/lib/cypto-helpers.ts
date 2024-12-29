import crypto from "node:crypto";
import { env } from "~/env";

const algorithm = "aes-256-cbc";
const key = crypto.scryptSync(
  env.CLICK_UP_TOKEN_ENCRYPTION_KEY,
  env.CLICK_UP_TOKEN_ENCRYPTION_SALT,
  32,
); // generate 256 bits key

export const encryptToken = (token: string) => {
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(token, "utf-8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`; // Save IV with encrypted token
};

export const decryptToken = (encryptedToken: string) => {
  const parts = encryptedToken.split(":");
  if (parts.length !== 2) {
    console.error("[decryptToken] Invalid format: ", encryptedToken);
    throw new Error("Invalid or corrupted token");
  }

  const [ivHex, encrypted] = parts;

  const decipher = crypto.createDecipheriv(
    algorithm,
    key,
    Buffer.from(ivHex!, "hex"),
  );
  let decrypted = decipher.update(encrypted!, "hex", "utf-8");
  decrypted += decipher.final("utf-8");
  return decrypted;
};
