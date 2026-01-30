import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Clothes } from '../lib/supabase';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Background } from '../components/Background';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock } from 'lucide-react';

export function MarketplacePage() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [clothes, setClothes] = useState<Clothes[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<Clothes | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [bidding, setBidding] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadClothes();
  }, []);

  const loadClothes = async () => {
    const { data } = await supabase
      .from('clothes')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (data) setClothes(data);
    setLoading(false);
  };

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !user || !profile) return;

    setError('');
    setBidding(true);

    try {
      const bid = parseInt(bidAmount);

      if (bid < (selectedItem.current_highest_bid || selectedItem.minimum_button_price)) {
        throw new Error(`Bid must be at least ${selectedItem.current_highest_bid || selectedItem.minimum_button_price} buttons`);
      }

      if (bid > profile.button_balance) {
        throw new Error('Insufficient button balance');
      }

      const { error: bidError } = await supabase.from('clothing_bids').insert({
        clothes_id: selectedItem.id,
        bidder_id: user.id,
        amount: bid,
        status: 'active',
      });

      if (bidError) throw bidError;

      if (selectedItem.highest_bidder_id) {
        await supabase.from('clothing_bids')
          .update({ status: 'outbid' })
          .eq('clothes_id', selectedItem.id)
          .eq('bidder_id', selectedItem.highest_bidder_id)
          .eq('status', 'active');
      }

      const { error: updateError } = await supabase
        .from('clothes')
        .update({
          current_highest_bid: bid,
          highest_bidder_id: user.id,
        })
        .eq('id', selectedItem.id);

      if (updateError) throw updateError;

      await refreshProfile();
      await loadClothes();
      setSelectedItem(null);
      setBidAmount('');
    } catch (err: any) {
      setError(err.message || 'Failed to place bid');
    } finally {
      setBidding(false);
    }
  };

  const getTimeRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <Background />
        <div className="text-white relative z-10">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 relative">
      <Background />
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft size={20} className="mr-2" />
            Back
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Marketplace</h1>
              <p className="text-gray-400">Browse and bid on clothing items</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Your Balance</p>
              <p className="text-2xl font-bold text-blue-400">{profile?.button_balance || 0} buttons</p>
            </div>
          </div>
        </motion.div>

        {clothes.length === 0 ? (
          <Card>
            <p className="text-gray-400 text-center">No items available yet</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clothes.map((item) => (
              <Card key={item.id} hover>
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Image';
                  }}
                />
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">{item.title}</h3>
                  <p className="text-sm text-gray-400">{item.category}</p>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <p className="text-xs text-gray-400">Current Bid</p>
                      <p className="text-lg font-bold text-blue-400">
                        {item.current_highest_bid || item.minimum_button_price} buttons
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-xs text-gray-400">
                        <Clock size={14} className="mr-1" />
                        {getTimeRemaining(item.bidding_ends_at)}
                      </div>
                    </div>
                  </div>

                  {item.user_id !== user?.id ? (
                    <Button
                      onClick={() => setSelectedItem(item)}
                      className="w-full mt-4"
                      disabled={item.highest_bidder_id === user?.id}
                    >
                      {item.highest_bidder_id === user?.id ? 'You\'re Winning' : 'Place Bid'}
                    </Button>
                  ) : (
                    <div className="mt-4 p-2 bg-gray-700 rounded text-center text-sm text-gray-400">
                      Your listing
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={!!selectedItem}
        onClose={() => {
          setSelectedItem(null);
          setError('');
          setBidAmount('');
        }}
        title="Place Bid"
      >
        {selectedItem && (
          <form onSubmit={handlePlaceBid} className="space-y-4">
            <div>
              <h3 className="font-semibold text-white mb-2">{selectedItem.title}</h3>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Current Bid:</span>
                <span className="font-bold text-blue-400">
                  {selectedItem.current_highest_bid || selectedItem.minimum_button_price} buttons
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-400">Your Balance:</span>
                <span className="font-bold text-green-400">{profile?.button_balance || 0} buttons</span>
              </div>
            </div>

            <Input
              label="Your Bid (buttons)"
              type="number"
              min={(selectedItem.current_highest_bid || selectedItem.minimum_button_price) + 1}
              placeholder={`Minimum: ${(selectedItem.current_highest_bid || selectedItem.minimum_button_price) + 1}`}
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              required
            />

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            <Button type="submit" className="w-full" disabled={bidding}>
              {bidding ? 'Placing Bid...' : 'Confirm Bid'}
            </Button>
          </form>
        )}
      </Modal>
    </div>
  );
}
