import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Clothes } from '../lib/supabase';
import { Background } from '../components/Background';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Clock, TrendingUp, Sparkles, Home, Shirt, Pants, Dress, Jacket, Shoe, Briefcase, Package } from 'lucide-react';
import {
  generateDummyClothes,
  simulateLiveActivity,
  getUserById,
  getItemsByStatus,
  getSimulatedBidders,
  getDemoBidsForUser,
  upsertDemoBid,
  getDemoBalanceOffset,
  applyDemoBalanceOffset
} from '../lib/dummyData';
import { deductButtons, refundButtons } from '../lib/buttonService';

const CATEGORIES = [
  { id: 'all', name: 'All Items', icon: '✨' },
  { id: 'tops', name: 'Tops', icon: '👚' },
  { id: 'bottoms', name: 'Bottoms', icon: '👖' },
  { id: 'dresses', name: 'Dresses', icon: '👗' },
  { id: 'outerwear', name: 'Outerwear', icon: '🧥' },
  { id: 'shoes', name: 'Shoes', icon: '👟' },
  { id: 'accessories', name: 'Accessories', icon: '👜' },
  { id: 'other', name: 'Other', icon: '🧷' },
];

const CATEGORY_LABELS: Record<string, string> = {
  tops: 'Tops',
  bottoms: 'Bottoms',
  dresses: 'Dresses',
  outerwear: 'Outerwear',
  shoes: 'Shoes',
  accessories: 'Accessories',
  other: 'Other',
};

const normalizeCategoryId = (category?: string) => {
  if (!category) return 'other';
  const normalized = category.trim().toLowerCase();

  if (['tops', 'top', 'shirt', 'blouse', 'tee', 't-shirt', 'tshirt', 'tank', 'crop'].some((term) => normalized.includes(term))) {
    return 'tops';
  }
  if (['bottoms', 'bottom', 'pants', 'jeans', 'shorts', 'skirt', 'trouser'].some((term) => normalized.includes(term))) {
    return 'bottoms';
  }
  if (['dress', 'dresses'].some((term) => normalized.includes(term))) {
    return 'dresses';
  }
  if (['outerwear', 'jacket', 'coat', 'hoodie', 'sweater', 'cardigan'].some((term) => normalized.includes(term))) {
    return 'outerwear';
  }
  if (['shoes', 'shoe', 'sneaker', 'boot', 'heels', 'loafer', 'sandals'].some((term) => normalized.includes(term))) {
    return 'shoes';
  }
  if (['accessories', 'accessory', 'bag', 'bags', 'jewelry', 'belt', 'hat', 'scarf'].some((term) => normalized.includes(term))) {
    return 'accessories';
  }

  return 'other';
};

const FILTERS = [
  { id: 'all', name: 'All Items', icon: Sparkles },
  { id: 'new', name: 'Just Listed', icon: Clock },
  { id: 'hot', name: 'Most Bids', icon: TrendingUp },
  { id: 'ending', name: 'Ending Soon', icon: Clock },
];

export function MarketplacePage() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [allItems, setAllItems] = useState<Partial<Clothes>[]>([]);
  const [displayItems, setDisplayItems] = useState<Partial<Clothes>[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<Partial<Clothes> | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [bidding, setBidding] = useState(false);
  const [error, setError] = useState('');
  const [liveUpdateKey, setLiveUpdateKey] = useState(0);
  const [highestBidByClothes, setHighestBidByClothes] = useState<Record<string, { amount: number; bidderId: string | null }>>({});
  const [demoBids, setDemoBids] = useState<{ clothes_id: string; amount: number }[]>([]);
  const [demoBalanceOffset, setDemoBalanceOffset] = useState(0);
  const displayBalance = (profile?.button_balance || 0) + demoBalanceOffset;

  // Load initial data (mix of real + dummy) and setup real-time updates
  useEffect(() => {
    loadMarketplace();

    // Subscribe to real-time changes on clothes table
    const clothesChannel = supabase
      .channel('clothes_marketplace')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'clothes',
        },
        (payload) => {
          setAllItems(prev => {
            const updated = prev.map(item =>
              item.id === payload.new.id ? { ...item, ...payload.new } : item
            );
            return updated;
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'clothes',
        },
        (payload) => {
          setAllItems(prev => [payload.new as Clothes, ...prev]);
        }
      )
      .subscribe();

    // Simulate live activity for dummy items every 15 seconds
    const interval = setInterval(() => {
      setLiveUpdateKey(prev => prev + 1);
    }, 15000);

    return () => {
      supabase.removeChannel(clothesChannel);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (user?.id) {
      const bids = getDemoBidsForUser(user.id).map((bid) => ({
        clothes_id: bid.clothes_id,
        amount: bid.amount,
      }));
      setDemoBids(bids);
      setDemoBalanceOffset(getDemoBalanceOffset(user.id));
    }
  }, [user?.id]);

  // Apply filters and categories
  useEffect(() => {
    let filtered = [...allItems];

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item =>
        normalizeCategoryId(item.category) === selectedCategory
      );
    }

    // Status filter
    if (selectedFilter !== 'all') {
      filtered = getItemsByStatus(filtered, selectedFilter as any);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => {
        const categoryId = normalizeCategoryId(item.category);
        const categoryLabel = CATEGORY_LABELS[categoryId];
        return (
          item.title?.toLowerCase().includes(query) ||
          item.category?.toLowerCase().includes(query) ||
          categoryLabel.toLowerCase().includes(query)
        );
      });
    }

    setDisplayItems(filtered);
  }, [allItems, selectedCategory, selectedFilter, searchQuery]);

  // Simulate live activity for dummy items only
  useEffect(() => {
    if (liveUpdateKey > 0) {
      setAllItems(prev => {
        const dummyItems = prev.filter(item => item.id?.startsWith('dummy-'));
        const realItems = prev.filter(item => !item.id?.startsWith('dummy-'));
        const updatedDummy = simulateLiveActivity(dummyItems);
        return [...realItems, ...updatedDummy];
      });
    }
  }, [liveUpdateKey]);

  const loadMarketplace = async () => {
    // Load real items from Supabase
    const { data } = await supabase
      .from('clothes')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (data && data.length > 0) {
      const clothesIds = data.map((item) => item.id);
      const { data: activeClothingBids } = await supabase
        .from('clothing_bids')
        .select('clothes_id, amount, bidder_id')
        .in('clothes_id', clothesIds)
        .eq('status', 'active');

      if (activeClothingBids) {
        const highestMap: Record<string, { amount: number; bidderId: string | null }> = {};
        activeClothingBids.forEach((bid) => {
          const existing = highestMap[bid.clothes_id];
          if (!existing || bid.amount > existing.amount) {
            highestMap[bid.clothes_id] = { amount: bid.amount, bidderId: bid.bidder_id };
          }
        });
        setHighestBidByClothes(highestMap);
      }
    }

    // Combine with dummy data for demo purposes
    const dummyItems = generateDummyClothes(25);
    const combined = [...(data || []), ...dummyItems];
    setAllItems(combined);
  };

  const getHighestBidAmount = (item: Partial<Clothes>) => {
    if (!item.id) return item.current_highest_bid || item.minimum_button_price || 0;
    if (item.id.startsWith('dummy-')) {
      const demoAmounts = demoBids
        .filter((bid) => bid.clothes_id === item.id)
        .map((bid) => bid.amount);
      if (demoAmounts.length > 0) {
        return Math.max(...demoAmounts);
      }
    }
    const highest = highestBidByClothes[item.id];
    return highest?.amount ?? item.current_highest_bid ?? item.minimum_button_price ?? 0;
  };

  const getMinimumNextBid = (item: Partial<Clothes>) => {
    const highest = getHighestBidAmount(item);
    const minimum = item.minimum_button_price ?? 0;
    if (highest <= 0 || highest === minimum) return minimum;
    return Math.max(minimum, highest + 1);
  };

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !user || !profile) return;

    setError('');
    setBidding(true);

    try {
      const bid = parseInt(bidAmount);
      const minBid = getMinimumNextBid(selectedItem);

      if (bid < minBid) {
        throw new Error(`Bid must be at least ${minBid} buttons`);
      }

      if (bid > displayBalance) {
        throw new Error('Insufficient button balance');
      }

      const isDummyItem = selectedItem.id?.startsWith('dummy-');

      // Only process if it's a real item (not dummy)
      if (!isDummyItem && selectedItem.id) {
        const itemId = selectedItem.id;
        const previousBidderId = selectedItem.highest_bidder_id;
        const previousBidAmount = selectedItem.current_highest_bid || 0;

        // Step 1: Deduct buttons from new bidder
        const deductResult = await deductButtons(
          user.id,
          bid,
          'spent_bid',
          itemId,
          `Bid ${bid} buttons on ${selectedItem.title}`
        );

        if (!deductResult.success) {
          throw new Error(deductResult.error || 'Failed to deduct buttons');
        }

        // Step 2: Insert new bid
        const { data: insertedBid, error: insertError } = await supabase
          .from('clothing_bids')
          .insert({
          clothes_id: itemId,
          bidder_id: user.id,
          amount: bid,
          status: 'active',
          })
          .select('id')
          .single();

        if (insertError) {
          await refundButtons(
            user.id,
            bid,
            itemId,
            `Refund for failed bid on ${selectedItem.title}`
          );
          throw insertError;
        }

        if (insertedBid?.id) {
          await supabase.from('clothing_bids')
            .update({ status: 'outbid' })
            .eq('clothes_id', itemId)
            .eq('bidder_id', user.id)
            .eq('status', 'active')
            .neq('id', insertedBid.id);
        }

        // Step 3: Mark previous bid as outbid and refund previous bidder (only if it's a different person)
        if (previousBidderId && previousBidAmount > 0 && previousBidderId !== user.id) {
          await supabase.from('clothing_bids')
            .update({ status: 'outbid' })
            .eq('clothes_id', itemId)
            .eq('bidder_id', previousBidderId)
            .eq('status', 'active');

          await refundButtons(
            previousBidderId,
            previousBidAmount,
            itemId,
            `Refund for being outbid on ${selectedItem.title}`
          );
        }

        // Step 4: Update clothing item
        await supabase
          .from('clothes')
          .update({
            current_highest_bid: bid,
            highest_bidder_id: user.id,
          })
          .eq('id', selectedItem.id);

        setAllItems(prev =>
          prev.map(item =>
            item.id === selectedItem.id
              ? { ...item, current_highest_bid: bid, highest_bidder_id: user.id }
              : item
          )
        );
        setHighestBidByClothes(prev => ({
          ...prev,
          [selectedItem.id]: { amount: bid, bidderId: user.id }
        }));
      } else if (isDummyItem && selectedItem.id) {
        upsertDemoBid(user.id, selectedItem, bid);
        setDemoBids(prev => ([...prev, { clothes_id: selectedItem.id, amount: bid }]));
        const nextOffset = applyDemoBalanceOffset(user.id, -bid);
        setDemoBalanceOffset(nextOffset);
      }

      await refreshProfile();
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

  return (
    <div className="min-h-screen relative bg-white">
      <Background />

      <div className="relative z-10">
        {/* Header Bar - 99Dresses Style */}
        <div className="border-b border-gray-200 bg-white sticky top-0 z-20">
          <div className="max-w-[1100px] mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate('/')}
                    className="text-2xl font-semibold text-text-primary hover:text-brand-pink transition-colors"
                  >
                    Fashion Buttons
                  </button>
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-brand-pink/20 rounded-full">
                    <div className="w-2 h-2 bg-brand-pink rounded-full"></div>
                    <span className="text-xs text-brand-pink font-medium">LIVE</span>
                  </div>
                </div>
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" size={18} />
                  <input
                    type="text"
                    placeholder="Search items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-pink"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
                  <Home size={18} className="mr-2" />
                  Home
                </Button>
                <div className="text-right">
                  <p className="text-xs text-text-secondary">Your balance</p>
                  <p className="text-lg font-semibold text-brand-pink">{displayBalance}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1100px] mx-auto px-4 py-6">
          <div className="flex gap-6">
            {/* Left Sidebar - 99Dresses Style */}
            <div className="w-64 flex-shrink-0">
              <div className="sticky top-24 space-y-6">
                {/* Categories */}
                <div>
                  <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
                    Categories
                  </h3>
                  <div className="space-y-1">
                    {CATEGORIES.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                          selectedCategory === category.id
                            ? 'bg-brand-pink text-white'
                            : 'text-text-secondary hover:bg-brand-grey-light hover:text-text-primary'
                        }`}
                      >
                        <span>{category.icon}</span>
                        <span className="text-sm">{category.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filters */}
                <div>
                  <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
                    Filter by
                  </h3>
                  <div className="space-y-1">
                    {FILTERS.map((filter) => {
                      const Icon = filter.icon;
                      return (
                        <button
                          key={filter.id}
                          onClick={() => setSelectedFilter(filter.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                            selectedFilter === filter.id
                              ? 'bg-brand-pink text-white'
                              : 'text-text-secondary hover:bg-brand-grey-light hover:text-text-primary'
                          }`}
                        >
                          <Icon size={16} />
                          <span className="text-sm">{filter.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="pt-4 border-t border-gray-200">
                  <Button className="w-full mb-2" onClick={() => navigate('/list-clothing')}>
                    List item
                  </Button>
                  <Button className="w-full" variant="secondary" onClick={() => navigate('/dashboard')}>
                    Dashboard
                  </Button>
                </div>
              </div>
            </div>

            {/* Main Content Grid - 99Dresses Style */}
            <div className="flex-1">
              <div className="mb-4">
                <p className="text-text-secondary">
                  <span className="font-semibold text-text-primary">{displayItems.length}</span> items available
                </p>
              </div>

              {displayItems.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-text-secondary">No items found</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <AnimatePresence mode="popLayout">
                    {displayItems.map((item, index) => {
                      const seller = getUserById(item.user_id!);
                      const isDummy = item.id?.startsWith('dummy-');
                      const simulatedBidders = isDummy ? getSimulatedBidders(item.id!) : [];
                      const isNewListing = new Date(item.created_at!).getTime() > Date.now() - 24 * 60 * 60 * 1000;
                      const highestAmount = getHighestBidAmount(item);
                      const hasRecentBid = highestAmount > (item.minimum_button_price || 0);

                      return (
                        <div
                          key={item.id}
                          className="bg-white rounded-lg border border-gray-200 overflow-hidden cursor-pointer group"
                          onClick={() => setSelectedItem(item)}
                        >
                          {/* Image */}
                          <div className="relative aspect-[3/4] overflow-hidden bg-brand-grey-light">
                            <img
                              src={item.image_url}
                              alt={item.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = 'https://via.placeholder.com/300x400?text=Image';
                              }}
                            />
                            {isNewListing && (
                              <div className="absolute top-2 left-2 bg-brand-pink text-white text-xs px-2 py-1 rounded-full font-medium">
                                New
                              </div>
                            )}
                            {isDummy && (
                              <div className="absolute bottom-2 left-2 bg-white/90 text-text-secondary text-[10px] px-2 py-1 rounded-full font-medium">
                                Demo
                              </div>
                            )}
                            {hasRecentBid && (
                              <div className="absolute top-2 right-2 bg-brand-pink text-white text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                                <TrendingUp size={12} />
                                Hot
                              </div>
                            )}
                          </div>

                          {/* Details */}
                          <div className="p-3">
                            <p className="text-xs text-text-secondary mb-1">{CATEGORY_LABELS[normalizeCategoryId(item.category)]}</p>
                            <h3 className="text-sm font-semibold text-text-primary mb-2 line-clamp-2 group-hover:text-brand-pink transition-colors">
                              {item.title}
                            </h3>

                            {/* Seller */}
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-5 h-5 bg-brand-pink rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {seller.avatar}
                              </div>
                              <p className="text-xs text-text-secondary">{seller.name}</p>
                            </div>

                            {/* Price */}
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs text-text-secondary">Current bid</p>
                                <p className="text-lg font-semibold text-brand-pink">
                                    {highestAmount}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="flex items-center text-xs text-text-secondary">
                                  <Clock size={12} className="mr-1" />
                                  {getTimeRemaining(item.bidding_ends_at!)}
                                </div>
                              </div>
                            </div>
                            {isDummy && simulatedBidders.length > 0 && (
                              <div className="flex items-center justify-between mt-3">
                                <div className="flex -space-x-2">
                                  {simulatedBidders.slice(0, 4).map((bidder) => (
                                    <div
                                      key={bidder.id}
                                      className="w-6 h-6 rounded-full bg-brand-pink text-white text-[10px] font-semibold flex items-center justify-center border border-white"
                                    >
                                      {bidder.avatar}
                                    </div>
                                  ))}
                                </div>
                                <span className="text-xs text-text-secondary">Simulated bids</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bid Modal */}
      <Modal
        isOpen={!!selectedItem}
        onClose={() => {
          setSelectedItem(null);
          setError('');
          setBidAmount('');
        }}
        title="Place your bid"
      >
        {selectedItem && (
          <form onSubmit={handlePlaceBid} className="space-y-4">
            <div className="flex gap-4">
              <img
                src={selectedItem.image_url}
                alt={selectedItem.title}
                className="w-24 h-32 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-text-primary mb-1">{selectedItem.title}</h3>
                <p className="text-sm text-text-secondary mb-2">{CATEGORY_LABELS[normalizeCategoryId(selectedItem.category)]}</p>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-brand-pink rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {getUserById(selectedItem.user_id!).avatar}
                  </div>
                  <p className="text-xs text-text-secondary">{getUserById(selectedItem.user_id!).name}</p>
                </div>
              </div>
            </div>

            <div className="bg-brand-grey-light rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">Current bid:</span>
                <span className="font-semibold text-brand-pink">
                  {getHighestBidAmount(selectedItem)} buttons
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">Your balance:</span>
                <span className="font-semibold text-text-primary">{displayBalance} buttons</span>
              </div>
            </div>

            <Input
              label="Your bid (buttons)"
              type="number"
              min={getMinimumNextBid(selectedItem)}
              placeholder={`Minimum: ${getMinimumNextBid(selectedItem)}`}
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
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
              disabled={bidding || selectedItem.user_id === user?.id}
            >
              {bidding
                ? 'Placing bid...'
                : selectedItem.user_id === user?.id
                  ? 'Your listing'
                  : 'Place bid'}
            </Button>
          </form>
        )}
      </Modal>
    </div>
  );
}
