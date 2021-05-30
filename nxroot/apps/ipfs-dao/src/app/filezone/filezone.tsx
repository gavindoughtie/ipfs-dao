import styles from './filezone.module.css';
import { useState } from 'react';
import { Dropzone } from '../dropzone/dropzone';
import {
  loadCryptoKey,
  decrypt,
  EncryptedFileResults,
} from '../helpers/crypto';

/* eslint-disable-next-line */
export interface FilezoneProps {
  keytext: string;
}

function resultsToString(results?: EncryptedFileResults) {
  if (!results) {
    return '';
  }
  const objJsonStr = JSON.stringify(results);
  return btoa(objJsonStr);
}

export function Filezone({ keytext }: FilezoneProps) {
  const [encrypted, setEncrypted] = useState<
    EncryptedFileResults | undefined
  >();
  const [decrypted, setDecrypted] = useState('');

  function uploadCallback(results?: EncryptedFileResults) {
    setEncrypted(results);
  }

  async function decryptResults(
    keystring: string,
    resultsObject?: EncryptedFileResults
  ) {
    if (resultsObject) {
      const key = await loadCryptoKey(keystring);
      const decryptedObj = await decrypt(
        resultsObject.encryptedBuffer,
        key,
        resultsObject.iv
      );
      setDecrypted(new TextDecoder().decode(decryptedObj));
    }
  }

  return (
    <div className={styles.filezone}>
      <div className={styles.dropAndInstruction}>
        <Dropzone uploadCallback={uploadCallback} keytext={keytext} />
        <p className={styles.description}>IPFS-DAO encrypts files locally using web crypto before
        uploading them to IPFS. Individuals may then purchase access to files and will receive
        bespoke downloads encrypted with the public key that accompanies their payment, administered via
        an Ethereum contract.</p>
      </div>
      <div className={styles.outputs}>
        <p className={styles.encrypted}>{resultsToString(encrypted)}</p>
        <span className={styles.label}>Click the button to decrypt the encrypted buffer</span><button
          type="button"
          onClick={() => decryptResults(keytext, encrypted)}
        >
          Decrypt
        </button>
        <p className={styles.decrypted}>{decrypted}</p>
      </div>
    </div>
  );
}

export default Filezone;
