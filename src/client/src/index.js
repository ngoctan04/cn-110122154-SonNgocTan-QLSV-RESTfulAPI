import React from 'react';
import ReactDOM from 'react-dom/client';

import './styles/variables.css';
import './custom-bootstrap.css';
import App from './App';
import {Toaster} from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
      <Toaster/>
    </AuthProvider>
  </React.StrictMode>
);


