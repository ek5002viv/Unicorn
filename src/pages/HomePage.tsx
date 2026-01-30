import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Background } from '../components/Background';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { motion, AnimatePresence } from 'framer-motion';
import { Shirt, TrendingUp, ArrowRight, Coins, Upload, Activity } from 'lucide-react';
import { generateDummyClothes, generateButtonHistory } from '../lib/dummyData';

export function HomePage() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [featuredItems] = useState(() => generateDummyClothes(6));
  const [showButtonUpload, setShowButtonUpload] = useState(false);
  const [uploadAmount, setUploadAmount] = useState('');
  const [buttonHistory, setButtonHistory] = useState<any[]>([]);

  useEffect(() => {
    if (user && profile) {
      const history = generateButtonHistory(user.id, 5);
      setButtonHistory(history);
    }
  }, [user, profile]);

  const handleButtonUpload = async () => {
    // TODO: Implement actual button status upload logic
    // This would typically create a transaction record in Supabase
    setShowButtonUpload(false);
    setUploadAmount('');
    await refreshProfile();
  };

  return (
    <div className="min-h-screen relative bg-white">
      <Background />

      <div className="relative z-10">
        {/* SECTION 1: HERO */}
        <div className="border-b border-gray-200">
          <div className="max-w-[1100px] mx-auto px-4 py-16">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-brand-pink rounded-full mb-6">
                <Shirt size={40} className="text-white" />
              </div>
              <h1 className="text-5xl font-semibold text-text-primary mb-4">
                Trade fashion, not cash
              </h1>
              <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
                Join the community-powered fashion marketplace where clothes are traded using buttons.
                List, bid, and never get locked in.
              </p>
              <div className="flex items-center justify-center gap-4">
                <Button size="lg" onClick={() => navigate('/marketplace')}>
                  Browse marketplace
                  <ArrowRight className="ml-2" size={20} />
                </Button>
                <Button size="lg" variant="secondary" onClick={() => navigate('/list-clothing')}>
                  List your item
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: FEATURED ITEMS */}
        <div className="border-b border-gray-200 bg-brand-grey-light">
          <div className="max-w-[1100px] mx-auto px-4 py-16">
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-semibold text-text-primary mb-2">Trending now</h2>
                  <p className="text-text-secondary">Hot items with active bidding</p>
                </div>
                <Button variant="ghost" onClick={() => navigate('/marketplace')}>
                  View all
                  <ArrowRight className="ml-2" size={16} />
                </Button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredItems.map((item) => (
                  <div key={item.id}>
                    <Card hover className="cursor-pointer" onClick={() => navigate('/marketplace')}>
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-56 object-cover rounded-lg mb-4"
                      />
                      <h3 className="text-lg font-semibold text-text-primary mb-1">{item.title}</h3>
                      <p className="text-sm text-text-secondary mb-3">{item.category}</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-text-secondary">Current bid</p>
                          <p className="text-lg font-semibold text-brand-pink">
                            {item.current_highest_bid || item.minimum_button_price} <span className="text-sm">buttons</span>
                          </p>
                        </div>
                        {item.current_highest_bid && item.current_highest_bid > 0 && (
                          <div className="flex items-center gap-1 text-xs text-brand-pink">
                            <TrendingUp size={14} />
                            Hot
                          </div>
                        )}
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: BUTTON STATUS & ACTIVITY (NEW - PROMINENT) */}
        {user && profile && (
          <div className="border-b border-gray-200">
            <div className="max-w-[1100px] mx-auto px-4 py-16">
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-semibold text-text-primary mb-2">Your button economy</h2>
                    <p className="text-text-secondary">Track your balance, activity, and declare your button status</p>
                  </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6 mb-8">
                  {/* Balance Card */}
                  <Card className="bg-white border-gray-200">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-pink rounded-full mb-4">
                        <Coins size={32} className="text-white" />
                      </div>
                      <p className="text-sm text-text-secondary mb-2">Current balance</p>
                      <p className="text-5xl font-semibold text-text-primary mb-4">{profile.button_balance}</p>
                      <p className="text-xs text-text-secondary">buttons available to bid</p>
                    </div>
                  </Card>

                  {/* Inflow Card */}
                  <Card className="bg-white border-gray-200">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-pink rounded-full mb-4">
                        <TrendingUp size={32} className="text-white" />
                      </div>
                      <p className="text-sm text-text-secondary mb-2">Total earned</p>
                      <p className="text-5xl font-semibold text-text-primary mb-4">{profile.total_buttons_earned}</p>
                      <p className="text-xs text-text-secondary">buttons from sales</p>
                    </div>
                  </Card>

                  {/* Outflow Card */}
                  <Card className="bg-white border-gray-200">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-pink rounded-full mb-4">
                        <Activity size={32} className="text-white" />
                      </div>
                      <p className="text-sm text-text-secondary mb-2">Total spent</p>
                      <p className="text-5xl font-semibold text-text-primary mb-4">{profile.total_buttons_spent}</p>
                      <p className="text-xs text-text-secondary">buttons on bids</p>
                    </div>
                  </Card>
                </div>

                {/* Upload Button Status Section */}
                <Card>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="p-4 bg-brand-pink rounded-lg">
                        <Upload size={32} className="text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-text-primary mb-2">Declare button status</h3>
                      <p className="text-text-secondary mb-4">
                        Upload or declare your button balance for onboarding, verification, or record-keeping.
                        This helps maintain transparency in the button economy.
                      </p>
                      <Button onClick={() => setShowButtonUpload(!showButtonUpload)}>
                        {showButtonUpload ? 'Cancel' : 'Upload status'}
                      </Button>

                      <AnimatePresence>
                        {showButtonUpload && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 pt-4 border-t border-gray-200"
                          >
                            <div className="max-w-md">
                              <Input
                                label="Button amount"
                                type="number"
                                placeholder="Enter amount"
                                value={uploadAmount}
                                onChange={(e) => setUploadAmount(e.target.value)}
                              />
                              <div className="mt-4 flex gap-2">
                                <Button onClick={handleButtonUpload} disabled={!uploadAmount}>
                                  Confirm upload
                                </Button>
                                <Button variant="ghost" onClick={() => setShowButtonUpload(false)}>
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </Card>

                {/* Button History */}
                {buttonHistory.length > 0 && (
                  <Card className="mt-6">
                    <h3 className="text-xl font-semibold text-text-primary mb-4">Recent activity</h3>
                    <div className="space-y-3">
                      {buttonHistory.map((txn) => (
                        <div
                          key={txn.id}
                          className="flex items-center justify-between p-3 bg-brand-grey-light rounded-lg"
                        >
                          <div>
                            <p className="text-sm text-text-primary">{txn.description}</p>
                            <p className="text-xs text-text-secondary">
                              {new Date(txn.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <p className={`text-lg font-semibold ${txn.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {txn.amount > 0 ? '+' : ''}{txn.amount}
                          </p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="max-w-[1100px] mx-auto px-4 py-16">
          <div>
            <Card className="bg-brand-grey-light border-gray-200">
              <div className="text-center py-8">
                <h2 className="text-3xl font-semibold text-text-primary mb-4">
                  Ready to start trading?
                </h2>
                <p className="text-text-secondary mb-6 max-w-2xl mx-auto">
                  Join thousands of fashion lovers trading clothes without spending cash.
                  No lock-in, full transparency, community-powered.
                </p>
                <div className="flex items-center justify-center gap-4">
                  {!user ? (
                    <>
                      <Button size="lg" onClick={() => navigate('/auth')}>
                        Sign up free
                      </Button>
                      <Button size="lg" variant="secondary" onClick={() => navigate('/auth')}>
                        Login
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size="lg" onClick={() => navigate('/dashboard')}>
                        Go to dashboard
                      </Button>
                      <Button size="lg" variant="secondary" onClick={() => navigate('/marketplace')}>
                        Browse marketplace
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
