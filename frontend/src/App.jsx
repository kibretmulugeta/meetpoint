import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Dashboard from './pages/Dashboard';
import CreateAppointment from './pages/CreateAppointment';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  
  return children;
}

// Temporary placeholder for Login
function Login() {
  const { login } = useAuth();
  
  const handleLogin = (e) => {
    e.preventDefault();
    login('test@example.com', 'password123'); // Demo purposes
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Log in to Scheduler</h1>
        <button 
          onClick={handleLogin}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Demo Login
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/appointments/new" 
          element={
            <ProtectedRoute>
              <CreateAppointment />
            </ProtectedRoute>
          } 
        />
        {/* We will add /calendar, and others here later */}
      </Routes>
    </Router>
  );
}

export default App;
