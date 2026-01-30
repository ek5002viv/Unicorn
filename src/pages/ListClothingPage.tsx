import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Background } from '../components/Background';
import { ImageUpload } from '../components/ImageUpload';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

const CATEGORIES = [
  'Tops',
  'Bottoms',
  'Dresses',
  'Outerwear',
  'Shoes',
  'Accessories',
  'Other'
];

export function ListClothingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [imageUrl, setImageUrl] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [useUpload, setUseUpload] = useState(true);
  const [minimumPrice, setMinimumPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const finalImageUrl = useUpload
        ? (uploadedImages[0] || '')
        : imageUrl;

      if (!finalImageUrl) {
        throw new Error('Please provide at least one image');
      }

      const biddingEndsAt = new Date();
      biddingEndsAt.setDate(biddingEndsAt.getDate() + 3);

      const { error: insertError } = await supabase.from('clothes').insert({
        user_id: user?.id,
        title,
        category,
        image_url: finalImageUrl,
        minimum_button_price: parseInt(minimumPrice),
        bidding_ends_at: biddingEndsAt.toISOString(),
        status: 'active',
      });

      if (insertError) throw insertError;

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to list clothing item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 relative bg-white">
      <Background />
      <div className="max-w-2xl mx-auto relative z-10">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft size={20} className="mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-semibold text-text-primary mb-2">List clothing item</h1>
          <p className="text-text-secondary">List your clothing item and start receiving bids in buttons</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Item title"
              placeholder="e.g., Vintage Denim Jacket"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-pink"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-3">
                Item images
              </label>

              <div className="flex gap-2 mb-4">
                <Button
                  type="button"
                  variant={useUpload ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setUseUpload(true)}
                >
                  Upload images
                </Button>
                <Button
                  type="button"
                  variant={!useUpload ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setUseUpload(false)}
                >
                  Use URL
                </Button>
              </div>

              {useUpload ? (
                <ImageUpload
                  onImagesChange={setUploadedImages}
                  maxImages={5}
                  existingImages={uploadedImages}
                />
              ) : (
                <>
                  <Input
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />

                  {imageUrl && (
                    <div className="mt-4 border border-gray-200 rounded-lg p-4">
                      <p className="text-sm text-text-secondary mb-2">Preview:</p>
                      <img
                        src={imageUrl}
                        alt="Preview"
                        className="w-full h-64 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Invalid+Image+URL';
                        }}
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            <Input
              label="Minimum button price"
              type="number"
              min="1"
              placeholder="e.g., 50"
              value={minimumPrice}
              onChange={(e) => setMinimumPrice(e.target.value)}
              required
            />

            <div className="bg-brand-pink/10 border border-brand-pink/20 rounded-lg p-4">
              <p className="text-sm text-brand-pink">
                Your item will be listed for 3 days. Users can bid buttons on your item.
                The highest bidder wins when the auction ends.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Listing...' : 'List item'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
