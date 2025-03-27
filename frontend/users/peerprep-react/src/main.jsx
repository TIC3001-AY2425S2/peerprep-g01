import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { LiveblocksProvider } from "@liveblocks/react";
import { client } from './components/liveblocksClient.jsx';
import './index.css'
import App from './App.jsx'
import Login from './components/Login.jsx'
import Register from './components/Register.jsx'
import Match from './components/Match.jsx'
import Home from './components/Home.jsx'
import Collab from './components/Collab.jsx'

export const router = createBrowserRouter([
  {path: '/', element: <App />},
  {path: '/login', element: <Login />},
  {path: '/register', element: <Register />},
  {path: '/match', element: <Match />},
  {path: '/collab', element: <Collab />}
]);

createRoot(document.getElementById('root')).render( 
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>
)
