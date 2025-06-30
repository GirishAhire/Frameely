import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FramePreview from '../components/FramePreview';
import api, { API_BASE_URL } from '../config/api';
import { toast } from 'sonner';

interface Frame {
  _id: string; // MongoDB ID format
  name: string;
  description?: string;
  overlayUrl: string;
  sizesWithPrices: { label: string; price: number; stock?: number }[];
}

interface ApiError {
  message: string;
}

const skeletonArray = Array.from({ length: 8 });

// Function to convert MongoDB ObjectID to a consistent format
const normalizeId = (id: any): string => {
  if (!id) return '';
  const idStr = String(id).trim();
  
  // Debug info for the ID
  console.log(`Normalizing ID: "${idStr}" type: ${typeof id}`);
  
  // Return the trimmed string version
  return idStr;
};

const CatalogContent: React.FC = () => {
  const [frames, setFrames] = useState<Frame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [rawFrames, setRawFrames] = useState<any[]>([]);
  const navigate = useNavigate();

  const fetchFrames = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/frames');
      
      if (response.status !== 200) {
        throw new Error('Failed to fetch frames');
      }
      
      // Store raw frame data for debugging
      const frameData = response.data;
      setRawFrames(frameData);
      
      // Log raw frame data to inspect structure and ID format
      console.log('===== RAW FRAME DATA FROM API =====');
      console.log(JSON.stringify(frameData, null, 2));
      console.log('==================================');
      
      // Map frame IDs for debugging
      const idMap = frameData.map((f: any) => {
        return {
          id: f._id,
          idType: typeof f._id,
          idLength: String(f._id).length
        };
      });
      console.log('Frame ID details:', idMap);
      
      // Make sure all frames have string IDs
      const normalizedFrames = frameData.map((frame: any) => ({
        ...frame,
        _id: normalizeId(frame._id)
      }));
      
      console.log('Normalized frames count:', normalizedFrames.length);
      
      // Display the first frame ID for quick reference
      if (normalizedFrames.length > 0) {
        console.log('Example normalized frame ID:', normalizedFrames[0]._id);
        console.log('In JSON format:', JSON.stringify(normalizedFrames[0]));
      }
      
      setFrames(normalizedFrames);
      
      // Save the first frame to localStorage for testing
      if (normalizedFrames.length > 0) {
        try {
          const firstFrame = normalizedFrames[0];
          console.log('Storing frame in localStorage with ID:', firstFrame._id);
          localStorage.setItem("selectedFrame", JSON.stringify(firstFrame));
          
          // Test retrieval
          const storedFrame = localStorage.getItem("selectedFrame");
          if (storedFrame) {
            const parsedFrame = JSON.parse(storedFrame);
            console.log('Stored and retrieved ID:', parsedFrame._id);
          }
        } catch (e) {
          console.error('Error storing frame in localStorage:', e);
        }
      }
    } catch (err) {
      console.error('Error fetching frames:', err);
      setError({ message: err instanceof Error ? err.message : 'Failed to fetch frames' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFrames();
  }, []);

  const handleFrameSelect = (frame: Frame) => {
    try {
      // Normalize ID
      const normalizedFrame = {
        ...frame,
        _id: normalizeId(frame._id)
      };
      
      console.log('Selected frame with normalized ID:', normalizedFrame._id);
      
      // Debug the ID format
      console.log('ID format check:', {
        original: frame._id,
        normalized: normalizedFrame._id,
        originalType: typeof frame._id,
        normalizedType: typeof normalizedFrame._id,
        originalLength: String(frame._id).length,
        normalizedLength: String(normalizedFrame._id).length
      });
      
      // Save the selected frame to localStorage
      localStorage.setItem("selectedFrame", JSON.stringify(normalizedFrame));
      
      // Navigate with frame data
      navigate('/upload-preview', { 
        state: { frame: normalizedFrame }
      });
      
      // For debugging: print all raw frames
      console.log('All available frame IDs for comparison:');
      rawFrames.forEach((f, i) => {
        console.log(`Frame ${i}: ID=${f._id}, type=${typeof f._id}, length=${String(f._id).length}`);
      });
    } catch (err) {
      console.error('Error selecting frame:', err);
      toast.error('Failed to select frame. Please try again.');
    }
  };

  return (
    <div className="min-h-[70vh] bg-gradient-to-br from-gray-50 to-white py-12 px-2">
      <h1 className="text-3xl font-bold mb-10 text-center text-gray-900">Choose Your Frame</h1>
      {error ? (
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-red-500 text-lg mb-4">{error.message}</p>
          <button
            onClick={fetchFrames}
            className="px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {loading
            ? skeletonArray.map((_, i) => (
                <div key={i} className="aspect-square rounded-xl bg-gray-200 animate-pulse flex flex-col items-center justify-center relative">
                  <div className="w-20 h-20 bg-gray-300 rounded-full mb-4" />
                  <div className="h-4 w-2/3 bg-gray-300 rounded mb-2" />
                  <div className="h-3 w-1/2 bg-gray-300 rounded" />
                </div>
              ))
            : frames.map((frame) => {
                const minPrice = frame.sizesWithPrices.reduce(
                  (min, s) => Math.min(min, s.price), 
                  frame.sizesWithPrices[0]?.price || 0
                );
                return (
                  <button
                    key={frame._id}
                    onClick={() => handleFrameSelect(frame)}
                    className="group aspect-square bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-200 flex flex-col items-center justify-end relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    {/* Price badge */}
                    <span className="absolute top-3 right-3 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow z-10">
                      from ₹{minPrice}
                    </span>
                    {/* Frame image */}
                    <div className="w-full h-full flex items-center justify-center aspect-square bg-gray-100">
                      <img
                        src={`${API_BASE_URL}${frame.overlayUrl}`}
                        alt={frame.name}
                        className="object-contain w-5/6 h-5/6 transition-transform duration-200 group-hover:scale-105"
                        loading="lazy"
                        onError={e => {
                          (e.target as HTMLImageElement).src = '/placeholder.png';
                        }}
                      />
                    </div>
                    {/* Frame name */}
                    <div className="w-full px-4 py-3 text-center">
                      <h3 className="font-semibold text-base text-gray-900 truncate mb-1">{frame.name}</h3>
                      <p className="text-xs text-gray-500 truncate">{frame.description || 'Custom frame'}</p>
                    </div>
                  </button>
                );
              })}
        </div>
      )}
    </div>
  );
};

export default function Catalog() {
  return <CatalogContent />;
}