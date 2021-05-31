// Utilities for working with textile buckets
import {
  Buckets,
  BuckMetadata,
  Client,
  Identity,
  KeyInfo,
  PrivateKey,
  PushPathResult,
} from '@textile/hub';

export interface BucketInfo {
  buckets: Buckets;
  bucketKey: string;
  threadID?: string;
}

export function getUniqueFilePath(privateKey: PrivateKey) {
  const keyStr = privateKey.pubKey.join('');
  return `${keyStr}/${Math.round(Date.now() / 1000)}`;
}

export async function setupBuckets(
  key: KeyInfo,
  identity: Identity
): Promise<BucketInfo> {
  // Use the insecure key to set up the buckets client
  const buckets = await Buckets.withKeyInfo(key);
  // Authorize the user and your insecure keys with getToken
  await buckets.getToken(identity);

  const result = await buckets.getOrCreate('ipfs-dao-root', {
    encrypted: true,
  });
  if (!result.root) {
    throw new Error('Failed to open bucket');
  }
  console.dir(result);
  console.dir(buckets);
  return {
    buckets: buckets,
    bucketKey: result.root.key,
    threadID: result.threadID,
  };
}

export function insertFile(
  buckets: Buckets,
  bucketKey: string,
  file: File,
  path: string
): Promise<PushPathResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onabort = () => reject('file reading was aborted');
    reader.onerror = () => reject('file reading has failed');
    reader.onload = () => {
      const binaryStr = reader.result;
      // Finally, push the full file to the bucket
      insertFileBytes(buckets, bucketKey, binaryStr, path).then((raw) => {
        resolve(raw);
      });
    };
    reader.readAsArrayBuffer(file);
  });
}

export async function insertFileBytes(
  buckets: Buckets,
  bucketKey: string,
  binaryStr: string | ArrayBuffer | null,
  path: string
): Promise<PushPathResult> {
  try {
    const result = await buckets.pushPath(bucketKey, path, binaryStr);
    // eslint-disable-next-line
    debugger;
    return result;
  } catch (e) {
    // eslint-disable-next-line
    debugger;
    console.dir(e);
    console.error(e);
  }
}

/*
 * @example
 * Create a Bucket called "app-name-files"
 * ```typescript
 * import { Buckets, UserAuth } from '@textile/hub'
 *
 * const open = async (auth: UserAuth, name: string) => {
 *     const buckets = Buckets.withUserAuth(auth)
 *     const { root, threadID } = await buckets.getOrCreate(name)
 *     return { buckets, root, threadID }
 * }
 * ```
 */
export async function makeBucket(
  privateKey: PrivateKey,
  metadata: BuckMetadata
) {
  // createUserAuth()
}

async function authorize(key: KeyInfo, identity: Identity) {
  const client = await Client.withKeyInfo(key);
  await client.getToken(identity);
  return client;
}

export async function auth(
  keyInfo: KeyInfo,
  privateKey: PrivateKey
): Promise<Client> {
  return authorize(keyInfo, privateKey);
}
