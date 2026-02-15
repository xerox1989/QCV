
import forge from 'node-forge';

// --- AES-GCM Encryption (Web Crypto API) ---

const SALT_SIZE = 16;
const IV_SIZE = 12;
const ITERATIONS = 100000;

const str2buf = (str: string) => new TextEncoder().encode(str);
const buf2str = (buf: ArrayBuffer) => new TextDecoder().decode(buf);

async function getKeyMaterial(password: string): Promise<CryptoKey> {
  return window.crypto.subtle.importKey(
    "raw",
    str2buf(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );
}

async function getKey(keyMaterial: CryptoKey, salt: Uint8Array): Promise<CryptoKey> {
  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export const encryptData = async (data: any, secret: string): Promise<string> => {
  try {
    const salt = window.crypto.getRandomValues(new Uint8Array(SALT_SIZE));
    const keyMaterial = await getKeyMaterial(secret);
    const key = await getKey(keyMaterial, salt);
    const iv = window.crypto.getRandomValues(new Uint8Array(IV_SIZE));
    
    const content = JSON.stringify(data);
    const encrypted = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      key,
      str2buf(content)
    );

    const combinedBuffer = new Uint8Array(salt.byteLength + iv.byteLength + encrypted.byteLength);
    combinedBuffer.set(salt, 0);
    combinedBuffer.set(iv, salt.byteLength);
    combinedBuffer.set(new Uint8Array(encrypted), salt.byteLength + iv.byteLength);

    return btoa(String.fromCharCode(...combinedBuffer));
  } catch (e) {
    console.error("Encryption failed", e);
    throw new Error("Encryption failed");
  }
};

export const decryptData = async (encryptedBase64: string, secret: string): Promise<any> => {
  try {
    const binaryStr = atob(encryptedBase64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    const salt = bytes.slice(0, SALT_SIZE);
    const iv = bytes.slice(SALT_SIZE, SALT_SIZE + IV_SIZE);
    const data = bytes.slice(SALT_SIZE + IV_SIZE);

    const keyMaterial = await getKeyMaterial(secret);
    const key = await getKey(keyMaterial, salt);

    const decrypted = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      key,
      data
    );

    return JSON.parse(buf2str(decrypted));
  } catch (e) {
    console.error("Decryption failed", e);
    throw new Error("Invalid Credentials");
  }
};

export const hashPin = async (pin: string): Promise<string> => {
  const msgBuffer = str2buf(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// --- Certificate Generation (node-forge) ---

export const generateSelfSignedCertificate = async (
  commonName: string, 
  org: string = 'QAV User', 
  issuerName: string = 'Self-Signed (QAV)', 
  validityYears: number = 1
) => {
  return new Promise<{cert: string, privateKey: string, publicKey: string}>((resolve, reject) => {
    try {
      // Generate Key Pair
      const keys = forge.pki.rsa.generateKeyPair(2048);
      
      // Create Certificate
      const cert = forge.pki.createCertificate();
      cert.publicKey = keys.publicKey;
      cert.serialNumber = '01' + Date.now();
      
      // Validity
      cert.validity.notBefore = new Date();
      cert.validity.notAfter = new Date();
      cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + validityYears);
      
      const subjectAttrs = [
        { name: 'commonName', value: commonName },
        { name: 'countryName', value: 'QAV' },
        { shortName: 'ST', value: 'SecureVault' },
        { name: 'organizationName', value: org },
        { shortName: 'OU', value: 'Identity' }
      ];
      
      const issuerAttrs = [
        { name: 'commonName', value: issuerName },
        { name: 'countryName', value: 'QAV' },
        { shortName: 'ST', value: 'SecureVault' },
        { name: 'organizationName', value: org },
        { shortName: 'OU', value: 'Issuer' }
      ];
      
      cert.setSubject(subjectAttrs);
      cert.setIssuer(issuerAttrs);
      
      // Sign with own private key (Self-Signed)
      cert.sign(keys.privateKey, forge.md.sha256.create());
      
      resolve({
        cert: forge.pki.certificateToPem(cert),
        privateKey: forge.pki.privateKeyToPem(keys.privateKey),
        publicKey: forge.pki.publicKeyToPem(keys.publicKey)
      });
    } catch (e) {
      reject(e);
    }
  });
};

export const generateJWTSecret = (length: 32 | 64): string => {
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
};
