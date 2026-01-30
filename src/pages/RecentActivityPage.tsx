import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Background } from '../components/Background';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, Upload, ShoppingBag, Coins, Clock, RefreshCcw } from 'lucide-react';
import { supabase, ButtonTransaction } from '../lib/supabase';

function getRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} min ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

function getActivityIcon(type: string) {
  switch (type) {
    case 'spent_bid':
      return TrendingUp;
    case 'purchase_platform':
    case 'purchase_user':
      return ShoppingBag;
    case 'earned_sale':
      return Coins;
    case 'refund':
      return RefreshCcw;
    case 'initial_grant':
      return Upload;
    default:
      return Coins;
  }
}

function getActivityColor(type: string) {
  switch (type) {
    case 'spent_bid':
      return 'bg-purple-600';
    case 'purchase_platform':
    case 'purchase_user':
      return 'bg-blue-600';
    case 'earned_sale':
      return 'bg-green-600';
    case 'refund':
      return 'bg-yellow-600';
    case 'initial_grant':
      return 'bg-teal-600';
    default:
      return 'bg-gray-600';
  }
}

function getActivityTitle(transaction: ButtonTransaction): string {
  switch (transaction.transaction_type) {
    case 'spent_bid':
      return 'Placed Bid';
    case 'purchase_platform':
      return 'Purchased Buttons';
    case 'purchase_user':
      return 'Purchased Buttons from User';
    case 'earned_sale':
      return 'Earned from Sale';
    case 'refund':
      return 'Refund Received';
    case 'initial_grant':
      return 'Initial Grant';
    default:
      return 'Transaction';
  }
}

export function RecentActivityPage() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<ButtonTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('button_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      if (data) {
        setTransactions(data);
      }
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setLoading(false);
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
            <p className="text-text-body">All button transactions across the marketplace</p>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="max-w-5xl mx-auto px-4 py-8">
          {loading ? (
            <div className="text-center py-16">
              <p className="text-gray-400">Loading activities...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400">No activities yet</p>
              <p className="text-sm text-gray-500 mt-2">Start bidding or listing items to see activity here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction, index) => {
                const Icon = getActivityIcon(transaction.transaction_type);
                const colorClass = getActivityColor(transaction.transaction_type);
                const title = getActivityTitle(transaction);
                const isPositive = transaction.amount > 0;

                return (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(index * 0.02, 0.4) }}
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
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="text-text-card text-base font-semibold">
                                {title}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {transaction.description}
                              </p>
                            </div>
                            <div className={`text-right ml-4 ${
                              isPositive ? 'text-green-600' : 'text-red-600'
                            }`}>
                              <p className="text-xl font-bold">
                                {isPositive ? '+' : ''}{transaction.amount}
                              </p>
                              <p className="text-xs text-gray-500">buttons</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock size={14} />
                              <span>{getRelativeTime(transaction.created_at)}</span>
                            </div>
                            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                              {transaction.transaction_type.replace(/_/g, ' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Load More */}
          {transactions.length > 0 && (
            <div className="mt-8 text-center">
              <Button variant="secondary" onClick={loadActivities}>
                Refresh Activity
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
