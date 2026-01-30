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
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all"
        style={{
          borderColor: isDragging ? '#F4A6B8' : '#D1D5DB',
          backgroundColor: isDragging ? 'rgba(244, 166, 184, 0.05)' : 'transparent',
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
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-brand-pink">
              <Upload size={32} className="text-white" />
            </div>

            <div>
              <p className="text-lg font-semibold text-text-primary mb-1">
                {images.length >= maxImages
                  ? `Maximum ${maxImages} images reached`
                  : 'Drop images here or click to upload'}
              </p>
              <p className="text-sm text-text-secondary">
                {images.length >= maxImages
                  ? 'Remove an image to upload more'
                  : `Upload up to ${maxImages} images (JPEG, PNG, GIF)`}
              </p>
            </div>
          </div>
        </label>
      </div>

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-lg overflow-hidden group bg-brand-grey-light"
            >
              <img
                src={image}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Remove Button */}
              <button
                className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
                type="button"
              >
                <X size={16} />
              </button>

              {/* Image Number */}
              <div className="absolute bottom-2 left-2 w-6 h-6 rounded-full flex items-center justify-center bg-black/60 text-white text-xs font-bold">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info */}
      {images.length > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-lg text-sm bg-brand-pink/10 border border-brand-pink/20">
          <ImageIcon size={16} className="text-brand-pink" />
          <span className="text-brand-pink">
            {images.length} of {maxImages} images uploaded
          </span>
        </div>
      )}
    </div>
  );
}
