import styles from './filezone.module.css';
import { useState } from 'react';
import { Dropzone } from '../dropzone/dropzone';
import { decrypt, EncryptResults } from '../helpers/crypto';
import { PrivateKey } from '@textile/hub';

/* eslint-disable-next-line */
export interface FilezoneProps {
  privateKey: PrivateKey;
}

function resultsToString(results?: Uint8Array) {
  if (!results) {
    return '';
  }
  const objJsonStr = JSON.stringify(results);
  return btoa(objJsonStr);
}

export function Filezone({ privateKey }: FilezoneProps) {
  const [encrypted, setEncrypted] = useState<Uint8Array | undefined>();
  const [decrypted, setDecrypted] = useState('');

  function uploadCallback(results?: Uint8Array) {
    setEncrypted(results);
  }

  async function decryptResults(
    privateKey: PrivateKey,
    resultsObject: Uint8Array
  ) {
    return privateKey.decrypt(resultsObject);
  }

  async function olddecryptResults(
    privateKey: CryptoKey,
    resultsObject?: EncryptResults
  ) {
    if (resultsObject) {
      const decryptedObj = await decrypt(
        resultsObject.encryptedBuffer,
        privateKey,
        resultsObject.iv
      );
      setDecrypted(new TextDecoder().decode(decryptedObj));
    }
  }

  const decryptBuffer = async () => {
    if (encrypted) {
      const decryptedObj = await decryptResults(privateKey, encrypted);
      setDecrypted(new TextDecoder().decode(decryptedObj));
    }
  };

  return (
    <div className={styles.filezone}>
      <div className={styles.dropAndInstruction}>
        <Dropzone uploadCallback={uploadCallback} privateKey={privateKey} />
        <p className={styles.description}>
          IPFS-DAO encrypts files locally using web crypto before uploading them
          to IPFS. Individuals may then purchase access to files and will
          receive bespoke downloads encrypted with the public key that
          accompanies their payment, administered via an Ethereum contract.
        </p>
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
