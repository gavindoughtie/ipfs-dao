import { PrivateKey } from '@textile/hub';
import { BigNumber, providers, utils, Signer } from 'ethers';
import { hashSync } from 'bcryptjs';

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

export type WindowInstanceWithEthereum = Window &
  typeof globalThis & { ethereum?: providers.ExternalProvider };

export class StrongType<Definition, Type> {
  private _type: Definition;
  constructor(public value?: Type) {
    /* eslint-disable-next-line */
    this._type = undefined as any;
  }
}
export class EthereumAddress extends StrongType<'ethereum_address', string> {}

export function generateMessageForEntropy(
  ethereum_address: EthereumAddress,
  application_name: string,
  secret: string
): string {
  return (
    '******************************************************************************** \n' +
    'READ THIS MESSAGE CAREFULLY. \n' +
    'DO NOT SHARE THIS SIGNED MESSAGE WITH ANYONE OR THEY WILL HAVE READ AND WRITE \n' +
    'ACCESS TO THIS APPLICATION. \n' +
    'DO NOT SIGN THIS MESSAGE IF THE FOLLOWING IS NOT TRUE OR YOU DO NOT CONSENT \n' +
    'TO THE CURRENT APPLICATION HAVING ACCESS TO THE FOLLOWING APPLICATION. \n' +
    '******************************************************************************** \n' +
    'The Ethereum address used by this application is: \n' +
    '\n' +
    ethereum_address.value +
    '\n' +
    '\n' +
    '\n' +
    'By signing this message, you authorize the current application to use the \n' +
    'following app associated with the above address: \n' +
    '\n' +
    application_name +
    '\n' +
    '\n' +
    '\n' +
    'The hash of your non-recoverable, private, non-persisted password or secret \n' +
    'phrase is: \n' +
    '\n' +
    secret +
    '\n' +
    '\n' +
    '\n' +
    '******************************************************************************** \n' +
    'ONLY SIGN THIS MESSAGE IF YOU CONSENT TO THE CURRENT PAGE ACCESSING THE KEYS \n' +
    'ASSOCIATED WITH THE ABOVE ADDRESS AND APPLICATION. \n' +
    'AGAIN, DO NOT SHARE THIS SIGNED MESSAGE WITH ANYONE OR THEY WILL HAVE READ AND \n' +
    'WRITE ACCESS TO THIS APPLICATION. \n' +
    '******************************************************************************** \n'
  );
}

function getExtermalProvider(): providers.ExternalProvider {
  const externalProvider = (window as WindowInstanceWithEthereum).ethereum;
  if (externalProvider) {
    return externalProvider;
  } else {
    throw new Error(
      'Ethereum is not connected. Please download Metamask from https://metamask.io/download.html'
    );
  }
}

async function getSigner(): Promise<Signer> {
  const externalProvider = getExtermalProvider();

  console.debug('Initializing web3 provider...');

  const provider = new providers.Web3Provider(externalProvider);
  return provider.getSigner();
}

export async function getAddressAndSigner(): Promise<{
  address: EthereumAddress;
  signer: Signer;
}> {
  const signer = await getSigner();
  const externalProvider = getExtermalProvider();
  const request = externalProvider.request;
  if (!request) {
    throw new Error('No request available on provider');
  }
  const accounts = await request({ method: 'eth_requestAccounts' });
  if (accounts.length === 0) {
    throw new Error(
      'No account is provided. Please provide an account to this application.'
    );
  }

  const address = new EthereumAddress(accounts[0]);

  return { address, signer };
}

export async function generatePrivateKey(
  userSecret: string
): Promise<PrivateKey> {
  const metamask = await getAddressAndSigner();
  // avoid sending the raw secret by hashing it first
  const secret = hashSync(userSecret, 10);
  const message = generateMessageForEntropy(
    metamask.address,
    'ipfs-dao',
    secret
  );
  const signedText = await metamask.signer.signMessage(message);
  const hashString = utils.keccak256(signedText);
  let hashArray: number[] = [];
  if (!hashString) {
    throw new Error(
      'No account is provided. Please provide an account to this application.'
    );
  } else {
    // The following line converts the hash in hex to an array of 32 integers.
    const matches = hashString.replace('0x', '').match(/.{2}/g);
    if (matches) {
      hashArray = matches.map((hexNoPrefix) =>
        BigNumber.from('0x' + hexNoPrefix).toNumber()
      );
    }
    if (hashArray.length !== 32) {
      throw new Error(
        'Hash of signature is not the correct size! Something went wrong!'
      );
    }
  }
  const identity = PrivateKey.fromRawEd25519Seed(Uint8Array.from(hashArray));
  console.log(identity.toString());

  createNotification(identity);

  // Your app can now use this identity for generating a user Mailbox, Threads, Buckets, etc
  return identity;
}

function createNotification(identity: PrivateKey) {
  console.dir({
    name: 'create-notification',
    detail: {
      id: 1,
      description: `PubKey: ${identity.public.toString()}. Your app can now generate and reuse this users PrivateKey for creating user Mailboxes, Threads, and Buckets.`,
      timeout: 5000,
    },
  });
}
