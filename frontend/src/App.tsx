import React from 'react';
import logo from './logo.svg';
import './App.css';

import {Header} from 'modules/header';
import Login from 'modules/login';
import MainComponent from 'modules/main';

function App() {
  return (
    <div className="App">
      <Login clientId="412905520657-kp7kfhnj9qd285lhlrh1pnnt090k0948.apps.googleusercontent.com" />
      <Header count={0} />
      <MainComponent />
    </div>
  );
}

export default App;
