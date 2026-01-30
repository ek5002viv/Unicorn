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
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <Background />
      <div className="w-full max-w-2xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to Fashion Buttons</h1>
          <p className="text-gray-400">Choose how you'd like to get started</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card
              hover
              className={`cursor-pointer transition-all ${
                selectedPath === 'upload'
                  ? 'ring-2 ring-blue-500 bg-blue-500/10'
                  : ''
              }`}
              onClick={() => setSelectedPath('upload')}
            >
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
                  <Upload size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">List a Clothing Item</h3>
                <p className="text-gray-400 mb-4">
                  Start earning buttons by listing clothes you want to trade. Set your minimum price and wait for bids.
                </p>
                <div className="bg-green-600/10 border border-green-600/20 rounded-lg p-3">
                  <p className="text-sm text-green-400 font-medium">
                    No upfront cost required
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card
              hover
              className={`cursor-pointer transition-all ${
                selectedPath === 'buy'
                  ? 'ring-2 ring-blue-500 bg-blue-500/10'
                  : ''
              }`}
              onClick={() => setSelectedPath('buy')}
            >
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
                  <ShoppingBag size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Buy Buttons</h3>
                <p className="text-gray-400 mb-4">
                  Purchase buttons from the platform or other users. Start bidding on clothes right away.
                </p>
                <div className="bg-blue-600/10 border border-blue-600/20 rounded-lg p-3">
                  <p className="text-sm text-blue-400 font-medium">
                    Instant marketplace access
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            onClick={handleContinue}
            disabled={!selectedPath}
            className="w-full"
            size="lg"
          >
            Continue
          </Button>

          <p className="text-center text-sm text-gray-500 mt-4">
            You can always do both later. This is just your starting point.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
