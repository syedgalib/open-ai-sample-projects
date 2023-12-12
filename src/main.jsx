import React from 'react';
import ReactDOM from 'react-dom/client';
// import App from '@app/MoviePitch';
// import App from '@app/Advertify';
// import App from '@app/ArtMatch';
// import App from '@root/src/apps/GeneralChatBot';
import App from '@root/src/apps/CustomChatBot';
import '@scss/index.scss';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
