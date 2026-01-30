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
      return 'bg-brand-pink';
    case 'purchase_platform':
    case 'purchase_user':
      return 'bg-brand-pink';
    case 'earned_sale':
      return 'bg-green-600';
    case 'refund':
      return 'bg-yellow-600';
    case 'initial_grant':
      return 'bg-brand-pink';
    default:
      return 'bg-gray-400';
  }
}

function getActivityTitle(transaction: ButtonTransaction): string {
  switch (transaction.transaction_type) {
    case 'spent_bid':
      return 'Placed bid';
    case 'purchase_platform':
      return 'Purchased buttons';
    case 'purchase_user':
      return 'Purchased buttons from user';
    case 'earned_sale':
      return 'Earned from sale';
    case 'refund':
      return 'Refund received';
    case 'initial_grant':
      return 'Initial grant';
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
    <div className="min-h-screen relative bg-white">
      <Background />

      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white">
          <div className="max-w-[1100px] mx-auto px-4 py-6">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
              <ArrowLeft size={20} className="mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-semibold text-text-primary mb-2">Recent activity</h1>
            <p className="text-text-secondary">All button transactions across the marketplace</p>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="max-w-[1100px] mx-auto px-4 py-8">
          {loading ? (
            <div className="text-center py-16">
              <p className="text-text-secondary">Loading activities...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-text-secondary">No activities yet</p>
              <p className="text-sm text-text-secondary mt-2">Start bidding or listing items to see activity here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => {
                const Icon = getActivityIcon(transaction.transaction_type);
                const colorClass = getActivityColor(transaction.transaction_type);
                const title = getActivityTitle(transaction);
                const isPositive = transaction.amount > 0;

                return (
                  <div key={transaction.id}>
                    <Card hover className="cursor-pointer transition-all duration-200">
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className={`flex-shrink-0 w-12 h-12 ${colorClass} rounded-full flex items-center justify-center`}>
                          <Icon size={24} className="text-white" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="text-text-primary text-base font-semibold">
                                {title}
                              </p>
                              <p className="text-sm text-text-secondary mt-1">
                                {transaction.description}
                              </p>
                            </div>
                            <div className={`text-right ml-4 ${
                              isPositive ? 'text-green-600' : 'text-red-600'
                            }`}>
                              <p className="text-xl font-semibold">
                                {isPositive ? '+' : ''}{transaction.amount}
                              </p>
                              <p className="text-xs text-text-secondary">buttons</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-text-secondary">
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
                  </div>
                );
              })}
            </div>
          )}

          {/* Load More */}
          {transactions.length > 0 && (
            <div className="mt-8 text-center">
              <Button variant="secondary" onClick={loadActivities}>
                Refresh activity
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
