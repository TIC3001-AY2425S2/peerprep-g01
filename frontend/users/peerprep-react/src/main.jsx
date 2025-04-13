import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Login from './components/Login.jsx'
import Register from './components/Register.jsx'
import Match from './components/Match.jsx'
import Home from './components/Home.jsx'
import CollabEditor from './components/CollabEditor.jsx'

export const router = createBrowserRouter([
  {path: '/', element: <App />},
  {path: '/login', element: <Login />},
  {path: '/register', element: <Register />},
  {path: '/match', element: <Match />},
  {path: '/collab/:collabId/:questionId', element: <CollabEditor />}
]);

createRoot(document.getElementById('root')).render( 
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>
)
