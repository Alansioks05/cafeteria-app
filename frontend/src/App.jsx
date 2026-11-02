import { Toaster } from 'react-hot-toast';
import ClientePage from './pages/ClientePage';

function App() {
  return (
    <>
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: { background: '#333', color: '#fff', borderRadius: '10px', fontWeight: 'bold' },
        }}
      />
      <ClientePage />
    </>
  );
}

export default App;