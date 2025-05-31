// src/index.js
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { GoogleOAuthProvider } from '@react-oauth/google';
// import { BrowserRouter } from "react-router-dom"; // <-- REMOVE or COMMENT OUT THIS IMPORT

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
        <App />
    </GoogleOAuthProvider>
);