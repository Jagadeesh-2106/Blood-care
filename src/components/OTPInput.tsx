import { useState, useRef, useEffect } from 'react';
import { Input } from './ui/input';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
}

export function OTPInput({ 
  length = 6, 
  value, 
  onChange, 
  onComplete, 
  disabled = false,
  autoFocus = false
}: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(autoFocus ? 0 : null);

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  // Auto-focus first input if autoFocus is true
  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  // Handle input change
  const handleInputChange = (index: number, inputValue: string) => {
    // Only allow numeric input
    const numericValue = inputValue.replace(/[^0-9]/g, '');
    
    if (numericValue.length > 1) {
      // If pasting multiple digits, distribute them across inputs
      const digits = numericValue.slice(0, length).split('');
      const newValue = value.split('');
      
      for (let i = 0; i < digits.length && index + i < length; i++) {
        newValue[index + i] = digits[i];
      }
      
      const finalValue = newValue.join('').padEnd(length, '');
      onChange(finalValue.slice(0, length));
      
      // Focus the next empty input or the last input
      const nextIndex = Math.min(index + digits.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
    } else {
      // Single digit input
      const newValue = value.split('');
      newValue[index] = numericValue;
      const finalValue = newValue.join('');
      onChange(finalValue);
      
      // Auto-advance to next input if digit was entered
      if (numericValue && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
    
    // Check if OTP is complete
    const newCompleteValue = value.split('');
    newCompleteValue[index] = numericValue;
    const completeValue = newCompleteValue.join('');
    
    if (completeValue.length === length && !completeValue.includes('')) {
      onComplete?.(completeValue);
    }
  };

  // Handle key down events
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newValue = value.split('');
      
      if (newValue[index]) {
        // Clear current input
        newValue[index] = '';
        onChange(newValue.join(''));
      } else if (index > 0) {
        // Move to previous input and clear it
        newValue[index - 1] = '';
        onChange(newValue.join(''));
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === 'Delete') {
      e.preventDefault();
      const newValue = value.split('');
      newValue[index] = '';
      onChange(newValue.join(''));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      // Trigger onComplete if all digits are filled
      if (value.length === length && !value.includes('')) {
        onComplete?.(value);
      }
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const numericData = pastedData.replace(/[^0-9]/g, '');
    
    if (numericData) {
      const newValue = numericData.slice(0, length).padEnd(length, '');
      onChange(newValue.slice(0, length));
      
      // Focus the last filled input or the last input
      const lastFilledIndex = Math.min(numericData.length - 1, length - 1);
      inputRefs.current[lastFilledIndex]?.focus();
      
      // Check if complete
      if (numericData.length >= length) {
        onComplete?.(numericData.slice(0, length));
      }
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length }, (_, index) => (
        <Input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleInputChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={() => setFocusedIndex(index)}
          onBlur={() => setFocusedIndex(null)}
          disabled={disabled}
          className={`
            w-12 h-12 text-center text-lg font-semibold border-2 rounded-lg
            transition-all duration-200
            ${focusedIndex === index 
              ? 'border-red-500 ring-2 ring-red-200' 
              : value[index] 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-300 hover:border-gray-400'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text'}
          `}
          aria-label={`OTP digit ${index + 1}`}
        />
      ))}
    </div>
  );
}