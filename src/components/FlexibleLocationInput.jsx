import { useState } from 'react'
import { MapPin, Check, AlertCircle } from 'lucide-react'
import { Input } from "@/components/ui/input"

// UK postcode validation regex
const UK_POSTCODE_REGEX = /^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}$/i;

const FlexibleLocationInput = ({ 
  value, 
  onChange, 
  className = "",
  placeholder = "Enter your postcode (e.g. SW1 1AA)"
}) => {
  const [isValid, setIsValid] = useState(true);

  // Format postcode properly (uppercase with space)
  const formatPostcode = (postcode) => {
    const clean = postcode.replace(/\s/g, '').toUpperCase();
    if (clean.length >= 5) {
      return clean.slice(0, -3) + ' ' + clean.slice(-3);
    }
    return clean;
  };

  // Validate postcode format
  const validatePostcode = (postcode) => {
    if (!postcode) return true; // Allow empty
    return UK_POSTCODE_REGEX.test(postcode.trim());
  };

  // Handle input changes
  const handleInputChange = (inputValue) => {
    // Always update the value first so user can type
    onChange(inputValue);
    
    // Then validate
    const valid = validatePostcode(inputValue);
    setIsValid(valid);
  };

  // Handle blur event for formatting
  const handleBlur = () => {
    if (value && isValid) {
      const formatted = formatPostcode(value);
      if (formatted !== value) {
        onChange(formatted);
      }
    }
  };
  const getValidationIcon = () => {
    if (!value) return null;
    
    if (isValid) {
      return <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />;
    } else {
      return <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />;
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
        <Input
          type="text"
          value={value || ''}
          onChange={(e) => handleInputChange(e.target.value)}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`
            bg-white py-6 px-12 border-gray-200 focus:border-[hsl(var(--primary-500))] rounded-xl h-12 pl-10 pr-10
            ${!isValid && value ? 'border-red-300 focus:border-red-500' : ''}
            ${className}
          `}
        />
        {getValidationIcon()}
      </div>
      
      {!isValid && value && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          Please enter a valid UK postcode (e.g. SW1 1AA)
        </p>
      )}
      
      {isValid && value && (
        <p className="text-sm text-green-600 flex items-center gap-1">
          <Check className="w-4 h-4" />
          Valid postcode
        </p>
      )}
    </div>
  );
};

export default FlexibleLocationInput;