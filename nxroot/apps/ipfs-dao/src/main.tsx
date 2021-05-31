import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom';

import App from './app/app';

async function init() {
  ReactDOM.render(
    <StrictMode>
      <App />
    </StrictMode>,
    document.getElementById('root')
  );
}
init();
