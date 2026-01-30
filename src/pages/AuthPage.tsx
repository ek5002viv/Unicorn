import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Background } from '../components/Background';
import { motion } from 'framer-motion';
import { Shirt } from 'lucide-react';

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = isLogin
        ? await signIn(email, password)
        : await signUp(email, password);

      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-white">
      <Background />
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-pink rounded-full mb-4">
            <Shirt size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-semibold text-text-primary mb-2">Fashion Buttons</h1>
          <p className="text-text-secondary">Trade clothes, not cash</p>
        </div>

        <Card>
          <div className="flex gap-2 mb-6">
            <Button
              variant={isLogin ? 'primary' : 'ghost'}
              onClick={() => setIsLogin(true)}
              className="flex-1"
            >
              Login
            </Button>
            <Button
              variant={!isLogin ? 'primary' : 'ghost'}
              onClick={() => setIsLogin(false)}
              className="flex-1"
            >
              Sign up
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Please wait...' : isLogin ? 'Sign in' : 'Create account'}
            </Button>
          </form>

          {!isLogin && (
            <p className="mt-4 text-sm text-text-secondary text-center">
              After signup, you'll be guided through onboarding
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
