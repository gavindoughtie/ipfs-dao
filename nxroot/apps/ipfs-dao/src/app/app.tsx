import styles from './app.module.css';
import { Filezone } from './filezone/filezone';
import logo from '../assets/IPFS-DAO-Logo.png';

export interface IAppProps {keytext: string};
export function App(props: IAppProps) {
  const keytext = props.keytext;
  return (
    <div className={styles.app}>
      <header className="flex">
        <img src={logo} alt="ipfs dao logo"></img>
      </header>
      <main>
        <Filezone keytext={keytext}/>
      </main>
    </div>
  );
}

export default App;
