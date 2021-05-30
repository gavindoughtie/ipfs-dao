export async function generateKey() {
  const key = await window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
  return key;
}

async function exportCryptoKey(key: CryptoKey) {
  const exported = await window.crypto.subtle.exportKey('jwk', key);
  return JSON.stringify(exported, null, ' ');
}

export async function loadCryptoKey(keytext: string) {
  const keyobj = JSON.parse(keytext);
  return crypto.subtle.importKey('jwk', keyobj, 'AES-GCM', true, [
    'encrypt',
    'decrypt',
  ]);
}

export async function generateKeyText() {
  const key = await generateKey();
  const keyText = await exportCryptoKey(key);
  return keyText;
}

type EncryptResults = {
  iv: Uint8Array;
  encryptedBuffer: ArrayBuffer;
};

// encrypt the ArrayBuffer and return
// the encrypted contents and the random iv key for the
// Galois encryption algo
export async function encrypt(
  buffer: ArrayBuffer,
  key: CryptoKey
): Promise<EncryptResults> {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encryptParams: AesGcmParams = {
    name: 'AES-GCM',
    iv,
  };
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    encryptParams,
    key,
    buffer
  );

  return {
    iv,
    encryptedBuffer,
  };
}

export type EncryptedFileResults = EncryptResults & {
  key: string;
};

export async function encryptFile(
  fileBuffer: ArrayBuffer,
  keytext: string
): Promise<EncryptedFileResults> {
  // Encrypt the file
  /* eslint-disable-next-line */
  const jwk = JSON.parse(keytext);
  const cryptoKey = await crypto.subtle.importKey('jwk', jwk, 'AES-GCM', true, [
    'encrypt',
    'decrypt',
  ]);
  const encryptionResult = await encrypt(fileBuffer, cryptoKey);
  const key = await exportCryptoKey(cryptoKey);
  return {
    key,
    ...encryptionResult,
  };
}

export async function decrypt(
  buffer: ArrayBuffer,
  key: CryptoKey,
  iv: Uint8Array
): Promise<ArrayBuffer> {
  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    buffer
  );
  return decrypted;
}
