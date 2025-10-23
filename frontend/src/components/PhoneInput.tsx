/**
 * Dark Glassmorphic Phone Input Component with Country Code Dropdown
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  Typography,
  InputBase,
  Paper
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { countries, Country, defaultCountry } from '../data/countries';

interface PhoneInputProps {
  value: string;
  onChange: (phone: string) => void;
  error?: boolean;
  helperText?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  error = false,
  helperText,
  label = 'Phone Number',
  required = false,
  disabled = false,
  placeholder
}) => {
  const [selectedCountry, setSelectedCountry] = useState<Country>(defaultCountry);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Parse the current value to extract country and phone number
  useEffect(() => {
    if (value) {
      const foundCountry = countries.find(country => 
        value.startsWith(country.dialCode)
      );
      
      if (foundCountry) {
        setSelectedCountry(foundCountry);
        setPhoneNumber(value.substring(foundCountry.dialCode.length));
      } else {
        // Default to India if no country code found
        setSelectedCountry(defaultCountry);
        setPhoneNumber(value);
      }
    }
  }, [value]);

  const handleCountryChange = (country: Country) => {
    setSelectedCountry(country);
    setPhoneNumber(''); // Clear phone number when country changes
    onChange(country.dialCode);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value;
    // Only allow digits and limit length based on country format
    const digits = input.replace(/\D/g, '').slice(0, selectedCountry.format.length);
    setPhoneNumber(digits);
    onChange(selectedCountry.dialCode + digits);
  };

  // Filter countries based on search query
  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.dialCode.includes(searchQuery) ||
    country.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box>
      <Typography 
        variant="body2" 
        sx={{ 
          mb: 1.5, 
          color: 'rgba(255, 255, 255, 0.9)', 
          fontWeight: 600,
          fontSize: '0.9rem'
        }}
      >
        {label} {required && <span style={{ color: '#ff6b6b' }}>*</span>}
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
        {/* Country Code Dropdown */}
        <FormControl 
          variant="outlined" 
          size="small" 
          sx={{ minWidth: 140 }}
          disabled={disabled}
        >
          <Select
            value={selectedCountry.code}
            onChange={(e) => {
              const country = countries.find(c => c.code === e.target.value);
              if (country) handleCountryChange(country);
            }}
            displayEmpty
            open={isOpen}
            onOpen={() => setIsOpen(true)}
            onClose={() => {
              setIsOpen(false);
              setSearchQuery('');
            }}
            renderValue={() => (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ fontSize: '1.3rem' }}>{selectedCountry.flag}</Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontWeight: 500
                  }}
                >
                  {selectedCountry.dialCode}
                </Typography>
              </Box>
            )}
            sx={{
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: error ? '#ff6b6b' : 'rgba(255, 255, 255, 0.2)',
                borderWidth: '1px',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: error ? '#ff6b6b' : 'rgba(255, 255, 255, 0.4)',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: error ? '#ff6b6b' : '#4dabf7',
                borderWidth: '2px',
              },
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              '& .MuiSelect-select': {
                padding: '12px 14px',
                color: 'rgba(255, 255, 255, 0.9)',
              },
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  backgroundColor: 'rgba(30, 30, 30, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  mt: 1,
                  maxHeight: 300,
                  '& .MuiMenuItem-root': {
                    color: 'rgba(255, 255, 255, 0.9)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(77, 171, 247, 0.2)',
                    },
                  },
                },
              },
            }}
          >
            {/* Search Input */}
            <Box sx={{ p: 1, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <InputBase
                placeholder="Search countries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                startAdornment={<SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.5)', mr: 1 }} />}
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  '& input': {
                    padding: '8px 0',
                  },
                  '& input::placeholder': {
                    color: 'rgba(255, 255, 255, 0.5)',
                  },
                }}
              />
            </Box>
            
            {filteredCountries.map((country) => (
              <MenuItem key={country.code} value={country.code}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                  <Typography sx={{ fontSize: '1.3rem' }}>{country.flag}</Typography>
                  <Box sx={{ flex: 1 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontWeight: 500
                      }}
                    >
                      {country.dialCode}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.6)',
                        display: 'block'
                      }}
                    >
                      {country.name}
                    </Typography>
                  </Box>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Phone Number Input */}
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder={placeholder || selectedCountry.placeholder}
          value={phoneNumber}
          onChange={handlePhoneChange}
          error={error}
          disabled={disabled}
          required={required}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              '& fieldset': {
                borderColor: error ? '#ff6b6b' : 'rgba(255, 255, 255, 0.2)',
                borderWidth: '1px',
              },
              '&:hover fieldset': {
                borderColor: error ? '#ff6b6b' : 'rgba(255, 255, 255, 0.4)',
              },
              '&.Mui-focused fieldset': {
                borderColor: error ? '#ff6b6b' : '#4dabf7',
                borderWidth: '2px',
              },
              '& input': {
                color: 'rgba(255, 255, 255, 0.9)',
                padding: '12px 14px',
                '&::placeholder': {
                  color: 'rgba(255, 255, 255, 0.5)',
                },
              },
            },
          }}
        />
      </Box>

      {helperText && (
        <Typography 
          variant="caption" 
          sx={{ 
            mt: 1, 
            color: error ? '#ff6b6b' : 'rgba(255, 255, 255, 0.6)',
            display: 'block',
            fontSize: '0.8rem'
          }}
        >
          {helperText}
        </Typography>
      )}
    </Box>
  );
};

export default PhoneInput;