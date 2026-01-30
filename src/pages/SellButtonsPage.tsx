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
      biddingEndsAt.setDate(biddingEndsAt.getDate() + 3);

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
    <div className="min-h-screen p-4 relative bg-white">
      <Background />
      <div className="max-w-2xl mx-auto relative z-10">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft size={20} className="mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-semibold text-text-primary mb-2">Sell buttons</h1>
          <p className="text-text-secondary">List your buttons for sale and receive real money</p>
        </div>

        <Card>
          <div className="bg-brand-pink/10 border border-brand-pink/20 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-brand-pink mt-0.5" />
              <div className="text-sm text-brand-pink">
                <p className="font-semibold mb-1">How button resale works</p>
                <p>
                  Your buttons will be held in escrow during the auction period (3 days).
                  Other users can bid real money to purchase your buttons. The highest bidder
                  wins when the auction ends.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-brand-grey-light rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Your available balance:</span>
              <span className="text-2xl font-semibold text-brand-pink">{profile?.button_balance || 0} buttons</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Number of buttons to sell"
              type="number"
              min="1"
              max={profile?.button_balance || 0}
              placeholder="e.g., 100"
              value={buttonAmount}
              onChange={(e) => setButtonAmount(e.target.value)}
              required
            />

            <Input
              label="Minimum price (USD)"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="e.g., 10.00"
              value={minimumPrice}
              onChange={(e) => setMinimumPrice(e.target.value)}
              required
            />

            {buttonAmount && minimumPrice && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-600">
                  Rate: ${(parseFloat(minimumPrice) / parseInt(buttonAmount)).toFixed(4)} per button
                </p>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating listing...' : 'Create listing'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
