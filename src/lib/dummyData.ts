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
  { title: 'Vintage Denim Jacket', category: 'Outerwear', keywords: ['vintage', 'denim', 'jacket'] },
  { title: 'Floral Summer Dress', category: 'Dresses', keywords: ['floral', 'summer', 'dress'] },
  { title: 'Black Leather Boots', category: 'Shoes', keywords: ['leather', 'boots', 'black'] },
  { title: 'Silk Blouse', category: 'Tops', keywords: ['silk', 'blouse', 'elegant'] },
  { title: 'High-Waisted Jeans', category: 'Bottoms', keywords: ['jeans', 'high-waisted', 'denim'] },
  { title: 'Wool Sweater', category: 'Tops', keywords: ['wool', 'sweater', 'winter'] },
  { title: 'Maxi Skirt', category: 'Bottoms', keywords: ['maxi', 'skirt', 'bohemian'] },
  { title: 'Leather Crossbody Bag', category: 'Accessories', keywords: ['leather', 'bag', 'crossbody'] },
  { title: 'Statement Necklace', category: 'Accessories', keywords: ['jewelry', 'necklace', 'statement'] },
  { title: 'Ankle Strap Heels', category: 'Shoes', keywords: ['heels', 'ankle', 'strap'] },
  { title: 'Trench Coat', category: 'Outerwear', keywords: ['trench', 'coat', 'classic'] },
  { title: 'Crop Top', category: 'Tops', keywords: ['crop', 'top', 'casual'] },
  { title: 'Wide Leg Pants', category: 'Bottoms', keywords: ['pants', 'wide-leg', 'trendy'] },
  { title: 'Sundress', category: 'Dresses', keywords: ['sundress', 'summer', 'casual'] },
  { title: 'Sneakers', category: 'Shoes', keywords: ['sneakers', 'casual', 'comfortable'] },
];

export const FASHION_IMAGES = [
  'https://images.pexels.com/photos/1007018/pexels-photo-1007018.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/2584269/pexels-photo-2584269.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/1661787/pexels-photo-1661787.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/2065200/pexels-photo-2065200.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/1055691/pexels-photo-1055691.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/2010812/pexels-photo-2010812.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/1462637/pexels-photo-1462637.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/2739666/pexels-photo-2739666.jpeg?auto=compress&cs=tinysrgb&w=600',
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
  const items: Partial<Clothes>[] = [];

  for (let i = 0; i < count; i++) {
    const item = getRandomElement(CLOTHING_ITEMS);
    const brand = getRandomElement(FASHION_BRANDS);
    const seller = getRandomElement(DUMMY_USERS);
    const minimumPrice = getRandomInt(20, 150);
    const hasBids = Math.random() > 0.3;
    const currentBid = hasBids ? minimumPrice + getRandomInt(5, 50) : 0;

    const createdAt = getRandomDate(168, 1); // Listed within last week
    const endsAt = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from creation

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

  return items.sort((a, b) =>
    new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()
  );
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

    const createdAt = getRandomDate(168, 1);
    const endsAt = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000);

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
