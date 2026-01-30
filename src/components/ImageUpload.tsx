import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  existingImages?: string[];
}

export function ImageUpload({ onImagesChange, maxImages = 5, existingImages = [] }: ImageUploadProps) {
  const [images, setImages] = useState<string[]>(existingImages);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, [images, maxImages]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  }, [images, maxImages]);

  const handleFiles = (files: File[]) => {
    const remainingSlots = maxImages - images.length;
    const filesToProcess = files.slice(0, remainingSlots);

    filesToProcess.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newImage = e.target?.result as string;
          setImages(prev => {
            const updated = [...prev, newImage];
            onImagesChange(updated);
            return updated;
          });
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const updated = prev.filter((_, i) => i !== index);
      onImagesChange(updated);
      return updated;
    });
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        animate={{
          borderColor: isDragging ? '#7A3B8F' : '#4B5563',
          backgroundColor: isDragging ? 'rgba(122, 59, 143, 0.05)' : 'transparent',
        }}
        className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all"
        style={{
          borderColor: isDragging ? '#7A3B8F' : '#4B5563',
        }}
      >
        <input
          type="file"
          id="file-upload"
          accept="image/*"
          multiple
          onChange={handleFileInput}
          className="hidden"
          disabled={images.length >= maxImages}
        />

        <label htmlFor="file-upload" className="cursor-pointer">
          <motion.div
            animate={{
              scale: isDragging ? 1.05 : 1,
            }}
            className="flex flex-col items-center gap-3"
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#7A3B8F' }}
            >
              <Upload size={32} className="text-white" />
            </div>

            <div>
              <p className="text-lg font-semibold text-white mb-1">
                {images.length >= maxImages
                  ? `Maximum ${maxImages} images reached`
                  : 'Drop images here or click to upload'}
              </p>
              <p className="text-sm text-text-body">
                {images.length >= maxImages
                  ? 'Remove an image to upload more'
                  : `Upload up to ${maxImages} images (JPEG, PNG, GIF)`}
              </p>
            </div>
          </motion.div>
        </label>
      </motion.div>

      {/* Image Previews */}
      <AnimatePresence mode="popLayout">
        {images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
          >
            {images.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative aspect-square rounded-lg overflow-hidden group"
                style={{ backgroundColor: '#FFFFFF' }}
              >
                <img
                  src={image}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Remove Button */}
                <motion.button
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(index)}
                  type="button"
                >
                  <X size={16} />
                </motion.button>

                {/* Image Number */}
                <div className="absolute bottom-2 left-2 w-6 h-6 rounded-full flex items-center justify-center bg-black/60 text-white text-xs font-bold">
                  {index + 1}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info */}
      {images.length > 0 && (
        <div
          className="flex items-center gap-2 p-3 rounded-lg text-sm"
          style={{ backgroundColor: 'rgba(122, 59, 143, 0.1)', border: '1px solid #7A3B8F' }}
        >
          <ImageIcon size={16} style={{ color: '#7A3B8F' }} />
          <span style={{ color: '#7A3B8F' }}>
            {images.length} of {maxImages} images uploaded
          </span>
        </div>
      )}
    </div>
  );
}
