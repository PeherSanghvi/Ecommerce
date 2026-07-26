import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

const ImageGallery = ({ images = [], title = 'Product Image' }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const mainImageRef = useRef(null);
  const containerRef = useRef(null);

  // Ensure we have at least one valid image
  const validImages = images.filter(img => img && typeof img === 'string').length > 0 
    ? images.filter(img => img && typeof img === 'string')
    : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=80'];

  const selectedImage = validImages[selectedImageIndex];

  // Handle mouse movement for zoom
  const handleMouseMove = (e) => {
    if (!isZoomed || !mainImageRef.current) return;

    const rect = mainImageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setZoomPosition({ x, y });
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'Escape') setIsZoomed(false);
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedImageIndex]);

  const goToNext = () => {
    setSelectedImageIndex((prev) => (prev + 1) % validImages.length);
  };

  const goToPrevious = () => {
    setSelectedImageIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  };

  const handleThumbnailClick = (index) => {
    setSelectedImageIndex(index);
    setIsZoomed(false);
  };

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-4"
    >
      {/* Main Image Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-100 group"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setIsZoomed(false)}
      >
        {/* Main Image */}
        <motion.img
          ref={mainImageRef}
          key={selectedImage}
          src={selectedImage}
          alt={`${title} - Image ${selectedImageIndex + 1}`}
          className="w-full h-full object-contain cursor-zoom-in"
          animate={{
            scale: isZoomed ? 2 : 1,
            transformOrigin: isZoomed ? `${zoomPosition.x}% ${zoomPosition.y}%` : 'center',
          }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          onClick={() => setIsZoomed(!isZoomed)}
          initial={{ opacity: 0 }}
          exit={{ opacity: 0 }}
        />

        {/* Zoom Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: !isZoomed ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => setIsZoomed(true)}
          className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 hover:bg-white shadow-md cursor-pointer hover:scale-110 transition-transform"
        >
          <ZoomIn className="w-5 h-5 text-black" />
        </motion.div>

        {/* Navigation Arrows */}
        {validImages.length > 1 && (
          <>
            {/* Left Arrow */}
            <motion.button
              whileHover={{ scale: 1.1, x: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-white/90 hover:bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5 text-black" />
            </motion.button>

            {/* Right Arrow */}
            <motion.button
              whileHover={{ scale: 1.1, x: 2 }}
              whileTap={{ scale: 0.95 }}
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-white/90 hover:bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5 text-black" />
            </motion.button>
          </>
        )}

        {/* Image Counter */}
        {validImages.length > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-black/60 text-white text-xs font-bold"
          >
            {selectedImageIndex + 1} / {validImages.length}
          </motion.div>
        )}
      </motion.div>

      {/* Thumbnail Gallery */}
      {validImages.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex gap-2 overflow-x-auto pb-2"
        >
          {validImages.map((image, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleThumbnailClick(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                selectedImageIndex === index
                  ? 'border-black shadow-md'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <img
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* Info Text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="text-xs text-gray-500 font-medium"
      >
        {isZoomed ? 'Click to zoom out · Use arrow keys to navigate' : 'Click image to zoom · Use arrow keys to navigate'}
      </motion.div>
    </motion.div>
  );
};

export default ImageGallery;
