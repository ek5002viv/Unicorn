import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase, ButtonResaleListing } from '../lib/supabase';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Background } from '../components/Background';
import { motion } from 'framer-motion';
import { ArrowLeft, Coins, Users, Building2 } from 'lucide-react';
import { generateDummyButtonListings, getUserById } from '../lib/dummyData';
import { grantButtons } from '../lib/buttonService';

const PLATFORM_PACKAGES = [
  { amount: 50, price: 5, popular: false },
  { amount: 100, price: 9, popular: true },
  { amount: 250, price: 20, popular: false },
  { amount: 500, price: 35, popular: false },
];

export function BuyButtonsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [userListings, setUserListings] = useState<ButtonResaleListing[]>([]);
  const [selectedListing, setSelectedListing] = useState<ButtonResaleListing | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUserListings();
  }, []);

  const loadUserListings = async () => {
    const { data } = await supabase
      .from('button_resale_listings')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    // Combine with dummy data for demo purposes
    const dummyListings = generateDummyButtonListings(12);
    const combined = [...(data || []), ...dummyListings as ButtonResaleListing[]];
    setUserListings(combined.filter(l => l.seller_id !== user?.id));
    setLoading(false);
  };

  const handleBuyFromPlatform = async (packageItem: typeof PLATFORM_PACKAGES[0]) => {
    if (!user || !profile) return;

    setPurchasing(true);
    try {
      const result = await grantButtons(
        user.id,
        packageItem.amount,
        'purchase_platform',
        null,
        `Purchased ${packageItem.amount} buttons for $${packageItem.price}`
      );

      if (!result.success) {
        throw new Error(result.error || 'Purchase failed');
      }

      await refreshProfile();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Purchase failed');
    } finally {
      setPurchasing(false);
    }
  };

  const handleBidOnListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListing || !user) return;

    setError('');
    setPurchasing(true);

    try {
      const bid = parseFloat(bidAmount);

      if (bid < (selectedListing.current_highest_bid_usd || selectedListing.minimum_price_usd)) {
        throw new Error(`Bid must be at least $${selectedListing.current_highest_bid_usd || selectedListing.minimum_price_usd}`);
      }

      await supabase.from('button_resale_bids').insert({
        listing_id: selectedListing.id,
        bidder_id: user.id,
        amount_usd: bid,
        status: 'active',
      });

      if (selectedListing.highest_bidder_id) {
        await supabase.from('button_resale_bids')
          .update({ status: 'outbid' })
          .eq('listing_id', selectedListing.id)
          .eq('bidder_id', selectedListing.highest_bidder_id)
          .eq('status', 'active');
      }

      await supabase
        .from('button_resale_listings')
        .update({
          current_highest_bid_usd: bid,
          highest_bidder_id: user.id,
        })
        .eq('id', selectedListing.id);

      await loadUserListings();
      setSelectedListing(null);
      setBidAmount('');
    } catch (err: any) {
      setError(err.message || 'Failed to place bid');
    } finally {
      setPurchasing(false);
    }
  };

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
          <h1 className="text-3xl font-bold text-white mb-2">Buy Buttons</h1>
          <p className="text-gray-400">Purchase buttons from the platform or other users</p>
        </motion.div>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Building2 size={24} className="text-blue-400" />
            <h2 className="text-2xl font-bold text-white">Platform Packages</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PLATFORM_PACKAGES.map((pkg) => (
              <Card key={pkg.amount} hover className={pkg.popular ? 'ring-2 ring-blue-500' : ''}>
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
                      Popular
                    </span>
                  </div>
                )}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
                    <Coins size={32} className="text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-2">{pkg.amount}</h3>
                  <p className="text-gray-400 mb-4">buttons</p>
                  <p className="text-2xl font-bold text-green-400 mb-4">${pkg.price}</p>
                  <Button
                    onClick={() => handleBuyFromPlatform(pkg)}
                    disabled={purchasing}
                    className="w-full"
                  >
                    Buy Now
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Users size={24} className="text-green-400" />
            <h2 className="text-2xl font-bold text-white">User Listings</h2>
          </div>
          {loading ? (
            <Card>
              <p className="text-gray-400 text-center">Loading...</p>
            </Card>
          ) : userListings.length === 0 ? (
            <Card>
              <p className="text-gray-400 text-center">No user listings available</p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userListings.map((listing) => {
                const seller = getUserById(listing.seller_id);
                return (
                  <Card key={listing.id} hover>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {seller.avatar}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{seller.name}</p>
                          <p className="text-xs text-gray-500">{seller.buttonBalance} buttons</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">Amount</p>
                          <p className="text-2xl font-bold text-blue-400">{listing.button_amount}</p>
                          <p className="text-xs text-gray-500">buttons</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-400">Current Bid</p>
                          <p className="text-2xl font-bold text-green-400">
                            ${listing.current_highest_bid_usd || listing.minimum_price_usd}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => setSelectedListing(listing)}
                        className="w-full"
                        disabled={listing.highest_bidder_id === user?.id}
                      >
                        {listing.highest_bidder_id === user?.id ? 'You\'re Winning' : 'Place Bid'}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={!!selectedListing}
        onClose={() => {
          setSelectedListing(null);
          setError('');
          setBidAmount('');
        }}
        title="Place Bid"
      >
        {selectedListing && (
          <form onSubmit={handleBidOnListing} className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Buttons:</span>
                <span className="font-bold text-blue-400">{selectedListing.button_amount}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-400">Current Bid:</span>
                <span className="font-bold text-green-400">
                  ${selectedListing.current_highest_bid_usd || selectedListing.minimum_price_usd}
                </span>
              </div>
            </div>

            <Input
              label="Your Bid (USD)"
              type="number"
              step="0.01"
              min={(selectedListing.current_highest_bid_usd || selectedListing.minimum_price_usd) + 0.01}
              placeholder={`Minimum: $${((selectedListing.current_highest_bid_usd || selectedListing.minimum_price_usd) + 0.01).toFixed(2)}`}
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

            <Button type="submit" className="w-full" disabled={purchasing}>
              {purchasing ? 'Placing Bid...' : 'Confirm Bid'}
            </Button>
          </form>
        )}
      </Modal>
    </div>
  );
}
