import styles from './app.module.css';
import { Filezone } from './filezone/filezone';
import logo from '../assets/IPFS-DAO-Logo.png';
import { generatePrivateKey } from './helpers/crypto';
import { useState, ChangeEventHandler, ChangeEvent } from 'react';

export interface IAppProps {
  keytext: string;
}
export function App(props: IAppProps) {
  const [secret, setSecret] = useState('');
  const keytext = props.keytext;
  async function updatePrivateKey() {
    console.log('updatePrivateKey');
    if (secret) {
      const key = await generatePrivateKey(secret);
      console.log(`key: ${key}`);
    }
  }
  const handleChange: ChangeEventHandler = (e: ChangeEvent<HTMLInputElement>) =>
    setSecret(e.target?.value);

  return (
    <div className={styles.app}>
      <header className="flex">
        <img src={logo} alt="ipfs dao logo"></img>
      </header>
      <div className="login">
        <label htmlFor="loginInput">label="Human Login"</label>
        <input
          id="loginInput"
          title="Combine a private secret with Metamask signing to generate ed25519 private key (Enter a secret. View console.)"
          name="secret"
          value={secret}
          placeholder="Secret"
          type="password"
          onChange={handleChange}
        />
        <button onClick={() => updatePrivateKey()}>Login with Metamask</button>
      </div>
      <main>
        <Filezone keytext={keytext} />
      </main>
    </div>
  );
}

export default App;
