import React from 'react';
import { Box } from '@mui/material';
import { getColorByName } from '../../../utils/colors';

const ColorCircle = ({ colorCode, setSelectedColor, selectedColor, productID, ...props }) => {
  const isSelected = selectedColor === colorCode;

  return (
    <Box
      onClick={() => setSelectedColor(colorCode)}
      sx={{
        width: 30,
        height: 30,
        borderRadius: '50%',
        backgroundColor: getColorByName(colorCode),
        cursor: 'pointer',
        border: isSelected ? '3px solid #000' : '1px solid #ccc',
        display: 'inline-block',
        margin: '5px',
        position: 'relative',
        '&:hover': {
          boxShadow: '0 0 0 2px rgba(0,0,0,0.2)',
        },
        // Efecto de selección
        '&::after': isSelected ? {
          content: '""',
          position: 'absolute',
          top: -3,
          left: -3,
          right: -3,
          bottom: -3,
          border: '2px solid #000',
          borderRadius: '50%',
          animation: 'selectPulse 1s'
        } : {},
        '@keyframes selectPulse': {
          '0%': {
            transform: 'scale(0.8)',
            opacity: 1,
          },
          '100%': {
            transform: 'scale(1)',
            opacity: 1,
          },
        },
      }}
      {...props}
    />
  );
};

export default ColorCircle;
