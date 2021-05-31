import { PrivateKey } from '@textile/hub';
import { ChangeEvent, ChangeEventHandler, useState } from 'react';
import logo from '../assets/IPFS-DAO-Logo.png';
import styles from './app.module.css';
import { Filezone } from './filezone/filezone';
import { loadPrivateKey, clearPrivateKey } from './helpers/crypto';

export function App(props: { privateKey?: PrivateKey }) {
  const [secret, setSecret] = useState('');
  const [loggedOut, setLoggedOut] = useState(false);
  const pkState = useState<PrivateKey>();
  let privateKey = pkState[0];
  const setPrivateKey = pkState[1];
  if (!loggedOut && !privateKey && props.privateKey) {
    privateKey = props.privateKey;
    setPrivateKey(props.privateKey);
  }
  async function updatePrivateKey() {
    if (secret) {
      loadPrivateKey(secret, setPrivateKey);
    } else {
      alert('Please enter a non-empty secret');
    }
  }

  function logout() {
    clearPrivateKey();
    setPrivateKey(undefined);
    setLoggedOut(true);
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
  const logoutButton = privateKey && !loggedOut ? (<button onClick={logout}>Log out</button>) : null;
  return (
    <div className={styles.app}>
      <header className="flex">
        <img src={logo} width="460" height="179" alt="ipfs dao logo"></img>
        {logoutButton}
      </header>
      <p className={styles.keyDisplay}>{privateKey?.toString()}</p>
      {mainUi}
    </div>
  );
}

export default App;
