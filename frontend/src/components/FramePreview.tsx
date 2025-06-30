import React, { useEffect, useRef, useState } from 'react';

interface FramePreviewProps {
  photo: string | null;
  frameOverlay: string;
  selectedSize: string;
}

const FramePreview: React.FC<FramePreviewProps> = ({ photo, frameOverlay, selectedSize }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size based on container
    const container = canvas.parentElement;
    if (!container) return;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    canvas.width = containerWidth;
    canvas.height = containerHeight;

    const drawImage = async () => {
      try {
        setIsLoading(true);
        setError(null);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw photo if available, scaled to fit inside the overlay's inner area
        if (photo) {
          const photoImg = new Image();
          photoImg.crossOrigin = 'anonymous';
          photoImg.src = photo;
          await new Promise((resolve, reject) => {
            photoImg.onload = resolve;
            photoImg.onerror = () => reject(new Error('Failed to load photo'));
          });

          // Add padding so the photo doesn't overlap the frame border
          const padding = Math.floor(canvas.width * 0.08); // 8% padding
          const innerWidth = canvas.width - 2 * padding;
          const innerHeight = canvas.height - 2 * padding;
          const scale = Math.min(innerWidth / photoImg.width, innerHeight / photoImg.height);
          const drawWidth = photoImg.width * scale;
          const drawHeight = photoImg.height * scale;
          const x = (canvas.width - drawWidth) / 2;
          const y = (canvas.height - drawHeight) / 2;
          ctx.drawImage(photoImg, x, y, drawWidth, drawHeight);
        }

        // Draw frame overlay on top, always covering the photo
        const overlayImg = new Image();
        overlayImg.crossOrigin = 'anonymous';
        overlayImg.src = frameOverlay;
        await new Promise((resolve, reject) => {
          overlayImg.onload = resolve;
          overlayImg.onerror = () => reject(new Error('Failed to load frame overlay'));
        });
        ctx.drawImage(overlayImg, 0, 0, canvas.width, canvas.height);
      } catch (err) {
        console.error('Error drawing images:', err);
        setError(err instanceof Error ? err.message : 'Failed to load images');
      } finally {
        setIsLoading(false);
      }
    };

    drawImage();
  }, [photo, frameOverlay, selectedSize]);

  return (
    <div className="max-w-[600px] mx-auto aspect-[4/3] relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50">
          <p className="text-red-600 text-center">{error}</p>
        </div>
      )}
      <canvas 
        ref={canvasRef}
        className="w-full h-full object-contain"
      />
    </div>
  );
};

export default FramePreview;
