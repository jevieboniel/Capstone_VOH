import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import Button from '../UI/Button';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(email, password);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      
      {/* RGB GLOW WRAPPER */}
      <div className="rgb-glow w-full max-w-md">

        {/* Actual Card */}
        <div className="space-y-8 p-8 rounded-[28px]">

          {/* LOGO + TITLE */}
          <div className="flex flex-col items-center">
            <div className="h-24 w-24 rounded-full bg-slate-950 shadow-xl overflow-hidden flex items-center justify-center border border-slate-800">
              <img
                src="/voh.png"
                alt="Admin Logo"
                className="h-full w-full object-cover"
              />
            </div>

            <h2 className="mt-6 text-2xl lg:text-3xl font-extrabold text-white text-center">
              Village of Hope
            </h2>

            <p className="mt-2 text-sm text-slate-400 text-center">
              Child Tracking & Development Monitoring
            </p>
          </div>

          {/* FORM */}
          <form className="mt-6 space-y-6" onSubmit={handleSubmit}>

            {error && (
              <div className="bg-red-900/30 border border-red-700 rounded-xl p-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300">
                Email
              </label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300">
                Password
              </label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <Button
                type="submit"
                loading={loading}
                className="w-full"
                size="large"
              >
                Sign in
              </Button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
