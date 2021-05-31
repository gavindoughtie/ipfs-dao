import styles from './app.module.css';
import { Filezone } from './filezone/filezone';
import logo from '../assets/IPFS-DAO-Logo.png';
import { cryptoKeyForPrivateKey, loadPrivateKey, storeSecret } from './helpers/crypto';
import { useState, ChangeEventHandler, ChangeEvent } from 'react';
import { PrivateKey } from '@textile/hub';

export function App() {
  const [secret, setSecret] = useState('');
  const [keytext, setKeytext] = useState('');
  const [privateKey, setPrivateKey] = useState<PrivateKey>();
  // const [cryptoKey, setCryptoKey] = useState<CryptoKey>();

  // if (privateKey && !cryptoKey) {
  //   cryptoKeyForPrivateKey(privateKey, setCryptoKey);
  // }

  // const keytext = props.keytext;
  async function updatePrivateKey() {
    if (secret) {
      loadPrivateKey(secret, setPrivateKey);
      // storeSecret(secret);
      // const key = await generatePrivateKey(secret);
      // console.log(`key: ${key}`);
      // if (key) {
      //   setKeytext(key.toString());
      //   setPrivateKey(key);
      // }
    } else {
      alert('Please enter a non-empty secret');
    }
  }
  const handleChange: ChangeEventHandler = (e: ChangeEvent<HTMLInputElement>) =>
    setSecret(e.target?.value);

  let mainUi;
  if (privateKey) {
    mainUi = (
      <main>
        <Filezone privateKey={privateKey} />
      </main>
    );
  } else {
    mainUi = (
      <div className={styles.login}>
        <div className={styles.loginForm}>
          <label htmlFor="loginInput">Log In:</label>
          <input
            id="loginInput"
            name="secret"
            value={secret}
            placeholder="Secret"
            type="password"
            onChange={handleChange}
          />
          <button onClick={() => updatePrivateKey()}>
            Log In with Metamask
          </button>
        </div>
        <p>
          Combine a private secret with Metamask signing to generate ed25519
          private key.
        </p>
      </div>
    );
  }
  return (
    <div className={styles.app}>
      <header className="flex">
        <img src={logo} alt="ipfs dao logo"></img>
      </header>
      <h1>{keytext}</h1>
      {mainUi}
    </div>
  );
}

export default App;
