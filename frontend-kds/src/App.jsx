import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LoginPage from './pages/LoginPage';
import KdsPage from './pages/KdsPage';

const RutaProtegida = ({ children }) => {
  const token = localStorage.getItem('cafeteria_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: { background: '#333', color: '#fff', borderRadius: '10px', fontWeight: 'bold' },
        }}
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<RutaProtegida><KdsPage /></RutaProtegida>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;