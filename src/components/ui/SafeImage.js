import React, { useState } from 'react';
import { FiImage } from 'react-icons/fi';

export default function SafeImage({ src, alt, className, style, fallbackIconSize = 40 }) {
  const [error, setError] = useState(false);

  // Normalize URL for Laravel storage or relative paths
  let imageUrl = src;
  if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
    if (imageUrl.startsWith('/storage')) {
      imageUrl = `http://localhost:8000${imageUrl}`;
    } else if (imageUrl.startsWith('storage/')) {
      imageUrl = `http://localhost:8000/${imageUrl}`;
    } else if (imageUrl.startsWith('/')) {
      imageUrl = `http://localhost:8000${imageUrl}`;
    }
  }

  if (!imageUrl || error) {
    return (
      <div 
        className={`safe-image-fallback ${className || ''}`} 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          backgroundColor: 'var(--color-bg-secondary)', 
          color: 'var(--color-text-muted)',
          ...style 
        }}
      >
        <FiImage size={fallbackIconSize} />
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt || 'Image'}
      className={className}
      style={style}
      onError={() => setError(true)}
    />
  );
}
