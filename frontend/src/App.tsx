import React from 'react';
import logo from './logo.svg';
import './App.css';

import {Header} from 'modules/header';
import MainComponent from 'modules/main';

function App() {
  return (
    <div className="App">
      <Header count={0} />
      <MainComponent />
    </div>
  );
}

export default App;
