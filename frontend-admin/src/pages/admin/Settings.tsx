import { Box, Typography, Paper, TextField, Button, Switch, FormControlLabel } from '@mui/material';
import { useState } from 'react';

const Settings = () => {
  const [settings, setSettings] = useState({
    siteName: 'Frameely',
    adminEmail: 'admin@frameely.com',
    maintenanceMode: false,
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = event.target;
    setSettings(prev => ({
      ...prev,
      [name]: name === 'maintenanceMode' ? checked : value
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      <Paper sx={{ p: 3, maxWidth: 600 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Site Name"
            name="siteName"
            value={settings.siteName}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Admin Email"
            name="adminEmail"
            value={settings.adminEmail}
            onChange={handleChange}
            margin="normal"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.maintenanceMode}
                onChange={handleChange}
                name="maintenanceMode"
              />
            }
            label="Maintenance Mode"
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            Save Changes
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default Settings; 