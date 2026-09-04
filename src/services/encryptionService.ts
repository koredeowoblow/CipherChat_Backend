import crypto from 'crypto';
import nacl from 'tweetnacl';

class EncryptionService {
  /**
   * Generate a new X25519 keypair for ephemeral key exchange
   */
  public generateKeyPair() {
    const keyPair = nacl.box.keyPair();
    return {
      publicKey: Buffer.from(keyPair.publicKey).toString('base64'),
      privateKey: Buffer.from(keyPair.secretKey).toString('base64')
    };
  }

  /**
   * Encrypt a plaintext message using AES-256-GCM
   */
  public encryptMessage(plaintext: string, key: string) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      'aes-256-gcm',
      Buffer.from(key, 'base64'),
      iv
    );

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();

    return {
      iv: iv.toString('base64'),
      ciphertext: encrypted,
      authTag: authTag.toString('base64')
    };
  }

  /**
   * Decrypt a message using AES-256-GCM (Usually only client-side, but added for completeness/testing)
   */
  public decryptMessage(encrypted: { ciphertext: string; iv: string; authTag: string }, key: string) {
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      Buffer.from(key, 'base64'),
      Buffer.from(encrypted.iv, 'base64')
    );

    decipher.setAuthTag(Buffer.from(encrypted.authTag, 'base64'));
    let decrypted = decipher.update(encrypted.ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Compute a shared secret using ECDH (X25519)
   */
  public computeSharedSecret(privateKey: string, publicKey: string) {
    const sharedSecret = nacl.box.before(
      Buffer.from(publicKey, 'base64'),
      Buffer.from(privateKey, 'base64')
    );
    return Buffer.from(sharedSecret).toString('base64');
  }

  /**
   * Derive a secure encryption key from the shared secret using HKDF-SHA256
   */
  public deriveKey(sharedSecret: string, salt?: string, info?: string) {
    const hkdf = crypto.hkdfSync(
      'sha256',
      Buffer.from(sharedSecret, 'base64'),
      salt ? Buffer.from(salt) : Buffer.from(''),
      info ? Buffer.from(info) : Buffer.from(''),
      32 // 256 bits for AES-256
    );
    return Buffer.from(hkdf).toString('base64');
  }
}

export default new EncryptionService();
