import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Background } from '../components/Background';
import { motion } from 'framer-motion';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export function SellButtonsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [buttonAmount, setButtonAmount] = useState('');
  const [minimumPrice, setMinimumPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const amount = parseInt(buttonAmount);
      const price = parseFloat(minimumPrice);

      if (amount > (profile?.button_balance || 0)) {
        throw new Error('Insufficient button balance');
      }

      if (amount <= 0 || price <= 0) {
        throw new Error('Invalid amount or price');
      }

      const biddingEndsAt = new Date();
      biddingEndsAt.setDate(biddingEndsAt.getDate() + 7);

      const { error: insertError } = await supabase.from('button_resale_listings').insert({
        seller_id: user?.id,
        button_amount: amount,
        minimum_price_usd: price,
        bidding_ends_at: biddingEndsAt.toISOString(),
        status: 'active',
      });

      if (insertError) throw insertError;

      await supabase
        .from('user_profiles')
        .update({
          button_balance: (profile?.button_balance || 0) - amount,
        })
        .eq('id', user?.id);

      await supabase.from('button_transactions').insert({
        user_id: user?.id,
        amount: -amount,
        transaction_type: 'purchase_user',
        description: `Listed ${amount} buttons for sale`,
      });

      await refreshProfile();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 relative">
      <Background />
      <div className="max-w-2xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft size={20} className="mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-white mb-2">Sell Buttons</h1>
          <p className="text-gray-400">List your buttons for sale and receive real money</p>
        </motion.div>

        <Card>
          <div className="bg-blue-600/10 border border-blue-600/20 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-blue-400 mt-0.5" />
              <div className="text-sm text-blue-400">
                <p className="font-semibold mb-1">How Button Resale Works</p>
                <p>
                  Your buttons will be held in escrow during the auction period (7 days).
                  Other users can bid real money to purchase your buttons. The highest bidder
                  wins when the auction ends.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Your Available Balance:</span>
              <span className="text-2xl font-bold text-blue-400">{profile?.button_balance || 0} buttons</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Number of Buttons to Sell"
              type="number"
              min="1"
              max={profile?.button_balance || 0}
              placeholder="e.g., 100"
              value={buttonAmount}
              onChange={(e) => setButtonAmount(e.target.value)}
              required
            />

            <Input
              label="Minimum Price (USD)"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="e.g., 10.00"
              value={minimumPrice}
              onChange={(e) => setMinimumPrice(e.target.value)}
              required
            />

            {buttonAmount && minimumPrice && (
              <div className="bg-green-600/10 border border-green-600/20 rounded-lg p-4">
                <p className="text-sm text-green-400">
                  Rate: ${(parseFloat(minimumPrice) / parseInt(buttonAmount)).toFixed(4)} per button
                </p>
              </div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating Listing...' : 'Create Listing'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
