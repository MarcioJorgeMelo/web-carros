import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { router } from './App';
import './index.css';

import { RouterProvider } from "react-router-dom";
import authProvider from "./context/AuthContent";
import AuthProvider from './context/AuthContent';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router}/>
    </AuthProvider>
  </StrictMode>,
)
