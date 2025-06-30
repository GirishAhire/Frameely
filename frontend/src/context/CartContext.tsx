import { create } from 'zustand';
import { toast } from 'sonner';
import api from '../config/api';

interface CartItem {
  id: string;
  frameId: string;
  size: string;
  quantity: number;
  price: number;
  photoUrl: string;
  frameName?: string; // Add name for better display
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'> & { frameData?: any }) => Promise<void>;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

// Helper for consistent handling of frame IDs
const normalizeId = (id: any): string => {
  if (!id) return '';
  return String(id).trim();
};

// Cache of frame data to avoid repeated API calls
let frameCache: Record<string, any> = {};

// Helper to check if a frame exists without throwing 404
const verifyFrameExists = async (frameId: string): Promise<boolean> => {
  try {
    // Check if we already have it in the cache
    if (frameCache[frameId]) {
      console.log(`Frame ID "${frameId}" found in cache`);
      return true;
    }
    
    // First try to get all frames and check if the ID exists
    const response = await api.get('/api/frames');
    if (response.status === 200 && response.data) {
      const frames = response.data;
      const normalizedId = normalizeId(frameId);
      
      // Update the cache with all frames
      frames.forEach((frame: any) => {
        const id = normalizeId(frame._id);
        frameCache[id] = frame;
      });
      
      const exists = frameCache[normalizedId] !== undefined;
      
      if (exists) {
        console.log(`Frame ID "${normalizedId}" exists in frame list`);
        return true;
      }
      
      console.log(`Frame ID "${normalizedId}" not found in frame list`);
      return false;
    }
    return false;
  } catch (error) {
    console.error('Error verifying frame existence:', error);
    return false;
  }
};

const useCartStore = create<CartState>((set, get) => ({
  items: [],
  
  addItem: async (item: Omit<CartItem, 'id'> & { frameData?: any }) => {
    try {
      console.log("Adding item to cart with frameId:", item.frameId);
      
      // Validate frameId
      if (!item.frameId || typeof item.frameId !== 'string') {
        console.error("Invalid frameId:", item.frameId);
        throw new Error('Invalid frame ID');
      }
      
      // Normalize frameId
      const normalizedId = normalizeId(item.frameId);
      console.log(`Normalized frameId: "${normalizedId}"`);
      
      // If frame data is provided directly, use it instead of fetching
      if (item.frameData) {
        console.log("Using provided frame data:", item.frameData);
        frameCache[normalizedId] = item.frameData;
      }
      
      // If frame data is not provided, verify the frame exists in the cache or server
      if (!frameCache[normalizedId]) {
        const frameExists = await verifyFrameExists(normalizedId);
        
        if (!frameExists) {
          console.error(`Frame with ID "${normalizedId}" doesn't exist`);
          throw new Error('The selected frame is no longer available. Please choose another frame.');
        }
      }
      
      // Get frame data from cache to check stock
      const frame = frameCache[normalizedId];
      
      if (!frame) {
        throw new Error('Frame data not available');
      }
      
      console.log("Using frame data from cache:", frame);
      
      const sizeInfo = frame.sizesWithPrices.find((s: any) => s.size === item.size || s.label === item.size);
      console.log("Size info:", sizeInfo);
      
      if (!sizeInfo) {
        throw new Error('Invalid size selected');
      }
      
      if (sizeInfo.stock && sizeInfo.stock < item.quantity) {
        throw new Error(`Only ${sizeInfo.stock} items available in stock`);
      }
      
      set((state) => {
        const existingItem = state.items.find(
          (i) => i.frameId === normalizedId && i.size === item.size
        );
        
        if (existingItem) {
          const newQuantity = existingItem.quantity + item.quantity;
          if (sizeInfo.stock && newQuantity > sizeInfo.stock) {
            throw new Error(`Only ${sizeInfo.stock} items available in stock`);
          }
          return {
            items: state.items.map((i) =>
              i.frameId === normalizedId && i.size === item.size
                ? { ...i, quantity: newQuantity }
                : i
            ),
          };
        }
        
        const newItem = {
          ...item,
          frameId: normalizedId,
          frameName: frame.name, // Store frame name for display
          id: Math.random().toString(36).substr(2, 9),
        };
        
        return { items: [...state.items, newItem] };
      });
      
      toast.success('Item added to cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add item to cart');
      throw error;
    }
  },
  
  updateQuantity: async (id: string, quantity: number) => {
    try {
      const item = get().items.find(i => i.id === id);
      if (!item) throw new Error('Item not found in cart');

      // Normalize frameId
      const normalizedId = normalizeId(item.frameId);
      console.log(`Checking stock for frame ID: "${normalizedId}"`);
      
      // Verify the frame exists in cache
      if (!frameCache[normalizedId]) {
        const frameExists = await verifyFrameExists(normalizedId);
        
        if (!frameExists) {
          throw new Error('The selected frame is no longer available');
        }
      }
      
      // Get frame data from cache
      const frame = frameCache[normalizedId];
      
      if (!frame) {
        throw new Error('Frame data not available');
      }
      
      const sizeInfo = frame.sizesWithPrices.find((s: any) => s.size === item.size || s.label === item.size);
      
      if (!sizeInfo) {
        throw new Error('Invalid size selected');
      }
      
      if (sizeInfo.stock && quantity > sizeInfo.stock) {
        throw new Error(`Only ${sizeInfo.stock} items available in stock`);
      }
      
      set((state) => ({
        items: state.items.map((item) =>
          item.id === id ? { ...item, quantity } : item
        ),
      }));
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update quantity');
      throw error;
    }
  },
  
  removeItem: (id: string) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));
    toast.success('Item removed from cart');
  },
  
  clearCart: () => {
    set({ items: [] });
    toast.success('Cart cleared');
  },
  
  totalItems: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },
  
  totalPrice: () => {
    return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
  },
}));

export default useCartStore; 