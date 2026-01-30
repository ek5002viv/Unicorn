import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Clothes, ClothingBid, ButtonResaleListing } from '../lib/supabase';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Background } from '../components/Background';
import { motion } from 'framer-motion';
import { Coins, ShoppingBag, Upload, TrendingUp, LogOut } from 'lucide-react';

export function DashboardPage() {
  const { profile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [myClothes, setMyClothes] = useState<Clothes[]>([]);
  const [myBids, setMyBids] = useState<ClothingBid[]>([]);
  const [myButtonListings, setMyButtonListings] = useState<ButtonResaleListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    if (!profile) return;

    const [clothesRes, bidsRes, buttonListingsRes] = await Promise.all([
      supabase.from('clothes').select('*').eq('user_id', profile.id).order('created_at', { ascending: false }),
      supabase.from('clothing_bids').select('*').eq('bidder_id', profile.id).eq('status', 'active').order('created_at', { ascending: false }),
      supabase.from('button_resale_listings').select('*').eq('seller_id', profile.id).order('created_at', { ascending: false }),
    ]);

    if (clothesRes.data) setMyClothes(clothesRes.data);
    if (bidsRes.data) setMyBids(bidsRes.data);
    if (buttonListingsRes.data) setMyButtonListings(buttonListingsRes.data);

    await refreshProfile();
    setLoading(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
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
        <div className="flex items-center justify-between mb-8">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold text-white"
          >
            Dashboard
          </motion.h1>
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut size={20} className="mr-2" />
            Logout
          </Button>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-600 rounded-lg">
                <Coins size={24} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Button Balance</p>
                <p className="text-2xl font-bold text-white">{profile?.button_balance || 0}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-600 rounded-lg">
                <TrendingUp size={24} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Earned</p>
                <p className="text-2xl font-bold text-white">{profile?.total_buttons_earned || 0}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-600 rounded-lg">
                <ShoppingBag size={24} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Active Bids</p>
                <p className="text-2xl font-bold text-white">{myBids.length}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-600 rounded-lg">
                <Upload size={24} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Listed Items</p>
                <p className="text-2xl font-bold text-white">{myClothes.length}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Button onClick={() => navigate('/marketplace')} className="h-20">
            <ShoppingBag className="mr-2" />
            Browse Marketplace
          </Button>
          <Button onClick={() => navigate('/list-clothing')} variant="secondary" className="h-20">
            <Upload className="mr-2" />
            List Clothing
          </Button>
          <Button onClick={() => navigate('/buy-buttons')} variant="secondary" className="h-20">
            <Coins className="mr-2" />
            Buy Buttons
          </Button>
          <Button onClick={() => navigate('/sell-buttons')} variant="secondary" className="h-20">
            <TrendingUp className="mr-2" />
            Sell Buttons
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-bold text-white mb-4">My Listings</h2>
            {myClothes.length === 0 ? (
              <Card>
                <p className="text-gray-400 text-center">No listings yet</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {myClothes.slice(0, 5).map((item) => (
                  <Card key={item.id} hover>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-white">{item.title}</h3>
                        <p className="text-sm text-gray-400">{item.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">Current Bid</p>
                        <p className="font-bold text-blue-400">{item.current_highest_bid || item.minimum_button_price} buttons</p>
                        <span className={`text-xs px-2 py-1 rounded ${
                          item.status === 'active' ? 'bg-green-500/20 text-green-400' :
                          item.status === 'sold' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-4">Button Resale Listings</h2>
            {myButtonListings.length === 0 ? (
              <Card>
                <p className="text-gray-400 text-center">No button listings yet</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {myButtonListings.slice(0, 5).map((listing) => (
                  <Card key={listing.id} hover>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-white">{listing.button_amount} Buttons</h3>
                        <p className="text-sm text-gray-400">Min: ${listing.minimum_price_usd}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">Current Bid</p>
                        <p className="font-bold text-green-400">${listing.current_highest_bid_usd || listing.minimum_price_usd}</p>
                        <span className={`text-xs px-2 py-1 rounded ${
                          listing.status === 'active' ? 'bg-green-500/20 text-green-400' :
                          listing.status === 'sold' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {listing.status}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
