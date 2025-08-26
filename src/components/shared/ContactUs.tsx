import React, { useState } from 'react';
import { Box, Card, CardContent, CardHeader, CardActions, TextField, Button, Typography, IconButton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log('Form submitted:', formData);
  };

  const navigateHome = () => {
    navigate('/');
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 5, p: 2 }}>
      <img src="/images/logo2.svg" alt="Company Logo" style={{ display: 'block', margin: '0 auto', maxWidth: '150px', marginBottom: '20px' }} />
      <IconButton onClick={navigateHome} sx={{ mb: 2 }}>
        <ArrowBack />
      </IconButton>
      <Card>
        <CardHeader
          title="Contact Us"
          titleTypographyProps={{ variant: 'h4', align: 'center' }}
        />
        <CardContent>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              margin="normal"
              label="Your Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Your Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Your Message"
              name="message"
              multiline
              rows={4}
              value={formData.message}
              onChange={handleChange}
              required
            />
            <CardActions sx={{ justifyContent: 'center', mt: 2 }}>
              <Button type="submit" variant="contained" color="primary">
                Send Message
              </Button>
              <Button variant="outlined" color="secondary" onClick={navigateHome}>
                Back to Home
              </Button>
            </CardActions>
          </form>
        </CardContent>
        <CardContent>
          <Typography variant="body2" color="textSecondary" align="center">
            Company Address: 123 Main St, Homey Host
          </Typography>
          <Typography variant="body2" color="textSecondary" align="center">
            Phone: (123) 456-7890
          </Typography>
          <Typography variant="body2" color="textSecondary" align="center">
            Email: HomeyHost@
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ContactUs;