import { KeyInfo, PrivateKey } from '@textile/hub';
import { hashSync } from 'bcryptjs';
import { BigNumber, providers, Signer, utils } from 'ethers';

export const SECRET_KEY = 'ipfs-dao-secret-key';
export const SIGNED_HASH_STRING_KEY = 'ipfs-dao-signed-hash-key';

export function getKeyInfo(): KeyInfo {
  return {
    key: 'bq4maweotdbqntj4tjeg4qstgyq',
  }
}

export function loadHashKeyString() {
  return localStorage.getItem(SIGNED_HASH_STRING_KEY);
}

export function storeHashKeyString(hashKeyString?: string) {
  if (!hashKeyString) {
    return localStorage.removeItem(SIGNED_HASH_STRING_KEY);
  }
  return localStorage.setItem(
    SIGNED_HASH_STRING_KEY,
    hashKeyString
  );
}

export type EncryptResults = {
  iv: Uint8Array;
  encryptedBuffer: ArrayBuffer;
};

export async function encrypt(buffer: ArrayBuffer, identity: PrivateKey): Promise<ArrayBuffer> {
  const uint8View = new Uint8Array(buffer);
  const encryptedArray = await identity.public.encrypt(uint8View);
  return encryptedArray.buffer;
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

export function clearPrivateKey() {
  storeHashKeyString(undefined);
}

export async function loadPrivateKey(
  userSecret: string | undefined,
  setKey: (privateKey?: PrivateKey) => void
) {
  // Do we have a key in storage?
  let hashKeyString = loadHashKeyString();
  if (!hashKeyString && userSecret) {
    hashKeyString = await signedHashString(userSecret);
    storeHashKeyString(hashKeyString);
  }
  if (hashKeyString) {
    const privateKey = await privateKeyFromHashString(hashKeyString);
    if (privateKey) {
      setKey(privateKey);
    }
  } else {
    setKey(undefined)
  }
}

export async function signedHashString(userSecret: string): Promise<string> {
  const metamask = await getAddressAndSigner();
  // avoid sending the raw secret by hashing it first
  const secret = hashSync(userSecret, 10);
  const message = generateMessageForEntropy(
    metamask.address,
    'ipfs-dao',
    secret
  );
  const signedText = await metamask.signer.signMessage(message);
  return utils.keccak256(signedText);
}

export async function generatePrivateKey(
  userSecret: string
): Promise<PrivateKey> {
  const hashString = await signedHashString(userSecret);
  return privateKeyFromHashString(hashString);
}

export async function privateKeyFromHashString(
  hashString: string
): Promise<PrivateKey> {
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
