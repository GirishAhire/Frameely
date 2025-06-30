import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  SelectChangeEvent
} from '@mui/material';
import { toast } from 'react-hot-toast';

interface FrameFormData {
  name: string;
  description: string;
  price: number;
  category: string;
  image: FileList | null;
}

interface FormErrors {
  name?: string;
  description?: string;
  price?: string;
  category?: string;
  image?: string;
}

export default function FrameForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FrameFormData>({
    name: '',
    description: '',
    price: 0,
    category: '',
    image: null
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = () => {
    const newErrors: FormErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (!formData.price || formData.price <= 0) newErrors.price = 'Price must be positive';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.image) newErrors.image = 'Image is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof FrameFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent
  ) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: field === 'price' ? parseFloat(value) || 0 : value
    }));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFormData(prev => ({
        ...prev,
        image: event.target.files
      }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('price', formData.price.toString());
      data.append('category', formData.category);
      if (formData.image?.[0]) {
        data.append('image', formData.image[0]);
      }

      const response = await fetch('/api/frames', {
        method: 'POST',
        body: data,
      });

      if (!response.ok) {
        throw new Error('Failed to create frame');
      }

      toast.success('Frame created successfully');
      // Reset form
      setFormData({
        name: '',
        description: '',
        price: 0,
        category: '',
        image: null
      });
      setErrors({});
    } catch (error) {
      console.error('Error creating frame:', error);
      toast.error('Failed to create frame');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Add New Frame
        </Typography>
        <Card>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  fullWidth
                  label="Frame Name"
                  value={formData.name}
                  onChange={handleChange('name')}
                  error={!!errors.name}
                  helperText={errors.name}
                />
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={4}
                  value={formData.description}
                  onChange={handleChange('description')}
                  error={!!errors.description}
                  helperText={errors.description}
                />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Price"
                    type="number"
                    value={formData.price}
                    onChange={handleChange('price')}
                    error={!!errors.price}
                    helperText={errors.price}
                  />
                  <FormControl fullWidth error={!!errors.category}>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={formData.category}
                      label="Category"
                      onChange={handleChange('category')}
                    >
                      <MenuItem value="classic">Classic</MenuItem>
                      <MenuItem value="modern">Modern</MenuItem>
                      <MenuItem value="vintage">Vintage</MenuItem>
                      <MenuItem value="custom">Custom</MenuItem>
                    </Select>
                    {errors.category && (
                      <FormHelperText>{errors.category}</FormHelperText>
                    )}
                  </FormControl>
                </Box>
                <Button
                  component="label"
                  variant="outlined"
                  fullWidth
                >
                  Upload Image
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </Button>
                {errors.image && (
                  <FormHelperText error>Image is required</FormHelperText>
                )}
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating...' : 'Create Frame'}
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
} 