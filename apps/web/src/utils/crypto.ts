import crypto from 'crypto';

const algorithm = 'aes-256-gcm';
// Expect a 32‑byte base64 key in env ENCRYPTION_KEY (generate with: openssl rand -base64 32)
const keyBase64 = import.meta.env.VITE_ENCRYPTION_KEY || '';
if (!keyBase64) {
  console.warn('ENCRYPTION_KEY not set – encryption functions will throw if used.');
}
const key = Buffer.from(keyBase64, 'base64');

/**
 * Encrypt a UTF‑8 string and return a base64 payload containing iv|authTag|ciphertext.
 */
export function encrypt(text: string): string {
  if (!keyBase64) throw new Error('Encryption key not configured');
  const iv = crypto.randomBytes(12); // Recommended 12‑byte IV for GCM
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  // payload: iv:authTag:ciphertext (all base64)
  return Buffer.concat([iv, authTag, encrypted]).toString('base64');
}

/**
 * Decrypt a payload produced by `encrypt()`.
 */
export function decrypt(payloadBase64: string): string {
  if (!keyBase64) throw new Error('Encryption key not configured');
  const data = Buffer.from(payloadBase64, 'base64');
  const iv = data.slice(0, 12);
  const authTag = data.slice(12, 28);
  const ciphertext = data.slice(28);
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return decrypted.toString('utf8');
}
