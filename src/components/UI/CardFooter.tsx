import React from 'react';
import { Box, Typography } from '@mui/material';

interface CardFooterProps {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

const CardFooter: React.FC<CardFooterProps> = ({ children, align = 'center', className = '' }) => {
  return (
    <Box
      component="footer"
      sx={{
        borderTop: 1,
        borderColor: 'divider',
        p: 2,
        textAlign: align,
      }}
      className={className}
    >
      <Typography variant="body2" color="textSecondary">
        {children}
      </Typography>
    </Box>
  );
};

export default CardFooter;