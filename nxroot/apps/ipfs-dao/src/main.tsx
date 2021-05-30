import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom';

import App from './app/app';

import { generateKeyText } from './app/helpers/crypto';

async function init() {
  const keytext = await generateKeyText();
  ReactDOM.render(
    <StrictMode>
      <App keytext={keytext} />
    </StrictMode>,
    document.getElementById('root')
  );
}
init();
