import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import './index.css';

import App from './App';
import * as serviceWorker from './serviceWorker';

import { configureStore } from 'store';

const store = configureStore;

const googleClientId = '412905520657-kp7kfhnj9qd285lhlrh1pnnt090k0948.apps.googleusercontent.com';

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App clientId={googleClientId} />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
