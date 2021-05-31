import { Client, PrivateKey } from '@textile/hub';
import { useState } from 'react';
import { Dropzone } from '../dropzone/dropzone';
import {
  BucketInfo,
  insertFileBytes,
  getUniqueFilePath,
} from '../helpers/buckets';
import styles from './filezone.module.css';

export interface FilezoneProps {
  privateKey: PrivateKey;
  client: Client;
  bucketInfo?: BucketInfo;
}

function resultsToString(results?: ArrayBuffer) {
  if (!results) {
    return '';
  }
  const objJsonStr = JSON.stringify(results);
  return btoa(objJsonStr);
}

export function Filezone({ privateKey, client, bucketInfo }: FilezoneProps) {
  const [encrypted, setEncrypted] = useState<ArrayBuffer | undefined>();
  const [decrypted, setDecrypted] = useState('');

  async function uploadCallback(results?: ArrayBuffer) {
    if (results && bucketInfo?.buckets) {
      await insertFileBytes(
        bucketInfo.buckets,
        bucketInfo?.bucketKey,
        results,
        getUniqueFilePath(privateKey)
      );
    }
    setEncrypted(results);
  }

  async function decryptResults(
    privateKey: PrivateKey,
    resultsObject: Uint8Array
  ) {
    return privateKey.decrypt(resultsObject);
  }

  const decryptBuffer = async () => {
    if (encrypted) {
      const decryptedObj = await decryptResults(
        privateKey,
        new Uint8Array(encrypted)
      );
      setDecrypted(new TextDecoder().decode(decryptedObj));
    }
  };

  return (
    <div className={styles.filezone}>
      <div className={styles.dropAndInstruction}>
        <Dropzone uploadCallback={uploadCallback} privateKey={privateKey} />
        <div className={styles.description}>
          IPFS-DAO encrypts files locally using web crypto before uploading them
          to IPFS. Individuals may then purchase access to files and will
          receive bespoke downloads encrypted with the public key that
          accompanies their payment, administered via an Ethereum contract.
          <h3>Bucket Info</h3>
          <p>{bucketInfo?.bucketKey}</p>
          <p>{JSON.stringify(bucketInfo?.buckets)}</p>
        </div>
      </div>
      <div className={styles.outputs}>
        <p className={styles.encrypted}>{resultsToString(encrypted)}</p>
        <span className={styles.label}>
          Click the button to decrypt the encrypted buffer
        </span>
        <button type="button" onClick={decryptBuffer}>
          Decrypt
        </button>
        <p className={styles.decrypted}>{decrypted}</p>
      </div>
    </div>
  );
}

export default Filezone;
