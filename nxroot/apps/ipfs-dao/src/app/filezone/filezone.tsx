import './filezone.module.css';
import { useState } from 'react';
import { Dropzone } from '../dropzone/dropzone';
import { loadCryptoKey, decrypt, EncryptedFileResults } from '../helpers/crypto';

/* eslint-disable-next-line */
export interface FilezoneProps {
  keytext: string
}

export function Filezone({keytext}: FilezoneProps) {
  const [encrypted, setEncrypted] = useState<EncryptedFileResults | undefined>();
  const [decrypted, setDecrypted] = useState('');

  function uploadCallback(results?: EncryptedFileResults) {
    setEncrypted(results);
  }

  async function decryptResults(keystring: string, resultsObject?: EncryptedFileResults) {
    if (resultsObject) {
      const key = await loadCryptoKey(keystring);
      const decryptedObj = await decrypt(resultsObject.encryptedBuffer, key, resultsObject.iv);
      setDecrypted(new TextDecoder().decode(decryptedObj));
    }
  }

  return (
    <div>
      <h1>Welcome to filezone!</h1>
      <Dropzone uploadCallback={uploadCallback} keytext={keytext} />
      <p>{JSON.stringify(encrypted)}</p>
      <p>{decrypted}</p>
      <button type="button" onClick={() => decryptResults(keytext, encrypted)}>
        Decrypt
      </button>     
    </div>
  );
}

export default Filezone;
