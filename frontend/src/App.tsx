import React from 'react';

import './App.css';

import { Header } from 'modules/header';
import Login from 'modules/login';
import MainComponent from 'modules/main';

interface Props {
  clientId: string
}

function App(props: Props) {
  return (
    <div className="App">
      <Login clientId={props.clientId} />
      <Header count={0} />
      <MainComponent />
    </div>
  );
}

export default App;
