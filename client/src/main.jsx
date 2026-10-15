import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/base.css';
import './styles/controls.css';
import './styles/landing.css';
import './styles/app.css';
import './styles/booking.css';
import './styles/my-bookings.css';
import './styles/agenda.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
