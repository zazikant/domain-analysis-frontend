import React, { useState, useRef, useEffect } from 'react';
import { validateEmail } from '@/utils/api';

// Simple clsx replacement
const clsx = (...classes: (string | boolean | undefined)[]): string => {
  return classes.filter(Boolean).join(' ');
};

interface EmailInputProps {
  onSendEmail: (email: string) => Promise<void>;
  isLoading: boolean;
  disabled?: boolean;
}

export const EmailInput: React.FC<EmailInputProps> = ({ 
  onSendEmail, 
  isLoading, 
  disabled = false 
}) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Validate email on change
  useEffect(() => {
    if (email.trim()) {
      const valid = validateEmail(email.trim());
      setIsValid(valid);
      setError(valid ? '' : 'Please enter a valid email address');
    } else {
      setIsValid(false);
      setError('');
    }
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValid || isLoading || disabled) return;

    const trimmedEmail = email.trim().toLowerCase();
    
    try {
      await onSendEmail(trimmedEmail);
      setEmail(''); // Clear input after successful send
      setError('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send email');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex space-x-3">
          <div className="flex-1">
            <input
              ref={inputRef}
              id="email-input"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter email address to analyze..."
              style={{
                pointerEvents: 'auto',
                position: 'relative',
                zIndex: 100
              }}
              className={clsx(
                'w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 transition-colors',
                'placeholder:text-gray-400',
                isValid && email.trim() 
                  ? 'focus:ring-green-500 border-green-300 bg-green-50' 
                  : 'focus:ring-primary-500 focus:border-primary-500',
                error && email.trim() && 'border-red-300 bg-red-50',
                (disabled || isLoading) && 'bg-gray-50 cursor-not-allowed'
              )}
              disabled={disabled || isLoading}
              autoComplete="email"
              autoFocus
            />
            
            {error && email.trim() && (
              <div className="mt-1 text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}
          </div>
          
          <button
            type="submit"
            disabled={!isValid || isLoading || disabled}
            className={clsx(
              'px-6 py-3 rounded-lg font-medium transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-2',
              isValid && !isLoading && !disabled
                ? 'bg-primary-500 hover:bg-primary-600 text-white focus:ring-primary-500 shadow-sm hover:shadow-md'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed',
              isLoading && 'animate-pulse'
            )}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Analyzing...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <span>Analyze</span>
              </div>
            )}
          </button>
        </div>
        
        <div className="text-xs text-gray-500 text-center">
          Enter an email address to analyze the domain and get business insights
        </div>
      </form>
    </div>
  );
};

export default EmailInput;