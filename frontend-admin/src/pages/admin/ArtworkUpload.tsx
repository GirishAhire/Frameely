import { useState } from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { toast } from 'react-hot-toast';

const ArtworkUpload = () => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('artwork', file);

    try {
      const response = await fetch('/api/artworks/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      toast.success('Artwork uploaded successfully');
      setFile(null);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload artwork');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Upload Artwork
      </Typography>
      <Paper sx={{ p: 3, maxWidth: 600 }}>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          id="artwork-upload"
        />
        <label htmlFor="artwork-upload">
          <Button
            variant="contained"
            component="span"
            sx={{ mb: 2 }}
          >
            Select File
          </Button>
        </label>
        {file && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1">
              Selected file: {file.name}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpload}
              sx={{ mt: 2 }}
            >
              Upload
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ArtworkUpload; 