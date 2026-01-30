import { Clothes, ButtonResaleListing } from './supabase';

export const DUMMY_USERS = [
  { id: 'user-1', name: 'Emma R.', avatar: 'ER', buttonBalance: 450 },
  { id: 'user-2', name: 'Sophia L.', avatar: 'SL', buttonBalance: 320 },
  { id: 'user-3', name: 'Olivia M.', avatar: 'OM', buttonBalance: 580 },
  { id: 'user-4', name: 'Isabella K.', avatar: 'IK', buttonBalance: 210 },
  { id: 'user-5', name: 'Mia J.', avatar: 'MJ', buttonBalance: 670 },
  { id: 'user-6', name: 'Charlotte P.', avatar: 'CP', buttonBalance: 390 },
  { id: 'user-7', name: 'Amelia T.', avatar: 'AT', buttonBalance: 520 },
  { id: 'user-8', name: 'Harper W.', avatar: 'HW', buttonBalance: 285 },
];

export const FASHION_BRANDS = [
  'Zara', 'H&M', 'Forever 21', 'Urban Outfitters', 'ASOS',
  'Mango', 'Topshop', 'Free People', 'Anthropologie', 'Reformation'
];

export const CLOTHING_ITEMS = [
  { title: 'Floral Summer Dress', category: 'Dresses', keywords: ['floral', 'summer', 'casual'] },
  { title: 'Little Black Dress', category: 'Dresses', keywords: ['black', 'cocktail', 'evening'] },
  { title: 'Maxi Dress', category: 'Dresses', keywords: ['maxi', 'bohemian', 'beach'] },
  { title: 'Wrap Dress', category: 'Dresses', keywords: ['wrap', 'elegant', 'work'] },
  { title: 'Midi Dress', category: 'Dresses', keywords: ['midi', 'versatile', 'chic'] },
  { title: 'Sundress', category: 'Dresses', keywords: ['sundress', 'summer', 'light'] },
  { title: 'Bodycon Dress', category: 'Dresses', keywords: ['bodycon', 'fitted', 'night-out'] },
  { title: 'Shift Dress', category: 'Dresses', keywords: ['shift', 'simple', 'classic'] },
  { title: 'A-Line Dress', category: 'Dresses', keywords: ['a-line', 'flattering', 'timeless'] },
  { title: 'Slip Dress', category: 'Dresses', keywords: ['slip', 'satin', 'minimalist'] },
  { title: 'Shirt Dress', category: 'Dresses', keywords: ['shirt', 'casual', 'button-down'] },
  { title: 'Tea Dress', category: 'Dresses', keywords: ['tea', 'vintage', 'floral'] },
  { title: 'Empire Waist Dress', category: 'Dresses', keywords: ['empire', 'flowing', 'romantic'] },
  { title: 'Halter Dress', category: 'Dresses', keywords: ['halter', 'summer', 'backless'] },
  { title: 'Off-Shoulder Dress', category: 'Dresses', keywords: ['off-shoulder', 'trendy', 'feminine'] },
  { title: 'Silk Blouse', category: 'Tops', keywords: ['silk', 'elegant', 'work'] },
  { title: 'Crop Top', category: 'Tops', keywords: ['crop', 'casual', 'summer'] },
  { title: 'Tank Top', category: 'Tops', keywords: ['tank', 'basic', 'layering'] },
  { title: 'High-Waisted Jeans', category: 'Bottoms', keywords: ['jeans', 'denim', 'casual'] },
  { title: 'Leather Jacket', category: 'Outerwear', keywords: ['leather', 'edgy', 'cool'] },
  { title: 'Designer Handbag', category: 'Accessories', keywords: ['bag', 'designer', 'luxury'] },
];

export const FASHION_IMAGES = [
  'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/1759622/pexels-photo-1759622.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/985635/pexels-photo-985635.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/1126993/pexels-photo-1126993.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/1852382/pexels-photo-1852382.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/794064/pexels-photo-794064.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/1462637/pexels-photo-1462637.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/2065200/pexels-photo-2065200.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/1007018/pexels-photo-1007018.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/291762/pexels-photo-291762.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/1055691/pexels-photo-1055691.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/1488507/pexels-photo-1488507.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/1631181/pexels-photo-1631181.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/949670/pexels-photo-949670.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=600',
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomDate(startHoursAgo: number, endHoursAgo: number): Date {
  const now = new Date();
  const start = new Date(now.getTime() - startHoursAgo * 60 * 60 * 1000);
  const end = new Date(now.getTime() - endHoursAgo * 60 * 60 * 1000);
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

export function generateDummyClothes(count: number = 20): Partial<Clothes>[] {
  // Check if dummy items are already stored in localStorage
  const stored = readDummyItems();
  if (stored.length > 0) {
    return stored;
  }

  const items: Partial<Clothes>[] = [];

  for (let i = 0; i < count; i++) {
    const item = getRandomElement(CLOTHING_ITEMS);
    const brand = getRandomElement(FASHION_BRANDS);
    const seller = getRandomElement(DUMMY_USERS);
    const minimumPrice = getRandomInt(20, 150);
    const hasBids = Math.random() > 0.3;
    const currentBid = hasBids ? minimumPrice + getRandomInt(5, 50) : 0;

    const createdAt = getRandomDate(72, 1); // Listed within last 3 days
    const endsAt = new Date(createdAt.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days from creation

    items.push({
      id: `dummy-${i}`,
      user_id: seller.id,
      title: `${brand} ${item.title}`,
      category: item.category,
      image_url: getRandomElement(FASHION_IMAGES),
      minimum_button_price: minimumPrice,
      current_highest_bid: currentBid,
      highest_bidder_id: hasBids ? getRandomElement(DUMMY_USERS).id : null,
      status: 'active',
      bidding_ends_at: endsAt.toISOString(),
      created_at: createdAt.toISOString(),
      updated_at: createdAt.toISOString(),
    });
  }

  const sorted = items.sort((a, b) =>
    new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()
  );

  // Persist for future loads
  writeDummyItems(sorted);
  return sorted;
}

export function generateDummyButtonListings(count: number = 10): Partial<ButtonResaleListing>[] {
  const listings: Partial<ButtonResaleListing>[] = [];

  for (let i = 0; i < count; i++) {
    const seller = getRandomElement(DUMMY_USERS);
    const buttonAmount = getRandomInt(5, 50) * 10;
    const pricePerButton = 0.08 + Math.random() * 0.04;
    const minimumPrice = parseFloat((buttonAmount * pricePerButton).toFixed(2));
    const hasBids = Math.random() > 0.4;
    const currentBid = hasBids ? minimumPrice + getRandomInt(1, 5) : 0;

    const createdAt = getRandomDate(72, 1);
    const endsAt = new Date(createdAt.getTime() + 3 * 24 * 60 * 60 * 1000);

    listings.push({
      id: `button-listing-${i}`,
      seller_id: seller.id,
      button_amount: buttonAmount,
      minimum_price_usd: minimumPrice,
      current_highest_bid_usd: currentBid,
      highest_bidder_id: hasBids ? getRandomElement(DUMMY_USERS).id : null,
      status: 'active',
      bidding_ends_at: endsAt.toISOString(),
      created_at: createdAt.toISOString(),
      updated_at: createdAt.toISOString(),
    });
  }

  return listings;
}

export function simulateLiveActivity(items: Partial<Clothes>[]): Partial<Clothes>[] {
  return items.map(item => {
    if (Math.random() > 0.85) {
      const incrementAmount = getRandomInt(5, 20);
      return {
        ...item,
        current_highest_bid: (item.current_highest_bid || item.minimum_button_price!) + incrementAmount,
        highest_bidder_id: getRandomElement(DUMMY_USERS).id,
      };

    type DemoBidRecord = {
      id: string;
      clothes_id: string;
      bidder_id: string;
      amount: number;
      status: 'active';
      created_at: string;
      item: Partial<Clothes>;
    };
    }
    return item;
  });
}

export function generateButtonHistory(userId: string, count: number = 10) {
  const history = [];
  const now = new Date();
  const types: ('earned_sale' | 'spent_bid' | 'purchase_platform' | 'purchase_user')[] = [
    'earned_sale',
    'spent_bid',
    'purchase_platform',
    'purchase_user'
  ];

  for (let i = 0; i < count; i++) {
    const daysAgo = getRandomInt(1, 30);
    const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    const type = getRandomElement(types);

    const amount = type.includes('earned') || type.includes('purchase')
      ? getRandomInt(20, 150)
      : -getRandomInt(15, 100);

    history.push({
      id: `txn-${i}`,
      user_id: userId,
      amount,
      transaction_type: type,
      description: getTransactionDescription(type, Math.abs(amount)),
      created_at: date.toISOString(),
    });
  }

  return history.sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

function getTransactionDescription(type: string, amount: number): string {
  switch (type) {
    case 'earned_sale':
      return `Earned ${amount} buttons from clothing sale`;
    case 'spent_bid':
      return `Spent ${amount} buttons on bid`;
    case 'purchase_platform':
      return `Purchased ${amount} buttons from platform`;
    case 'purchase_user':
      return `Purchased ${amount} buttons from user`;
    default:
      return `Transaction of ${amount} buttons`;
  }
}

export function getUserById(userId: string) {
  return DUMMY_USERS.find(u => u.id === userId) || DUMMY_USERS[0];
}

const DEMO_BIDS_KEY = 'unicorn_demo_bids';
const DEMO_BALANCE_KEY = 'unicorn_demo_balance';
const DUMMY_ITEMS_KEY = 'unicorn_dummy_items';

function readDummyItems(): Partial<Clothes>[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(DUMMY_ITEMS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Partial<Clothes>[];
  } catch {
    return [];
  }
}

function writeDummyItems(items: Partial<Clothes>[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(DUMMY_ITEMS_KEY, JSON.stringify(items));
}

function readDemoBids(): DemoBidRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(DEMO_BIDS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as DemoBidRecord[];
  } catch {
    return [];
  }
}

function writeDemoBids(bids: DemoBidRecord[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(DEMO_BIDS_KEY, JSON.stringify(bids));
}

function readDemoBalance(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(DEMO_BALANCE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, number>;
  } catch {
    return {};
  }
}

function writeDemoBalance(balance: Record<string, number>) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(DEMO_BALANCE_KEY, JSON.stringify(balance));
}

export function getDemoBalanceOffset(userId?: string) {
  if (!userId) return 0;
  const balance = readDemoBalance();
  return balance[userId] ?? 0;
}

export function applyDemoBalanceOffset(userId: string, delta: number) {
  const balance = readDemoBalance();
  balance[userId] = (balance[userId] ?? 0) + delta;
  writeDemoBalance(balance);
  return balance[userId];
}

export function getDemoBidsForUser(userId: string) {
  return readDemoBids().filter((bid) => bid.bidder_id === userId);
}

export function upsertDemoBid(userId: string, item: Partial<Clothes>, amount: number) {
  if (!item.id) return;
  const bids = readDemoBids();
  bids.forEach((bid) => {
    if (bid.bidder_id === userId && bid.clothes_id === item.id) {
      bid.status = 'outbid';
    }
  });
  const record: DemoBidRecord = {
    id: `demo-bid-${Date.now()}`,
    clothes_id: item.id,
    bidder_id: userId,
    amount,
    status: 'active',
    created_at: new Date().toISOString(),
    item: {
      id: item.id,
      title: item.title,
      category: item.category,
      image_url: item.image_url,
      minimum_button_price: item.minimum_button_price,
      current_highest_bid: amount,
      highest_bidder_id: userId,
      status: item.status,
      bidding_ends_at: item.bidding_ends_at,
      created_at: item.created_at,
      updated_at: new Date().toISOString(),
      user_id: item.user_id,
    },
  };

  bids.push(record);

  writeDemoBids(bids);
}

function hashStringToInt(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getSimulatedBidders(itemId: string, maxCount: number = 4) {
  const seed = hashStringToInt(itemId);
  const count = Math.max(2, (seed % maxCount) + 1);
  const bidders: typeof DUMMY_USERS = [];

  for (let i = 0; i < count; i++) {
    const index = (seed + i * 7) % DUMMY_USERS.length;
    const candidate = DUMMY_USERS[index];
    if (!bidders.find(bidder => bidder.id === candidate.id)) {
      bidders.push(candidate);
    }
  }

  return bidders;
}

export function getItemsByStatus(items: Partial<Clothes>[], status: 'new' | 'ending' | 'hot') {
  const now = new Date();

  switch (status) {
    case 'new':
      return items
        .filter(item => {
          const created = new Date(item.created_at!);
          const hoursSinceCreation = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
          return hoursSinceCreation < 24;
        })
        .slice(0, 10);

    case 'ending':
      return items
        .filter(item => {
          const end = new Date(item.bidding_ends_at!);
          const hoursUntilEnd = (end.getTime() - now.getTime()) / (1000 * 60 * 60);
          return hoursUntilEnd > 0 && hoursUntilEnd < 24;
        })
        .slice(0, 10);

    case 'hot':
      return items
        .filter(item => item.current_highest_bid && item.current_highest_bid > 0)
        .sort((a, b) => {
          const bidRatioA = (a.current_highest_bid || 0) / (a.minimum_button_price || 1);
          const bidRatioB = (b.current_highest_bid || 0) / (b.minimum_button_price || 1);
          return bidRatioB - bidRatioA;
        })
        .slice(0, 10);

    default:
      return items;
  }
}
