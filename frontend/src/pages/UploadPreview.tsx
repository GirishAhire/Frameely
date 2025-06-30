import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import FramePreview from "../components/FramePreview";
import { Button } from "../components/ui/button";
import useCartStore from "../context/CartContext";
import { toast } from "sonner";
import api, { API_BASE_URL } from "../config/api";

interface Size {
  label: string;
  price: number;
}

interface Frame {
  _id: string;
  name: string;
  overlayUrl: string;
  sizesWithPrices: Size[];
}

// Fix for MongoDB ObjectID handling
const normalizeId = (id: any): string => {
  if (!id) return '';
  return String(id).trim();
};

const LoadingOverlay = ({ message }: { message: string }) => (
  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
    <div className="flex flex-col items-center space-y-3">
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
      <p className="text-sm text-gray-600 font-medium">{message}</p>
    </div>
  </div>
);

const UploadPreview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [photo, setPhoto] = useState<string | null>(null);
  const [selectedFrame, setSelectedFrame] = useState<Frame | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [price, setPrice] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [quantity, setQuantity] = useState<number>(1);
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((s) => s.addItem);

  // Fetch all frames first to make sure we have valid IDs
  const fetchAllFrames = async () => {
    try {
      const response = await api.get('/api/frames');
      if (response.status === 200 && response.data) {
        const allFrames = response.data;
        console.log('All available frames:', allFrames);
        console.log('Available frame IDs:', allFrames.map((f: any) => f._id));
        
        return allFrames;
      }
      return [];
    } catch (error) {
      console.error('Error fetching all frames:', error);
      return [];
    }
  };

  useEffect(() => {
    const loadFrame = async () => {
      setLoading(true);
      try {
        // First fetch all frames for debugging
        const allFrames = await fetchAllFrames();
        
        // Try to get frame from navigation state
        const frameFromNav = location.state?.frame;
        console.log("Frame from navigation:", frameFromNav);
        
        if (frameFromNav && frameFromNav._id) {
          const normalizedId = normalizeId(frameFromNav._id);
          console.log(`Navigation frame ID normalized: "${normalizedId}"`);
          
          // Check if this ID exists in the list of all frames
          const frameExists = allFrames.some((f: any) => 
            normalizeId(f._id) === normalizedId
          );
          
          if (frameExists) {
            console.log(`Frame ID "${normalizedId}" found in available frames list`);
            
            // Find the frame in the list to get the server's version of the ID
            const exactFrame = allFrames.find((f: any) => 
              normalizeId(f._id) === normalizedId
            );
            
            if (exactFrame) {
              console.log('Found exact frame match:', exactFrame);
              handleFrameSelection(exactFrame);
              return;
            }
          } else {
            console.warn(`Frame ID "${normalizedId}" NOT found in available frames list`);
          }
          
          // Try to validate it anyway
          try {
            const validatedFrame = await validateFrame(normalizedId);
            console.log("Frame validated from navigation:", validatedFrame);
            handleFrameSelection(validatedFrame);
            return;
          } catch (error) {
            console.error("Error validating frame from navigation:", error);
            // Continue to try localStorage as fallback
          }
        }
        
        // Try to get frame from localStorage as fallback
        const storedFrameJson = localStorage.getItem("selectedFrame");
        if (storedFrameJson) {
          try {
            const parsedFrame = JSON.parse(storedFrameJson);
            console.log("Frame from localStorage:", parsedFrame);
            
            if (parsedFrame && parsedFrame._id) {
              const normalizedId = normalizeId(parsedFrame._id);
              console.log(`localStorage frame ID normalized: "${normalizedId}"`);
              
              // Check if this ID exists in the list of all frames
              const frameExists = allFrames.some((f: any) => 
                normalizeId(f._id) === normalizedId
              );
              
              if (frameExists) {
                console.log(`Frame ID "${normalizedId}" found in available frames list`);
                
                // Find the frame in the list to get the server's version of the ID
                const exactFrame = allFrames.find((f: any) => 
                  normalizeId(f._id) === normalizedId
                );
                
                if (exactFrame) {
                  console.log('Found exact frame match from localStorage ID:', exactFrame);
                  handleFrameSelection(exactFrame);
                  return;
                }
              } else {
                console.warn(`Frame ID "${normalizedId}" NOT found in available frames list`);
              }
              
              // Try to validate it anyway
              try {
                const validatedFrame = await validateFrame(normalizedId);
                console.log("Frame validated from localStorage:", validatedFrame);
                handleFrameSelection(validatedFrame);
                return;
              } catch (validationError) {
                console.error("Error validating frame from localStorage:", validationError);
              }
            }
          } catch (parseError) {
            console.error("Error parsing stored frame:", parseError);
          }
        }
        
        // If we get here, no valid frame was found
        console.log("No valid frame found, redirecting to catalog");
        
        // If we have frames available, select the first one
        if (allFrames.length > 0) {
          console.log("Using first available frame as fallback:", allFrames[0]);
          handleFrameSelection(allFrames[0]);
          return;
        }
        
        toast.error("Please select a frame from the catalog");
        navigate("/catalog");
      } catch (error) {
        console.error("Error loading frame:", error);
        toast.error("The selected frame is not available. Please choose another frame.");
        navigate("/catalog");
      } finally {
        setLoading(false);
      }
    };

    loadFrame();
  }, [location, navigate]);

  const validateFrame = async (frameId: string): Promise<Frame> => {
    console.log(`Validating frame with ID: "${frameId}"`);
    
    if (!frameId || frameId.trim() === '') {
      console.error("Invalid frame ID (empty)");
      throw new Error("Invalid frame ID");
    }
    
    try {
      // Make sure frameId is a clean string
      const cleanFrameId = frameId.trim();
      console.log(`Cleaned frame ID for API request: "${cleanFrameId}"`);
      
      // Check if the frame exists in the backend
      const response = await api.get(`/api/frames/${cleanFrameId}`);
      
      if (response.status !== 200 || !response.data) {
        console.error("Frame validation failed - no data returned");
        throw new Error("Selected frame not found");
      }
      
      const frameData = response.data;
      console.log("Frame data from API:", frameData);
      
      // Ensure frame has required fields
      if (!frameData._id || !frameData.name || !frameData.overlayUrl || !frameData.sizesWithPrices) {
        console.error("Frame missing required fields:", frameData);
        throw new Error("Invalid frame data");
      }
      
      // Normalize ID
      const normalizedFrame = {
        ...frameData,
        _id: normalizeId(frameData._id)
      };
      
      return normalizedFrame;
    } catch (error) {
      console.error("Frame validation error:", error);
      throw new Error("Selected frame not found");
    }
  };

  const handleFrameSelection = (frame: Frame) => {
    // Double check frame has required properties
    if (!frame._id || !frame.name || !frame.overlayUrl) {
      console.error("Invalid frame data in handleFrameSelection:", frame);
      toast.error("Invalid frame data");
      return;
    }
    
    // Normalize ID
    const normalizedFrame = {
      ...frame,
      _id: normalizeId(frame._id)
    };
    
    console.log("Setting selected frame:", normalizedFrame);
    console.log(`Frame ID: "${normalizedFrame._id}"`);
    
    setSelectedFrame(normalizedFrame);
    
    // If the frame has sizes, default select the first one
    if (normalizedFrame.sizesWithPrices && normalizedFrame.sizesWithPrices.length > 0) {
      const defaultSize = normalizedFrame.sizesWithPrices[0];
      setSelectedSize(defaultSize.label);
      setPrice(defaultSize.price);
    }
  };

  const optimizeImage = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }

          let width = img.width;
          let height = img.height;
          const maxDimension = 2000;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height / width) * maxDimension;
              width = maxDimension;
            } else {
              width = (width / height) * maxDimension;
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      try {
        const optimizedImage = await optimizeImage(file);
        setPhoto(optimizedImage);
      } catch (error) {
        console.error('Error processing image:', error);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleSizeSelect = (size: Size) => {
    setSelectedSize(size.label);
    setPrice(size.price);
  };

  const handleAddToCart = async () => {
    if (!selectedSize || !photo || !selectedFrame) {
      toast.error('Please select a size and upload a photo');
      return;
    }

    setAdding(true);
    try {
      console.log(`Adding to cart frame with ID: "${selectedFrame._id}"`);
      
      // Pass the entire frame data to avoid another API call
      await addItem({
        frameId: normalizeId(selectedFrame._id),
        size: selectedSize,
        price,
        photoUrl: photo,
        quantity,
        frameData: selectedFrame // Pass the entire frame object
      });
      
      toast.success('Added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Upload Your Photo</h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="ml-4 text-gray-600">Loading frame...</p>
        </div>
      ) : selectedFrame ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Left Panel - Preview */}
          <div className="max-w-md w-full mx-auto bg-gray-50 rounded-xl p-4 shadow-lg">
            <div className="sticky top-0 bg-gray-50 z-10 pb-4">
              <h2 className="text-xl font-medium">{selectedFrame.name}</h2>
              <p className="text-xs text-gray-500">Frame ID: {selectedFrame._id}</p>
            </div>
            <div className="relative">
              {isProcessing ? (
                <LoadingOverlay message="Processing your photo..." />
              ) : (
                <FramePreview 
                  photo={photo} 
                  frameOverlay={`${API_BASE_URL}${selectedFrame.overlayUrl}`}
                  selectedSize={selectedSize || "8x10"}
                />
              )}
            </div>
          </div>

          {/* Right Panel - Controls */}
          <div className="space-y-6">
            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-medium text-gray-700 mb-4">Upload Photo</h3>
              <div className="space-y-4">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-full 
                           file:border-0 file:text-sm file:font-semibold 
                           file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 
                           cursor-pointer disabled:opacity-50"
                  disabled={isProcessing}
                />
              </div>
            </div>

            {/* Size Selection */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-medium text-gray-700 mb-4">Select Size</h3>
              <div className="space-y-2">
                {selectedFrame.sizesWithPrices.map((sizeOption) => (
                  <button
                    key={sizeOption.label}
                    onClick={() => handleSizeSelect(sizeOption)}
                    className={`w-full p-3 text-left border rounded-lg transition-colors
                      ${selectedSize === sizeOption.label 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50'
                      }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{sizeOption.label}</span>
                      <span className="font-medium">₹{sizeOption.price}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="font-medium text-gray-700">Quantity</span>
                <select
                  value={quantity}
                  onChange={e => setQuantity(Number(e.target.value))}
                  className="border rounded px-3 py-1 text-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                  disabled={adding}
                >
                  {[1,2,3,4,5].map(q => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                </select>
              </div>
              <Button 
                onClick={handleAddToCart}
                disabled={!photo || !selectedSize || isProcessing || adding}
                className="w-full py-4 text-lg bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                {adding ? 'Adding...' : 'Add to Cart'}
              </Button>
            </div>

            {/* Price & Add to Cart */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center space-y-4">
                {selectedSize ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Total Price</p>
                    <p className="text-3xl font-bold text-blue-600">₹{price * quantity}</p>
                  </div>
                ) : (
                  <p className="text-gray-500">Select size to see price</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-600">No frame selected. Please select a frame from the catalog.</p>
          <Button 
            onClick={() => navigate('/catalog')}
            className="mt-4 bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Go to Catalog
          </Button>
        </div>
      )}
    </div>
  );
};

export default UploadPreview;