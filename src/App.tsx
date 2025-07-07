import { AuthProvider } from '@/components/auth/AuthProvider';
import { MainLayout } from '@/components/layout/MainLayout';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}

export default App;