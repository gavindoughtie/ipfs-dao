import { PrivateKey } from '@textile/crypto';
import { StrictMode, useState } from 'react';
import * as ReactDOM from 'react-dom';
import { loadPrivateKey } from './app/helpers/crypto';

import App from './app/app';

async function init() {
  const privateKey = await loadPrivateKey(
    undefined,
    (privateKey?: PrivateKey) => {
      ReactDOM.render(
        <StrictMode>
          <App privateKey={privateKey} />
        </StrictMode>,
        document.getElementById('root')
      );
    }
  );
}
init();
