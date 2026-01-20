import { memo, useState } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  fallbackSrc?: string;
  priority?: boolean; // For critical images that should load immediately
}

const LazyImage = memo(({ 
  src, 
  alt, 
  className = '', 
  onError, 
  fallbackSrc,
  priority = false 
}: LazyImageProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setImageError(true);
    if (fallbackSrc) {
      (e.target as HTMLImageElement).src = fallbackSrc;
    }
    onError?.(e);
  };

  const handleLoad = () => {
    setImageLoaded(true);
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Loading placeholder */}
      {!imageLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="text-gray-400 text-sm">Carregando...</div>
        </div>
      )}
      
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        loading={priority ? 'eager' : 'lazy'}
        onError={handleError}
        onLoad={handleLoad}
        decoding="async"
      />
    </div>
  );
});

LazyImage.displayName = 'LazyImage';

export default LazyImage;