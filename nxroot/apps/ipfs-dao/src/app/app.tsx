import { PrivateKey } from '@textile/hub';
import { ChangeEvent, ChangeEventHandler, useState } from 'react';
import logo from '../assets/IPFS-DAO-Logo.png';
import styles from './app.module.css';
import { Filezone } from './filezone/filezone';
import { loadPrivateKey } from './helpers/crypto';

export function App() {
  const [secret, setSecret] = useState('');
  const [privateKey, setPrivateKey] = useState<PrivateKey>();
  async function updatePrivateKey() {
    if (secret) {
      loadPrivateKey(secret, setPrivateKey);
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
        <h1>{privateKey?.toString()}</h1>
        <Filezone privateKey={privateKey} />
      </main>
    );
  } else {
    mainUi = (
      <main className={styles.login}>
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
      </main>
    );
  }
  return (
    <div className={styles.app}>
      <header className="flex">
        <img src={logo} alt="ipfs dao logo"></img>
      </header>
      {mainUi}
    </div>
  );
}

export default App;
