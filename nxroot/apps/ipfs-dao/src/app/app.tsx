import { Client, PrivateKey } from '@textile/hub';
import { ChangeEvent, ChangeEventHandler, useState } from 'react';
import logo from '../assets/IPFS-DAO-Logo.png';
import styles from './app.module.css';
import { Filezone } from './filezone/filezone';
import { getKeyInfo, loadPrivateKey, clearPrivateKey, storeApiKey, getApiKey } from './helpers/crypto';
import { auth, BucketInfo, setupBuckets } from './helpers/buckets';

export function App(props: { privateKey?: PrivateKey }) {
  const apiKeyState= useState('');
  const [secret, setSecret] = useState('');
  const [loggedOut, setLoggedOut] = useState(false);
  const pkState = useState<PrivateKey>();
  const [client, setClient] = useState<Client>();
  const clState = useState(false);
  const [bucketInfo, setBucketInfo] = useState<BucketInfo>();
  let clientLoading = clState[0];
  const setClientLoading = clState[1];

  let privateKey = pkState[0];
  const setPrivateKey = pkState[1];

  let apiKey = apiKeyState[0];
  const setApiKey = apiKeyState[1];
  if (!apiKey) {
    apiKey = getApiKey() ?? '';
    if (apiKey) {
      setApiKey(apiKey);
    }
  }

  const keyInfo = getKeyInfo();

  async function loadClient() {
    if (clientLoading) {
      return;
    }
    if (privateKey) {
      clientLoading = true;
      setClientLoading(true);
      const loadedClient = await auth(keyInfo, privateKey);
      console.dir(loadedClient);
      clientLoading = false;
      const setupBucketInfo = await setupBuckets(keyInfo, privateKey);
      setBucketInfo(setupBucketInfo);
      setClient(loadedClient);
      setClientLoading(false);      
    }
  }

  if (!loggedOut) {
    if (!privateKey && props.privateKey) {
      privateKey = props.privateKey;
      setPrivateKey(props.privateKey);
    }
    if (privateKey && !client && !clientLoading) {
      loadClient();
    }
  }

  async function updatePrivateKey() {
    storeApiKey(apiKey);
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

  const handleApiKeyChange: ChangeEventHandler = (e: ChangeEvent<HTMLInputElement>) =>
    setApiKey(e.target?.value);

  let mainUi;
  if (!client && clientLoading) {
    return <main><h1 className={styles.loading}>[IPFS-DAO]</h1></main>;
  } else if (privateKey && client && apiKey && bucketInfo) {
    mainUi = (
      <main>
        <Filezone privateKey={privateKey} client={client} bucketInfo={bucketInfo} />
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
          <label htmlFor="apiKeyInput">API Key:</label>
          <input
            id="apiKeyInput"
            name="apiKey"
            value={apiKey}
            placeholder="API Key"
            type="text"
            onChange={handleApiKeyChange}
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
  const logoutButton =
    privateKey && !loggedOut ? <button onClick={logout}>Log out</button> : null;
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
