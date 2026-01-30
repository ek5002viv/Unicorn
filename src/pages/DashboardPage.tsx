import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Clothes, ClothingBid, ButtonResaleListing, ButtonResaleBid } from '../lib/supabase';
import { getDemoBidsForUser, getDemoBalanceOffset } from '../lib/dummyData';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Background } from '../components/Background';
import { motion } from 'framer-motion';
import { Coins, ShoppingBag, Upload, TrendingUp, LogOut, Activity, Zap } from 'lucide-react';

export function DashboardPage() {
  const { profile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [myClothes, setMyClothes] = useState<Clothes[]>([]);
  const [myBids, setMyBids] = useState<ClothingBid[]>([]);
  const [biddedClothes, setBiddedClothes] = useState<Clothes[]>([]);
  const [myButtonListings, setMyButtonListings] = useState<ButtonResaleListing[]>([]);
  const [myButtonBids, setMyButtonBids] = useState<ButtonResaleBid[]>([]);
  const [loading, setLoading] = useState(true);
  const activeButtonListings = myButtonListings.filter((listing) => listing.status === 'active');
  const [highestBidByClothes, setHighestBidByClothes] = useState<Record<string, { amount: number; bidderId: string | null }>>({});
  const demoBalanceOffset = profile?.id ? getDemoBalanceOffset(profile.id) : 0;
  const displayBalance = (profile?.button_balance || 0) + demoBalanceOffset;

  const getResolvedBidStatus = (bid: ClothingBid) => {
    if (bid.status === 'won' || bid.status === 'cancelled') return bid.status;
    const highest = highestBidByClothes[bid.clothes_id];
    if (!highest) return bid.status;
    return bid.amount === highest.amount && bid.bidder_id === highest.bidderId ? 'active' : 'outbid';
  };

  const activeClothingBidsCount = myBids.filter((bid) => {
    const status = getResolvedBidStatus(bid);
    return status === 'active' || status === 'outbid';
  }).length;

  useEffect(() => {
    loadDashboardData();

    if (!profile) return;

    const clothingBidsChannel = supabase
      .channel('clothing_bids_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clothing_bids',
          filter: `bidder_id=eq.${profile.id}`,
        },
        () => {
          loadDashboardData();
        }
      )
      .subscribe();

    const clothesChannel = supabase
      .channel('clothes_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'clothes',
        },
        () => {
          loadDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(clothingBidsChannel);
      supabase.removeChannel(clothesChannel);
    };
  }, [profile]);

  const loadDashboardData = async () => {
    if (!profile) return;

    const [clothesRes, bidsRes, buttonListingsRes, buttonBidsRes] = await Promise.all([
      supabase.from('clothes').select('*').eq('user_id', profile.id).order('created_at', { ascending: false }),
      supabase.from('clothing_bids').select('*').eq('bidder_id', profile.id).order('created_at', { ascending: false }),
      supabase.from('button_resale_listings').select('*').eq('seller_id', profile.id).order('created_at', { ascending: false }),
      supabase.from('button_resale_bids').select('*').eq('bidder_id', profile.id).eq('status', 'active').order('created_at', { ascending: false }),
    ]);

    if (clothesRes.data) setMyClothes(clothesRes.data);
    if (bidsRes.data) {
      const demoBids = profile?.id ? getDemoBidsForUser(profile.id) : [];
      const combinedBids: ClothingBid[] = [
        ...bidsRes.data,
        ...demoBids.map((bid) => ({
          id: bid.id,
          clothes_id: bid.clothes_id,
          bidder_id: bid.bidder_id,
          amount: bid.amount,
          status: bid.status,
          created_at: bid.created_at,
        })),
      ];

      setMyBids(combinedBids);

      // Fetch the clothes items that user has bid on
      const clothesIds = combinedBids.map(bid => bid.clothes_id);
      if (clothesIds.length > 0) {
        const { data: biddedClothesData } = await supabase
          .from('clothes')
          .select('*')
          .in('id', clothesIds);

        const demoClothes = demoBids.map((bid) => bid.item).filter(Boolean) as Clothes[];
        if (biddedClothesData) {
          const merged = [...biddedClothesData, ...demoClothes];
          const unique = merged.filter((item, index, arr) => arr.findIndex((c) => c.id === item.id) === index);
          setBiddedClothes(unique);
        } else if (demoClothes.length > 0) {
          setBiddedClothes(demoClothes);
        }

        const { data: activeClothingBids } = await supabase
          .from('clothing_bids')
          .select('clothes_id, amount, bidder_id')
          .in('clothes_id', clothesIds)
          .eq('status', 'active');

        const highestMap: Record<string, { amount: number; bidderId: string | null }> = {};
        demoBids.forEach((bid) => {
          const existing = highestMap[bid.clothes_id];
          if (!existing || bid.amount > existing.amount) {
            highestMap[bid.clothes_id] = { amount: bid.amount, bidderId: bid.bidder_id };
          }
        });
        (activeClothingBids || []).forEach((bid) => {
          const existing = highestMap[bid.clothes_id];
          if (!existing || bid.amount > existing.amount) {
            highestMap[bid.clothes_id] = { amount: bid.amount, bidderId: bid.bidder_id };
          }
        });
        setHighestBidByClothes(highestMap);
      } else {
        setHighestBidByClothes({});
      }
    }
    if (buttonListingsRes.data) setMyButtonListings(buttonListingsRes.data);
    if (buttonBidsRes.data) setMyButtonBids(buttonBidsRes.data);

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
                <p className="text-2xl font-bold text-white">{displayBalance}</p>
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
                <p className="text-sm text-gray-400">Active Bids & Sales</p>
                <p className="text-2xl font-bold text-white">{activeClothingBidsCount + myButtonBids.length + activeButtonListings.length}</p>
                <p className="text-xs text-gray-500">{activeClothingBidsCount} clothing bids, {myButtonBids.length} button bids, {activeButtonListings.length} button sales</p>
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

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
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
          <Button onClick={() => navigate('/activity')} variant="secondary" className="h-20">
            <Activity className="mr-2" />
            Recent Activity
          </Button>
        </div>

        {/* Clothing Bids Section */}
        {myBids.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-white">Your Clothing Bids</h2>
                <div className="flex items-center gap-2 px-3 py-1 bg-green-600/20 rounded-full">
                  <Zap size={14} className="text-green-400" />
                  <span className="text-xs text-green-400 font-medium">LIVE</span>
                </div>
              </div>
              <span className="text-sm text-gray-400">{myBids.length} bid{myBids.length !== 1 ? 's' : ''} total</span>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myBids.map((bid) => {
                const item = biddedClothes.find(c => c.id === bid.clothes_id);
                if (!item) return null;

                const highestBid = highestBidByClothes[bid.clothes_id];
                const highestAmount = highestBid?.amount ?? item.current_highest_bid ?? item.minimum_button_price;
                const highestBidderId = highestBid?.bidderId ?? item.highest_bidder_id;
                const isWinning = highestBidderId === bid.bidder_id && bid.amount === highestAmount;
                const resolvedStatus = getResolvedBidStatus(bid);
                const displayStatus = resolvedStatus === 'won'
                  ? '🏆 Won'
                  : resolvedStatus === 'cancelled'
                    ? 'Cancelled'
                    : resolvedStatus === 'outbid'
                      ? '⚠️ Outbid'
                      : isWinning
                        ? '🎉 You\'re Winning!'
                        : '⚠️ Outbid';

                return (
                  <Card key={bid.id} hover onClick={() => navigate('/marketplace')}>
                    <div className="space-y-3">
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-40 object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/300x200?text=Image';
                          }}
                        />
                      )}
                      <div>
                        <h3 className="font-semibold text-white">{item.title}</h3>
                        <p className="text-sm text-gray-400">{item.category}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500">Your Bid</p>
                          <p className="text-lg font-bold" style={{ color: '#F5C542' }}>{bid.amount}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Highest</p>
                          <p className="text-lg font-bold text-white">{highestAmount}</p>
                        </div>
                      </div>
                      <div className={`px-3 py-2 rounded-lg text-center text-sm font-medium ${
                        displayStatus === '🎉 You\'re Winning!' || displayStatus === '🏆 Won'
                          ? 'bg-green-600/20 text-green-400'
                          : displayStatus === 'Cancelled'
                            ? 'bg-gray-600/20 text-gray-400'
                            : 'bg-red-600/20 text-red-400'
                      }`}>
                        {displayStatus}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-white">My Clothing Listings</h2>
              <p className="text-xs text-gray-500">Clothes you're selling for buttons</p>
            </div>
            {myClothes.length === 0 ? (
              <Card>
                <p className="text-gray-400 text-center">No listings yet</p>
                <p className="text-sm text-gray-500 text-center mt-2">List clothes to earn buttons</p>
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
            <div className="mb-4">
              <h2 className="text-xl font-bold text-white">My Button Sales</h2>
              <p className="text-xs text-gray-500">Buttons you're selling for USD</p>
            </div>
            {myButtonListings.length === 0 ? (
              <Card>
                <p className="text-gray-400 text-center">No button listings yet</p>
                <p className="text-sm text-gray-500 text-center mt-2">Sell buttons to convert them to cash</p>
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
