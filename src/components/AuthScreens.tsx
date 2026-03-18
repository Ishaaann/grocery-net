import React, { useState } from 'react';
import { UserRole } from '../types';
import { mockServer } from '../services/mockServer';
import { User, ShoppingCart, Store, ArrowRight, UserCircle, ArrowLeft, Loader2 } from 'lucide-react';

interface AuthScreenProps {
  onLoginSuccess: (user: any) => void;
  onNavigate: (screen: 'landing' | 'login' | 'register') => void;
}

// Android-style input field component
const AndroidInput = ({ label, type = "text", value, onChange, placeholder }: any) => (
  <div className="mb-4">
    <label className="block text-xs font-medium text-emerald-700 uppercase mb-1 ml-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-gray-800"
    />
  </div>
);

// Android-style Button
const AndroidButton = ({ onClick, children, variant = 'primary', disabled = false, icon: Icon }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full py-3.5 px-4 rounded-lg font-bold text-sm uppercase tracking-wide shadow-md transform active:scale-95 transition-all flex items-center justify-center space-x-2 
      ${disabled ? 'opacity-70 cursor-not-allowed' : ''}
      ${variant === 'primary' 
        ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
        : 'bg-white text-emerald-700 border border-emerald-600 hover:bg-emerald-50'
      }`}
  >
    {disabled ? <Loader2 className="animate-spin h-5 w-5" /> : Icon && <Icon className="h-5 w-5" />}
    <span>{children}</span>
  </button>
);

export const LandingScreen: React.FC<Pick<AuthScreenProps, 'onNavigate'>> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col h-full bg-white relative overflow-hidden">
      {/* Decorative Circles */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-100 rounded-full opacity-50"></div>
      <div className="absolute top-40 -left-10 w-32 h-32 bg-teal-100 rounded-full opacity-50"></div>

      <div className="flex-1 flex flex-col justify-center items-center px-8 z-10">
        <div className="bg-emerald-600 p-4 rounded-2xl shadow-xl mb-6 transform rotate-3">
          <Store className="h-16 w-16 text-white" />
        </div>
        <h1 className="text-4xl font-extrabold text-emerald-800 mb-2 tracking-tight">GroceryNet</h1>
        <p className="text-gray-500 text-center mb-12 max-w-xs">
          Your neighborhood marketplace. Shop local, delivered fast.
        </p>

        <div className="w-full space-y-4 max-w-sm">
          <AndroidButton onClick={() => onNavigate('login')} icon={UserCircle}>
            Login
          </AndroidButton>
          <AndroidButton onClick={() => onNavigate('register')} variant="outline" icon={ArrowRight}>
            Create Account
          </AndroidButton>
        </div>
      </div>
      
      <div className="p-4 text-center text-xs text-gray-400">
        v1.0.0 &bull; Android Build
      </div>
    </div>
  );
};

export const LoginScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess, onNavigate }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await mockServer.login(username, password);
      if (res.success && res.data) {
        onLoginSuccess(res.data);
      } else {
        setError(res.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-6 pt-12 pb-6">
        <button onClick={() => onNavigate('landing')} className="text-gray-500 hover:text-emerald-600 transition-colors">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h2 className="text-3xl font-bold text-gray-900 mt-6">Welcome Back!</h2>
        <p className="text-gray-500 mt-2">Sign in to continue.</p>
      </div>

      <div className="flex-1 px-6">
        <form onSubmit={handleLogin} className="space-y-2">
          <AndroidInput 
            label="Username" 
            value={username} 
            onChange={(e: any) => setUsername(e.target.value)} 
            placeholder="Enter your username"
          />
          <AndroidInput 
            label="Password" 
            type="password"
            value={password} 
            onChange={(e: any) => setPassword(e.target.value)} 
            placeholder="Enter your password"
          />
          
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 flex items-center">
              <span className="mr-2">⚠️</span> {error}
            </div>
          )}

          <div className="pt-6">
            <AndroidButton onClick={handleLogin} disabled={loading} icon={ArrowRight}>
              {loading ? 'Signing in...' : 'Sign In'}
            </AndroidButton>
          </div>
        </form>
        
        <div className="mt-8">
             <p className="text-xs text-center text-gray-400">Try mock users:</p>
             <div className="flex justify-center space-x-2 mt-2 text-xs">
                 <span className="bg-gray-100 px-2 py-1 rounded text-gray-600 font-mono">owner1 / password</span>
                 <span className="bg-gray-100 px-2 py-1 rounded text-gray-600 font-mono">alice / password</span>
             </div>
        </div>
      </div>
    </div>
  );
};

export const RegisterScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess, onNavigate }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.CUSTOMER);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !name) {
        setError("All fields are required");
        return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await mockServer.register(username, password, role, name);
      if (res.success && res.data) {
        onLoginSuccess(res.data);
      } else {
        setError(res.error || 'Registration failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-6 pt-8 pb-4">
        <button onClick={() => onNavigate('landing')} className="text-gray-500 hover:text-emerald-600 transition-colors">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h2 className="text-3xl font-bold text-gray-900 mt-4">Create Account</h2>
        <p className="text-gray-500 mt-1">Join GroceryNet today.</p>
      </div>

      <div className="flex-1 px-6 overflow-y-auto pb-6">
        <form onSubmit={handleRegister} className="space-y-3">
          <AndroidInput 
            label="Full Name" 
            value={name} 
            onChange={(e: any) => setName(e.target.value)} 
            placeholder="John Doe"
          />
          <AndroidInput 
            label="Username" 
            value={username} 
            onChange={(e: any) => setUsername(e.target.value)} 
            placeholder="johndoe"
          />
          <AndroidInput 
            label="Password" 
            type="password"
            value={password} 
            onChange={(e: any) => setPassword(e.target.value)} 
            placeholder="••••••••"
          />

          <div className="mb-6">
             <label className="block text-xs font-medium text-emerald-700 uppercase mb-2 ml-1">I am a...</label>
             <div className="grid grid-cols-2 gap-3">
                 <button
                    type="button"
                    onClick={() => setRole(UserRole.CUSTOMER)}
                    className={`p-3 rounded-lg border-2 text-sm font-bold flex flex-col items-center justify-center space-y-1 transition-all
                        ${role === UserRole.CUSTOMER 
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                            : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}
                 >
                     <ShoppingCart className="h-6 w-6" />
                     <span>Customer</span>
                 </button>
                 <button
                    type="button"
                    onClick={() => setRole(UserRole.OWNER)}
                    className={`p-3 rounded-lg border-2 text-sm font-bold flex flex-col items-center justify-center space-y-1 transition-all
                        ${role === UserRole.OWNER 
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                            : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}
                 >
                     <Store className="h-6 w-6" />
                     <span>Shop Owner</span>
                 </button>
             </div>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div className="pt-2">
            <AndroidButton onClick={handleRegister} disabled={loading} icon={ArrowRight}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </AndroidButton>
          </div>
        </form>
      </div>
    </div>
  );
};