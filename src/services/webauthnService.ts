
import { BiometricCredential } from '../types';

const bufferToBase64 = (buffer: ArrayBuffer): string => {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
};

const base64ToBuffer = (base64: string): ArrayBuffer => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

export const registerBiometrics = async (userId: string, userName: string): Promise<{ id: string; publicKey: string }> => {
  const challenge = window.crypto.getRandomValues(new Uint8Array(32));
  
  const createOptions: CredentialCreationOptions = {
    publicKey: {
      challenge,
      rp: { name: "Quantum Vault", id: window.location.hostname },
      user: {
        id: new TextEncoder().encode(userId),
        name: userName,
        displayName: userName
      },
      pubKeyCredParams: [{ alg: -7, type: "public-key" }, { alg: -257, type: "public-key" }],
      timeout: 60000,
      attestation: "none",
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required"
      }
    }
  };

  const credential = (await navigator.credentials.create(createOptions)) as PublicKeyCredential;
  if (!credential) throw new Error("Credential creation failed");

  return {
    id: bufferToBase64(credential.rawId),
    publicKey: bufferToBase64(credential.response.clientDataJSON)
  };
};

export const authenticateBiometrics = async (credentialId: string): Promise<boolean> => {
  const challenge = window.crypto.getRandomValues(new Uint8Array(32));
  
  const getOptions: CredentialRequestOptions = {
    publicKey: {
      challenge,
      allowCredentials: [{
        id: base64ToBuffer(credentialId),
        type: "public-key"
      }],
      timeout: 60000,
      userVerification: "required"
    }
  };

  try {
    const assertion = await navigator.credentials.get(getOptions);
    return !!assertion;
  } catch (e) {
    console.error("Biometric auth failed", e);
    return false;
  }
};
