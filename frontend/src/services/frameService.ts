import { toast } from '@/components/ui/use-toast';

interface FrameData {
  name: string;
  image: File;
  sizes: Array<{
    label: string;
    price: number;
  }>;
}

export const uploadFrame = async (data: FrameData) => {
  try {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('image', data.image);
    formData.append('sizes', JSON.stringify(data.sizes));

    const response = await fetch('/api/frames', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload frame');
    }

    const result = await response.json();
    toast({
      title: 'Success',
      description: 'Frame uploaded successfully',
    });
    return result;
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to upload frame',
      variant: 'destructive',
    });
    throw error;
  }
};

export const getFrames = async () => {
  try {
    const response = await fetch('/api/frames');
    if (!response.ok) {
      throw new Error('Failed to fetch frames');
    }
    return await response.json();
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to fetch frames',
      variant: 'destructive',
    });
    throw error;
  }
};

export const deleteFrame = async (frameId: string) => {
  try {
    const response = await fetch(`/api/frames/${frameId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete frame');
    }
    toast({
      title: 'Success',
      description: 'Frame deleted successfully',
    });
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to delete frame',
      variant: 'destructive',
    });
    throw error;
  }
}; 