import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { getUsers } from '../utils/storageManager';
import botivateLogoB from '../Assets/logo.png';
import Footer from '../components/Footer';

const Login = () => {
  const [id, setId] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const users = getUsers();
      const matchedUser = users.find(
        (u) => u.id === id && u.password === password
      );

      if (!matchedUser) {
        toast.error('Invalid credentials');
        setSubmitting(false);
        return;
      }

      toast.success('Login successful!');
      login(matchedUser);
      navigate("/", { replace: true });
    } catch (err) {
      console.error(err);
      toast.error('Login error');
    } finally {
      setSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-slate-50 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-sky-200/50 blur-3xl animate-pulse" style={{ animationDuration: '6s' }}></div>
        <div className="absolute top-[20%] -right-[5%] w-[35%] h-[50%] rounded-full bg-blue-200/40 blur-3xl animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute -bottom-[15%] left-[15%] w-[50%] h-[45%] rounded-full bg-sky-300/30 blur-3xl animate-pulse" style={{ animationDuration: '7s' }}></div>
      </div>

      {/* Center Content */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-sm bg-white/80 backdrop-blur-2xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/60 p-6 sm:p-8 space-y-6 transition-all hover:shadow-[0_8px_40px_rgb(0,0,0,0.12)]">
          
          {/* Logo Section */}
          <div className="flex flex-col items-center space-y-6">
            <div className="w-28 h-28 rounded-full border-4 border-sky-400 flex items-center justify-center shadow-lg bg-transparent relative group">
              <img
                src={botivateLogoB}
                alt="Botivate Logo"
                className="w-24 h-24 object-contain relative z-10 transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                Planned <span className="text-sky-600">Structure</span>
              </h1>
            </div>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* User ID Input */}
            <div className="space-y-1">
              <label htmlFor="id" className="text-[13px] font-semibold text-gray-700 ml-1">
                User ID
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-sky-500">
                  <User className="h-4 w-4 text-gray-400 group-focus-within:text-sky-500 transition-colors" />
                </div>
                <input
                  id="id"
                  name="id"
                  type="text"
                  required
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50/50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:bg-white transition-all shadow-sm"
                  placeholder="Enter user ID"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <label htmlFor="password" className="text-[13px] font-semibold text-gray-700 ml-1">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-sky-500">
                  <Lock className="h-4 w-4 text-gray-400 group-focus-within:text-sky-500 transition-colors" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-9 pr-10 py-2.5 text-sm bg-gray-50/50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:bg-white transition-all shadow-sm"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={submitting}
              className={`group relative w-full flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-bold text-white rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 shadow-md shadow-sky-500/30 hover:shadow-sky-500/40 transition-all overflow-hidden ${
                submitting ? 'opacity-80 cursor-not-allowed' : ''
              }`}
            >
              <div className="absolute inset-0 w-full h-full bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              <span className="relative z-10 flex items-center gap-2">
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
          </form>
        </div>
      </div>

      {/* Footer at Bottom */}
      <div className="relative z-10 w-full">
        <Footer />
      </div>
    </div>
  );
};

export default Login;

