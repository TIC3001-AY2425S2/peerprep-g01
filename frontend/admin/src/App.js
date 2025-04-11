import React from 'react';
import Router from './components/Router';
import { AuthProvider } from './context/AuthProvider'; // Import AuthProvider
function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}

export default App;