import React, { useEffect, useState } from 'react';
import api from 'frontend/src/api.js';

const FrameGallery = () => {
  const [frames, setFrames] = useState([]);
  const [selectedFrame, setSelectedFrame] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');

  useEffect(() => {
    const fetchFrames = async () => {
      try {
        const res = await api.get('/frames');
        setFrames(res.data);
      } catch (err) {
        console.error('Error:', err);
      }
    };

    fetchFrames();
  }, []);

  const handleFrameClick = (frame) => {
    setSelectedFrame(frame);
    setSelectedSize(frame.sizesWithPrices[0].label); // Default size
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
  };

  const getImageForSelectedSize = () => {
    if (!selectedFrame) return null;
    return selectedFrame.imageUrl; // Preview image will stay the same for now
  };

  const getPriceForSelectedSize = () => {
    if (!selectedFrame || !selectedSize) return null;
    const selectedSizeData = selectedFrame.sizesWithPrices.find(
      (s) => s.label === selectedSize
    );
    return selectedSizeData ? selectedSizeData.price : 0;
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 p-4">
        {frames.map((frame) => (
          <div
            key={frame._id}
            className="border rounded-lg p-4 shadow"
            onClick={() => handleFrameClick(frame)}
          >
            <img
              src={`http://localhost:5000${frame.imageUrl}`}
              alt={frame.name}
              className="w-full h-auto"
            />
            <h2 className="text-lg font-bold">{frame.name}</h2>
          </div>
        ))}
      </div>

      {/* Display selected frame and size options */}
      {selectedFrame && (
        <div className="selected-frame-info">
          <h2>{selectedFrame.name} - Selected Size: {selectedSize}</h2>
          <div className="size-options">
            {selectedFrame.sizesWithPrices.map((size) => (
              <button
                key={size.label}
                onClick={() => handleSizeSelect(size.label)}
                className={`size-btn ${selectedSize === size.label ? 'selected' : ''}`}
              >
                {size.label} - ₹{size.price}
              </button>
            ))}
          </div>

          {/* Display selected frame image and price */}
          <div className="preview">
            <img
              src={`http://localhost:5000${getImageForSelectedSize()}`}
              alt="Selected frame preview"
              className="preview-image"
            />
            <h3>Price: ₹{getPriceForSelectedSize()}</h3>
          </div>
        </div>
      )}
    </div>
  );
};

export default FrameGallery;
