/**
 * Web Crypto API Utility for AES-256-GCM Encryption
 * 
 * Required by RBI guidelines to encrypt PII data in LocalStorage.
 * We use AES-GCM with a PBKDF2 derived key.
 */

// A static passphrase for the purpose of this frontend-only simulation.
// In a real app, this might be derived from a user's session token or PIN.
const ENCRYPTION_PASSPHRASE = 'LendSwift_Secure_App_2024';
const SALT = new TextEncoder().encode('LendSwift_Static_Salt_v1');

/**
 * Derives an AES-256 key from the passphrase
 */
async function getDerivedKey() {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(ENCRYPTION_PASSPHRASE),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: SALT,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts a JSON object into a Base64 string
 * @param {Object} data - The state object to encrypt
 * @returns {Promise<string>} - The encrypted payload (iv + ciphertext) in Base64
 */
export async function encryptData(data) {
  try {
    const key = await getDerivedKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encodedData = new TextEncoder().encode(JSON.stringify(data));

    const cipherBuffer = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encodedData
    );

    // Combine IV and Ciphertext
    const cipherArray = new Uint8Array(cipherBuffer);
    const combinedArray = new Uint8Array(iv.length + cipherArray.length);
    combinedArray.set(iv, 0);
    combinedArray.set(cipherArray, iv.length);

    // Convert to Base64
    return btoa(String.fromCharCode.apply(null, combinedArray));
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypts a Base64 string back into a JSON object
 * @param {string} encryptedBase64 - The encrypted payload
 * @returns {Promise<Object>} - The decrypted state object
 */
export async function decryptData(encryptedBase64) {
  try {
    const key = await getDerivedKey();
    
    // Decode Base64 to ArrayBuffer
    const binaryStr = atob(encryptedBase64);
    const combinedArray = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      combinedArray[i] = binaryStr.charCodeAt(i);
    }

    // Extract IV and Ciphertext
    const iv = combinedArray.slice(0, 12);
    const ciphertext = combinedArray.slice(12);

    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      ciphertext
    );

    const decryptedStr = new TextDecoder().decode(decryptedBuffer);
    return JSON.parse(decryptedStr);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data');
  }
}
