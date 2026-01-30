import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Clothes } from '../lib/supabase';
import { Background } from '../components/Background';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Clock, TrendingUp, Sparkles, Home } from 'lucide-react';
import {
  generateDummyClothes,
  simulateLiveActivity,
  getUserById,
  getItemsByStatus,
  getSimulatedBidders
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

    // Combine with dummy data for demo purposes
    const dummyItems = generateDummyClothes(25);
    const combined = [...(data || []), ...dummyItems];
    setAllItems(combined);
  };

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !user || !profile) return;

    setError('');
    setBidding(true);

    try {
      const bid = parseInt(bidAmount);
      const minBid = (selectedItem.current_highest_bid || selectedItem.minimum_button_price!) + 1;

      if (bid < minBid) {
        throw new Error(`Bid must be at least ${minBid} buttons`);
      }

      if (bid > profile.button_balance) {
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
        const { error: insertError } = await supabase.from('clothing_bids').insert({
          clothes_id: itemId,
          bidder_id: user.id,
          amount: bid,
          status: 'active',
        });

        if (insertError) {
          await refundButtons(
            user.id,
            bid,
            itemId,
            `Refund for failed bid on ${selectedItem.title}`
          );
          throw insertError;
        }

        // Step 3: Mark previous bid as outbid and refund previous bidder
        if (previousBidderId && previousBidAmount > 0) {
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
      } else if (isDummyItem && selectedItem.id) {
        setAllItems(prev =>
          prev.map(item =>
            item.id === selectedItem.id
              ? { ...item, current_highest_bid: bid, highest_bidder_id: user.id }
              : item
          )
        );
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
    <div className="min-h-screen relative">
      <Background />

      <div className="relative z-10">
        {/* Header Bar - 99Dresses Style */}
        <div className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-20">
          <div className="max-w-[1400px] mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate('/')}
                    className="text-2xl font-bold text-white hover:text-blue-400 transition-colors"
                  >
                    Fashion Buttons
                  </button>
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-green-600/20 rounded-full animate-pulse">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-xs text-green-400 font-medium">LIVE</span>
                  </div>
                </div>
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="text"
                    placeholder="Search items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
                  <Home size={18} className="mr-2" />
                  Home
                </Button>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Your Balance</p>
                  <p className="text-lg font-bold text-blue-400">{profile?.button_balance || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-4 py-6">
          <div className="flex gap-6">
            {/* Left Sidebar - 99Dresses Style */}
            <div className="w-64 flex-shrink-0">
              <div className="sticky top-24 space-y-6">
                {/* Categories */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Categories
                  </h3>
                  <div className="space-y-1">
                    {CATEGORIES.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                          selectedCategory === category.id
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
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
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Filter By
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
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
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
                <div className="pt-4 border-t border-gray-800">
                  <Button className="w-full mb-2" onClick={() => navigate('/list-clothing')}>
                    List Item
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
                <p className="text-gray-400">
                  <span className="font-semibold text-white">{displayItems.length}</span> items available
                </p>
              </div>

              {displayItems.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-gray-400">No items found</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <AnimatePresence mode="popLayout">
                    {displayItems.map((item, index) => {
                      const seller = getUserById(item.user_id!);
                      const isDummy = item.id?.startsWith('dummy-');
                      const simulatedBidders = isDummy ? getSimulatedBidders(item.id!) : [];
                      const isNewListing = new Date(item.created_at!).getTime() > Date.now() - 24 * 60 * 60 * 1000;
                      const hasRecentBid = item.current_highest_bid && item.current_highest_bid > item.minimum_button_price!;

                      return (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.5) }}
                          whileHover={{ y: -4 }}
                          className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden cursor-pointer group"
                          onClick={() => setSelectedItem(item)}
                        >
                          {/* Image */}
                          <div className="relative aspect-[3/4] overflow-hidden bg-gray-900">
                            <img
                              src={item.image_url}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.currentTarget.src = 'https://via.placeholder.com/300x400?text=Image';
                              }}
                            />
                            {isNewListing && (
                              <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                                New
                              </div>
                            )}
                            {hasRecentBid && (
                              <div className="absolute top-2 right-2 bg-orange-600 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                                <TrendingUp size={12} />
                                Hot
                              </div>
                            )}
                          </div>

                          {/* Details */}
                          <div className="p-3">
                            <p className="text-xs text-gray-500 mb-1">{CATEGORY_LABELS[normalizeCategoryId(item.category)]}</p>
                            <h3 className="text-sm font-semibold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                              {item.title}
                            </h3>

                            {/* Seller */}
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {seller.avatar}
                              </div>
                              <p className="text-xs text-gray-400">{seller.name}</p>
                            </div>

                            {/* Price */}
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs text-gray-500">Current Bid</p>
                                <p className="text-lg font-bold text-blue-400">
                                  {item.current_highest_bid || item.minimum_button_price}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="flex items-center text-xs text-gray-500">
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
                                      className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white text-[10px] font-semibold flex items-center justify-center border border-gray-900"
                                    >
                                      {bidder.avatar}
                                    </div>
                                  ))}
                                </div>
                                <span className="text-xs text-gray-500">Simulated bids</span>
                              </div>
                            )}
                          </div>
                        </motion.div>
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
        title="Place Your Bid"
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
                <h3 className="font-semibold text-white mb-1">{selectedItem.title}</h3>
                <p className="text-sm text-gray-400 mb-2">{CATEGORY_LABELS[normalizeCategoryId(selectedItem.category)]}</p>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {getUserById(selectedItem.user_id!).avatar}
                  </div>
                  <p className="text-xs text-gray-400">{getUserById(selectedItem.user_id!).name}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Current Bid:</span>
                <span className="font-bold text-blue-400">
                  {selectedItem.current_highest_bid || selectedItem.minimum_button_price} buttons
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Your Balance:</span>
                <span className="font-bold text-green-400">{profile?.button_balance || 0} buttons</span>
              </div>
            </div>

            <Input
              label="Your Bid (buttons)"
              type="number"
              min={(selectedItem.current_highest_bid || selectedItem.minimum_button_price!) + 1}
              placeholder={`Minimum: ${(selectedItem.current_highest_bid || selectedItem.minimum_button_price!) + 1}`}
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

            <Button type="submit" className="w-full" disabled={bidding || selectedItem.user_id === user?.id}>
              {bidding ? 'Placing Bid...' : selectedItem.user_id === user?.id ? 'Your Listing' : 'Place Bid'}
            </Button>
          </form>
        )}
      </Modal>
    </div>
  );
}
