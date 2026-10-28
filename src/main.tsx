import './app.scss';

import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';

(['gesturestart', 'gesturechange', 'gestureend'] as string[]).forEach((eventName) => {
  document.addEventListener(
    eventName,
    (event: Event) => {
      event.preventDefault();
    },
    {
      capture: true,
      passive: false,
    },
  );
});

document.addEventListener(
  'wheel',
  (event) => {
    if (event.ctrlKey) {
      event.preventDefault();
    }
  },
  {
    capture: true,
    passive: false,
  },
);

document.addEventListener(
  'touchmove',
  (event) => {
    if (event.touches.length > 1) {
      event.preventDefault();
    }
  },
  {
    capture: true,
    passive: false,
  },
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
