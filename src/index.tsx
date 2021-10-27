import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './app';
import { startGame, hookEvents, unhookEvents } from './launcher';

ReactDOM.render(
  <React.StrictMode>
    <App
      startGame={startGame}
      subscribeEvent={hookEvents}
      unsubscribeEvent={unhookEvents}
    />
  </React.StrictMode>,
  document.getElementById('root'),
);
