import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Background } from '../components/Background';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, Upload, ShoppingBag, Coins, Clock } from 'lucide-react';
import { getUserById } from '../lib/dummyData';

type ActivityType = 'bid' | 'listing' | 'button_purchase' | 'button_sale';

interface Activity {
  id: string;
  type: ActivityType;
  userId: string;
  itemName?: string;
  amount?: number;
  timestamp: Date;
  targetUserId?: string;
}

function generateRecentActivities(count: number = 20): Activity[] {
  const activities: Activity[] = [];
  const now = new Date();

  const types: ActivityType[] = ['bid', 'listing', 'button_purchase', 'button_sale'];
  const itemNames = [
    'Floral Maxi Dress',
    'Little Black Dress',
    'Vintage Wrap Dress',
    'Summer Midi Dress',
    'Silk Slip Dress',
    'Boho Sundress',
    'Evening Gown',
    'Casual Shift Dress',
  ];

  for (let i = 0; i < count; i++) {
    const minutesAgo = Math.floor(Math.random() * 240) + 1; // 1-240 minutes ago
    const timestamp = new Date(now.getTime() - minutesAgo * 60 * 1000);
    const type = types[Math.floor(Math.random() * types.length)];

    const activity: Activity = {
      id: `activity-${i}`,
      type,
      userId: `user-${Math.floor(Math.random() * 8) + 1}`,
      timestamp,
    };

    if (type === 'bid' || type === 'listing') {
      activity.itemName = itemNames[Math.floor(Math.random() * itemNames.length)];
      if (type === 'bid') {
        activity.amount = Math.floor(Math.random() * 100) + 20;
      }
    } else {
      activity.amount = Math.floor(Math.random() * 200) + 50;
      if (type === 'button_purchase') {
        activity.targetUserId = `user-${Math.floor(Math.random() * 8) + 1}`;
      }
    }

    activities.push(activity);
  }

  return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} min ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

function getActivityIcon(type: ActivityType) {
  switch (type) {
    case 'bid':
      return TrendingUp;
    case 'listing':
      return Upload;
    case 'button_purchase':
      return ShoppingBag;
    case 'button_sale':
      return Coins;
  }
}

function getActivityColor(type: ActivityType) {
  switch (type) {
    case 'bid':
      return 'bg-brand-purple';
    case 'listing':
      return 'bg-green-600';
    case 'button_purchase':
      return 'bg-blue-600';
    case 'button_sale':
      return 'bg-brand-gold';
  }
}

export function RecentActivityPage() {
  const navigate = useNavigate();
  const [activities] = useState(() => generateRecentActivities(25));

  const getActivityDescription = (activity: Activity) => {
    const actorUser = getUserById(activity.userId);
    const targetUser = activity.targetUserId ? getUserById(activity.targetUserId) : null;

    switch (activity.type) {
      case 'bid':
        return (
          <>
            <span className="font-semibold text-white">{actorUser.name}</span>
            {' '}bid{' '}
            <span className="font-semibold text-brand-gold">{activity.amount} buttons</span>
            {' '}on{' '}
            <span className="font-semibold text-white">{activity.itemName}</span>
          </>
        );
      case 'listing':
        return (
          <>
            <span className="font-semibold text-white">{actorUser.name}</span>
            {' '}listed{' '}
            <span className="font-semibold text-white">{activity.itemName}</span>
          </>
        );
      case 'button_purchase':
        return (
          <>
            <span className="font-semibold text-white">{actorUser.name}</span>
            {' '}purchased{' '}
            <span className="font-semibold text-brand-gold">{activity.amount} buttons</span>
            {targetUser && (
              <>
                {' '}from{' '}
                <span className="font-semibold text-white">{targetUser.name}</span>
              </>
            )}
          </>
        );
      case 'button_sale':
        return (
          <>
            <span className="font-semibold text-white">{actorUser.name}</span>
            {' '}sold{' '}
            <span className="font-semibold text-brand-gold">{activity.amount} buttons</span>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen relative">
      <Background />

      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-gray-700" style={{ backgroundColor: '#4B2D4F' }}>
          <div className="max-w-5xl mx-auto px-4 py-6">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
              <ArrowLeft size={20} className="mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-white mb-2">Recent Activity</h1>
            <p className="text-text-body">See what's happening in the marketplace</p>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="space-y-4">
            {activities.map((activity, index) => {
              const Icon = getActivityIcon(activity.type);
              const colorClass = getActivityColor(activity.type);
              const user = getUserById(activity.userId);

              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(index * 0.03, 0.6) }}
                >
                  <Card
                    hover
                    className="cursor-pointer transition-all duration-200"
                    style={{ backgroundColor: '#FFFFFF' }}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`flex-shrink-0 w-12 h-12 ${colorClass} rounded-full flex items-center justify-center`}>
                        <Icon size={24} className="text-white" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-text-card text-base leading-relaxed mb-2">
                          {getActivityDescription(activity)}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {user.avatar}
                            </div>
                            <span>{user.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span>{getRelativeTime(activity.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Load More */}
          <div className="mt-8 text-center">
            <Button variant="secondary">Load More Activity</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
