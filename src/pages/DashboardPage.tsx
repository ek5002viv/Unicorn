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
      <div className="min-h-screen flex items-center justify-center relative bg-white">
        <Background />
        <div className="text-text-primary relative z-10">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 relative bg-white">
      <Background />
      <div className="max-w-[1100px] mx-auto relative z-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-semibold text-text-primary">
            Dashboard
          </h1>
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut size={20} className="mr-2" />
            Logout
          </Button>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-brand-pink rounded-lg">
                <Coins size={24} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Button balance</p>
                <p className="text-2xl font-semibold text-text-primary">{displayBalance}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-brand-pink rounded-lg">
                <TrendingUp size={24} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Total earned</p>
                <p className="text-2xl font-semibold text-text-primary">{profile?.total_buttons_earned || 0}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-brand-pink rounded-lg">
                <ShoppingBag size={24} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Active bids & sales</p>
                <p className="text-2xl font-semibold text-text-primary">{activeClothingBidsCount + myButtonBids.length + activeButtonListings.length}</p>
                <p className="text-xs text-text-secondary">{activeClothingBidsCount} clothing bids, {myButtonBids.length} button bids, {activeButtonListings.length} button sales</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-brand-pink rounded-lg">
                <Upload size={24} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Listed items</p>
                <p className="text-2xl font-semibold text-text-primary">{myClothes.length}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Button onClick={() => navigate('/marketplace')} className="h-20">
            <ShoppingBag className="mr-2" />
            Browse marketplace
          </Button>
          <Button onClick={() => navigate('/list-clothing')} variant="secondary" className="h-20">
            <Upload className="mr-2" />
            List clothing
          </Button>
          <Button onClick={() => navigate('/buy-buttons')} variant="secondary" className="h-20">
            <Coins className="mr-2" />
            Buy buttons
          </Button>
          <Button onClick={() => navigate('/sell-buttons')} variant="secondary" className="h-20">
            <TrendingUp className="mr-2" />
            Sell buttons
          </Button>
          <Button onClick={() => navigate('/activity')} variant="secondary" className="h-20">
            <Activity className="mr-2" />
            Recent activity
          </Button>
        </div>

        {/* Clothing Bids Section */}
        {myBids.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-semibold text-text-primary">Your clothing bids</h2>
                <div className="flex items-center gap-2 px-3 py-1 bg-brand-pink/20 rounded-full">
                  <Zap size={14} className="text-brand-pink" />
                  <span className="text-xs text-brand-pink font-medium">LIVE</span>
                </div>
              </div>
              <span className="text-sm text-text-secondary">{myBids.length} bid{myBids.length !== 1 ? 's' : ''} total</span>
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
                        ? '🎉 You\'re winning!'
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
                        <h3 className="font-semibold text-text-primary">{item.title}</h3>
                        <p className="text-sm text-text-secondary">{item.category}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-text-secondary">Your bid</p>
                          <p className="text-lg font-semibold text-brand-pink">{bid.amount}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-text-secondary">Highest</p>
                          <p className="text-lg font-semibold text-text-primary">{highestAmount}</p>
                        </div>
                      </div>
                      <div className={`px-3 py-2 rounded-lg text-center text-sm font-medium ${
                        displayStatus === '🎉 You\'re winning!' || displayStatus === '🏆 Won'
                          ? 'bg-green-50 text-green-600'
                          : displayStatus === 'Cancelled'
                            ? 'bg-gray-100 text-gray-600'
                            : 'bg-red-50 text-red-600'
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
              <h2 className="text-xl font-semibold text-text-primary">My clothing listings</h2>
              <p className="text-xs text-text-secondary">Clothes you're selling for buttons</p>
            </div>
            {myClothes.length === 0 ? (
              <Card>
                <p className="text-text-secondary text-center">No listings yet</p>
                <p className="text-sm text-text-secondary text-center mt-2">List clothes to earn buttons</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {myClothes.slice(0, 5).map((item) => (
                  <Card key={item.id} hover>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-text-primary">{item.title}</h3>
                        <p className="text-sm text-text-secondary">{item.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-text-secondary">Current bid</p>
                        <p className="font-semibold text-brand-pink">{item.current_highest_bid || item.minimum_button_price} buttons</p>
                        <span className={`text-xs px-2 py-1 rounded ${
                          item.status === 'active' ? 'bg-green-50 text-green-600' :
                          item.status === 'sold' ? 'bg-brand-pink/20 text-brand-pink' :
                          'bg-gray-100 text-gray-600'
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
              <h2 className="text-xl font-semibold text-text-primary">My button sales</h2>
              <p className="text-xs text-text-secondary">Buttons you're selling for USD</p>
            </div>
            {myButtonListings.length === 0 ? (
              <Card>
                <p className="text-text-secondary text-center">No button listings yet</p>
                <p className="text-sm text-text-secondary text-center mt-2">Sell buttons to convert them to cash</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {myButtonListings.slice(0, 5).map((listing) => (
                  <Card key={listing.id} hover>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-text-primary">{listing.button_amount} buttons</h3>
                        <p className="text-sm text-text-secondary">Min: ${listing.minimum_price_usd}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-text-secondary">Current bid</p>
                        <p className="font-semibold text-green-600">${listing.current_highest_bid_usd || listing.minimum_price_usd}</p>
                        <span className={`text-xs px-2 py-1 rounded ${
                          listing.status === 'active' ? 'bg-green-50 text-green-600' :
                          listing.status === 'sold' ? 'bg-brand-pink/20 text-brand-pink' :
                          'bg-gray-100 text-gray-600'
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
