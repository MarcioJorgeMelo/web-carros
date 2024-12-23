import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { router } from './App';
import './index.css';

import { RouterProvider } from "react-router-dom";
import AuthProvider from './context/AuthContent';

import { register } from "swiper/element-bundle";

register();
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router}/>
    </AuthProvider>
  </StrictMode>,
)
