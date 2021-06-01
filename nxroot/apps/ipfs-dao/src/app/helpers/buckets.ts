// Utilities for working with textile buckets
import {
  Buckets,
  // BuckMetadata,
  Client,
  Identity,
  KeyInfo,
  PrivateKey,
  PushPathResult,
} from '@textile/hub';

import { encrypt } from './crypto';

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

export function xinsertFile(
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

export async function encryptAndInsertFile(
  buckets: Buckets,
  bucketKey: string,
  path: string,
  file: File,
  privateKey: PrivateKey
): Promise<PushPathResult> {
  const bytes = await encryptFile(file, privateKey);
  return insertFileBytes(buckets, bucketKey, bytes, path);
}

export async function encryptFile(
  file: File,
  privateKey: PrivateKey
): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onabort = () => reject('file reading was aborted');
    reader.onerror = () => reject('file reading has failed');
    reader.onload = async () => {
      const fileContents = reader.result;
      if (fileContents && typeof fileContents !== 'string') {
        resolve(encrypt(fileContents, privateKey));
      }
    };

    reader.readAsArrayBuffer(file);
  });
}

export type FileCallbackFn = (files: File[]) => void;
export type FileCallbackHandler = (uploading: Promise<PushPathResult>[]) => void;
export function makeFileCallback(
  buckets: Buckets,
  bucketKey: string,
  privateKey: PrivateKey,
  handler: FileCallbackHandler
): FileCallbackFn {
  return (acceptedFiles: File[]) => {
    const pendingUploads: Promise<PushPathResult>[] = [];
    acceptedFiles.forEach((file) => {
      pendingUploads.push(
        encryptAndInsertFile(
          buckets,
          bucketKey,
          getUniqueFilePath(privateKey),
          file,
          privateKey
        )
      );
    });
    handler(pendingUploads);
  };
}

export async function insertFileBytes(
  buckets: Buckets,
  bucketKey: string,
  binaryStr: string | ArrayBuffer | null,
  path: string
): Promise<PushPathResult> {
  return buckets.pushPath(bucketKey, path, binaryStr);
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
