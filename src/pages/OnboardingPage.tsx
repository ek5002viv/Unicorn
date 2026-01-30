import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Background } from '../components/Background';
import { motion } from 'framer-motion';
import { Upload, ShoppingBag } from 'lucide-react';

export function OnboardingPage() {
  const navigate = useNavigate();
  const [selectedPath, setSelectedPath] = useState<'upload' | 'buy' | null>(null);

  const handleContinue = () => {
    if (selectedPath === 'upload') {
      navigate('/list-clothing');
    } else if (selectedPath === 'buy') {
      navigate('/buy-buttons');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-white">
      <Background />
      <div className="w-full max-w-2xl relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-text-primary mb-2">Welcome to Fashion Buttons</h1>
          <p className="text-text-secondary">Choose how you'd like to get started</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <Card
              hover
              className={`cursor-pointer transition-all ${
                selectedPath === 'upload'
                  ? 'ring-2 ring-brand-pink'
                  : ''
              }`}
              onClick={() => setSelectedPath('upload')}
            >
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-pink rounded-full mb-4">
                  <Upload size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">List a clothing item</h3>
                <p className="text-text-secondary mb-4">
                  Start earning buttons by listing clothes you want to trade. Set your minimum price and wait for bids.
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-600 font-medium">
                    No upfront cost required
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div>
            <Card
              hover
              className={`cursor-pointer transition-all ${
                selectedPath === 'buy'
                  ? 'ring-2 ring-brand-pink'
                  : ''
              }`}
              onClick={() => setSelectedPath('buy')}
            >
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-pink rounded-full mb-4">
                  <ShoppingBag size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">Buy buttons</h3>
                <p className="text-text-secondary mb-4">
                  Purchase buttons from the platform or other users. Start bidding on clothes right away.
                </p>
                <div className="bg-brand-pink/10 border border-brand-pink/20 rounded-lg p-3">
                  <p className="text-sm text-brand-pink font-medium">
                    Instant marketplace access
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div>
          <Button
            onClick={handleContinue}
            disabled={!selectedPath}
            className="w-full"
            size="lg"
          >
            Continue
          </Button>

          <p className="text-center text-sm text-text-secondary mt-4">
            You can always do both later. This is just your starting point.
          </p>
        </div>
      </div>
    </div>
  );
}
