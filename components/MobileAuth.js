import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function MobileAuth({ onSuccess, onCancel }) {
  const { signInWithPhone, verifyOTP } = useAuth();
  const [step, setStep] = useState('phone'); // 'phone' or 'otp'
  const [countryCode, setCountryCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Popular country codes with their details
  const countryCodes = [
    { code: '+1', country: 'US/CA', flag: '🇺🇸', maxLength: 10, format: '(XXX) XXX-XXXX' },
    { code: '+91', country: 'India', flag: '🇮🇳', maxLength: 10, format: 'XXXXX XXXXX' },
    { code: '+44', country: 'UK', flag: '🇬🇧', maxLength: 10, format: 'XXXX XXX XXX' },
    { code: '+49', country: 'Germany', flag: '🇩🇪', maxLength: 11, format: 'XXX XXXX XXXX' },
    { code: '+33', country: 'France', flag: '🇫🇷', maxLength: 9, format: 'X XX XX XX XX' },
    { code: '+81', country: 'Japan', flag: '🇯🇵', maxLength: 10, format: 'XX XXXX XXXX' },
    { code: '+86', country: 'China', flag: '🇨🇳', maxLength: 11, format: 'XXX XXXX XXXX' },
    { code: '+61', country: 'Australia', flag: '🇦🇺', maxLength: 9, format: 'XXX XXX XXX' },
    { code: '+55', country: 'Brazil', flag: '🇧🇷', maxLength: 11, format: 'XX XXXXX XXXX' },
    { code: '+7', country: 'Russia', flag: '🇷🇺', maxLength: 10, format: 'XXX XXX XX XX' },
    { code: '+52', country: 'Mexico', flag: '🇲🇽', maxLength: 10, format: 'XX XXXX XXXX' },
    { code: '+34', country: 'Spain', flag: '🇪🇸', maxLength: 9, format: 'XXX XXX XXX' },
    { code: '+39', country: 'Italy', flag: '🇮🇹', maxLength: 10, format: 'XXX XXX XXXX' },
    { code: '+31', country: 'Netherlands', flag: '🇳🇱', maxLength: 9, format: 'X XXXX XXXX' },
    { code: '+46', country: 'Sweden', flag: '🇸🇪', maxLength: 9, format: 'XX XXX XX XX' },
    { code: '+47', country: 'Norway', flag: '🇳🇴', maxLength: 8, format: 'XXXX XXXX' },
    { code: '+65', country: 'Singapore', flag: '🇸🇬', maxLength: 8, format: 'XXXX XXXX' },
    { code: '+82', country: 'South Korea', flag: '🇰🇷', maxLength: 10, format: 'XX XXXX XXXX' },
    { code: '+27', country: 'South Africa', flag: '🇿🇦', maxLength: 9, format: 'XX XXX XXXX' },
    { code: '+971', country: 'UAE', flag: '🇦🇪', maxLength: 9, format: 'XX XXX XXXX' }
  ];

  const getCurrentCountry = () => countryCodes.find(c => c.code === countryCode) || countryCodes[0];

  // Format phone number based on country
  const formatPhoneNumber = (value, country) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Apply country-specific formatting
    switch (country.code) {
      case '+1': // US/Canada: (XXX) XXX-XXXX
        if (digits.length <= 3) return digits;
        if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
        
      case '+91': // India: XXXXX XXXXX
        if (digits.length <= 5) return digits;
        return `${digits.slice(0, 5)} ${digits.slice(5, 10)}`;
        
      case '+44': // UK: XXXX XXX XXX
        if (digits.length <= 4) return digits;
        if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
        return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 10)}`;
        
      case '+49': // Germany: XXX XXXX XXXX
        if (digits.length <= 3) return digits;
        if (digits.length <= 7) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
        return `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7, 11)}`;
        
      case '+33': // France: X XX XX XX XX
        if (digits.length <= 1) return digits;
        if (digits.length <= 3) return `${digits.slice(0, 1)} ${digits.slice(1)}`;
        if (digits.length <= 5) return `${digits.slice(0, 1)} ${digits.slice(1, 3)} ${digits.slice(3)}`;
        if (digits.length <= 7) return `${digits.slice(0, 1)} ${digits.slice(1, 3)} ${digits.slice(3, 5)} ${digits.slice(5)}`;
        return `${digits.slice(0, 1)} ${digits.slice(1, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}`;
        
      case '+81': // Japan: XX XXXX XXXX
        if (digits.length <= 2) return digits;
        if (digits.length <= 6) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
        return `${digits.slice(0, 2)} ${digits.slice(2, 6)} ${digits.slice(6, 10)}`;
        
      case '+86': // China: XXX XXXX XXXX
        if (digits.length <= 3) return digits;
        if (digits.length <= 7) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
        return `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7, 11)}`;
        
      default: // Generic formatting for other countries
        if (digits.length <= 3) return digits;
        if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
        return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    }
  };

  const handlePhoneChange = (e) => {
    const country = getCurrentCountry();
    const formatted = formatPhoneNumber(e.target.value, country);
    setPhoneNumber(formatted);
    if (error) setError('');
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    // Extract digits only for validation
    const digits = phoneNumber.replace(/\D/g, '');
    const country = getCurrentCountry();
    
    if (digits.length < country.maxLength - 1 || digits.length > country.maxLength) {
      setError(`Please enter a valid ${country.maxLength}-digit phone number for ${country.country}`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Format phone number for Supabase with country code
      const formattedPhone = `${countryCode}${digits}`;
      
      const { error } = await signInWithPhone(formattedPhone);
      
      if (error) {
        setError(error.message);
      } else {
        setStep('otp');
        startCountdown();
      }
    } catch (err) {
      setError('Failed to send verification code. Please try again.');
    }
    
    setLoading(false);
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const digits = phoneNumber.replace(/\D/g, '');
      const formattedPhone = `${countryCode}${digits}`;
      
      const { data, error } = await verifyOTP(formattedPhone, otp);
      
      if (error) {
        setError(error.message);
      } else {
        onSuccess && onSuccess(data);
      }
    } catch (err) {
      setError('Failed to verify code. Please try again.');
    }
    
    setLoading(false);
  };

  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    setLoading(true);
    setError('');
    
    try {
      const digits = phoneNumber.replace(/\D/g, '');
      const formattedPhone = `${countryCode}${digits}`;
      
      const { error } = await signInWithPhone(formattedPhone);
      
      if (error) {
        setError(error.message);
      } else {
        startCountdown();
        setOtp('');
      }
    } catch (err) {
      setError('Failed to resend code. Please try again.');
    }
    
    setLoading(false);
  };

  return (
    <div className="mobile-auth-container">
      <style jsx>{`
        .mobile-auth-container {
          width: 100%;
        }
        
        .auth-step {
          text-align: center;
          margin-bottom: 20px;
        }
        
        .step-indicator {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
        }
        
        .step-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #3a3a3a;
          transition: all 0.3s ease;
        }
        
        .step-dot.active {
          background: #a8ee48;
        }
        
        .step-line {
          width: 30px;
          height: 2px;
          background: #3a3a3a;
        }
        
        .step-line.active {
          background: #a8ee48;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #ffffff;
          font-size: 14px;
        }
        
        .phone-input-container {
          position: relative;
          display: flex;
          gap: 10px;
        }
        
        .country-selector {
          position: relative;
          min-width: 120px;
        }
        
        .country-dropdown {
          width: 100%;
          padding: 15px 10px;
          border: 2px solid #e1e5e9;
          border-radius: 10px;
          font-size: 14px;
          background: #3a3a3a;
          color: #ffffff;
          cursor: pointer;
          transition: all 0.3s ease;
          appearance: none;
          background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><polyline points="6,9 12,15 18,9"/></svg>');
          background-repeat: no-repeat;
          background-position: right 10px center;
          background-size: 16px;
          padding-right: 35px;
        }
        
        .country-dropdown:focus {
          outline: none;
          border-color: #a8ee48;
          box-shadow: 0 0 0 3px rgba(168, 238, 72, 0.1);
        }
        
        .phone-input-wrapper {
          flex: 1;
          position: relative;
        }
        
        .form-group input {
          width: 100%;
          padding: 15px;
          border: 2px solid #e1e5e9;
          border-radius: 10px;
          font-size: 16px;
          transition: all 0.3s ease;
          box-sizing: border-box;
          background: #3a3a3a;
          color: #ffffff;
        }
        
        .form-group input:focus {
          outline: none;
          border-color: #a8ee48;
          box-shadow: 0 0 0 3px rgba(168, 238, 72, 0.1);
        }
        
        .form-group input.error {
          border-color: #e74c3c;
        }
        
        .otp-input {
          text-align: center;
          font-size: 24px;
          letter-spacing: 8px;
          font-weight: 600;
        }
        
        .error-message {
          color: #e74c3c;
          font-size: 12px;
          margin-top: 5px;
          text-align: center;
          background: #2a2a2a;
          padding: 10px;
          border-radius: 8px;
          border: 1px solid #e74c3c;
        }
        
        .success-message {
          color: #27ae60;
          font-size: 12px;
          margin-top: 5px;
          text-align: center;
          background: #2a2a2a;
          padding: 10px;
          border-radius: 8px;
          border: 1px solid #27ae60;
        }
        
        .button {
          width: 100%;
          background: #040404;
          color: #ffffff;
          border: 2px solid #ffffff;
          box-shadow: 0 0 0 2px #ffffff inset, 4px 4px 0 #ffffff;
          padding: 15px;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: 10px;
        }
        
        .button:hover:not(:disabled) {
          background: #a8ee48;
          color: #040404;
          box-shadow: 0 0 0 2px #040404 inset, 7px 7px 0 #040404;
        }
        
        .button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .button.secondary {
          background: transparent;
          color: #a8ee48;
          border: 2px solid #a8ee48;
          box-shadow: none;
        }
        
        .button.secondary:hover:not(:disabled) {
          background: #a8ee48;
          color: #040404;
        }
        
        .resend-container {
          text-align: center;
          margin-top: 15px;
        }
        
        .resend-text {
          color: #cccccc;
          font-size: 14px;
          margin-bottom: 10px;
        }
        
        .countdown {
          color: #a8ee48;
          font-weight: 600;
        }
        
        .back-button {
          color: #a8ee48;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 14px;
          text-decoration: underline;
          margin-top: 10px;
        }
        
        .back-button:hover {
          color: #c3f380;
        }
        
        .step-title {
          color: #ffffff;
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 10px;
        }
        
        .step-description {
          color: #cccccc;
          font-size: 14px;
          margin-bottom: 20px;
        }
      `}</style>

      {step === 'phone' && (
        <div className="auth-step">
          <div className="step-indicator">
            <div className="step-dot active"></div>
            <div className="step-line"></div>
            <div className="step-dot"></div>
          </div>
          
          <div className="step-title">Enter Your Phone Number</div>
          <div className="step-description">
            We'll send you a verification code to sign in
          </div>
          
          <form onSubmit={handleSendOTP}>
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <div className="phone-input-container">
                <div className="country-selector">
                  <select 
                    className="country-dropdown"
                    value={countryCode}
                    onChange={(e) => {
                      setCountryCode(e.target.value);
                      setPhoneNumber(''); // Clear phone number when country changes
                      if (error) setError('');
                    }}
                  >
                    {countryCodes.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.flag} {country.code} {country.country}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="phone-input-wrapper">
                  <input
                    type="tel"
                    id="phone"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    placeholder={getCurrentCountry().format.replace(/X/g, '0')}
                    className={error ? 'error' : ''}
                    maxLength={getCurrentCountry().maxLength + 5} // Extra space for formatting
                    required
                  />
                </div>
              </div>
            </div>
            
            <button type="submit" className="button" disabled={loading}>
              {loading ? 'Sending Code...' : 'Send Verification Code'}
            </button>
            
            <button type="button" className="back-button" onClick={onCancel}>
              Back to other sign-in options
            </button>
          </form>
        </div>
      )}

      {step === 'otp' && (
        <div className="auth-step">
          <div className="step-indicator">
            <div className="step-dot active"></div>
            <div className="step-line active"></div>
            <div className="step-dot active"></div>
          </div>
          
          <div className="step-title">Enter Verification Code</div>
          <div className="step-description">
            We sent a 6-digit code to {countryCode} {phoneNumber}
          </div>
          
          <form onSubmit={handleVerifyOTP}>
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-group">
              <label htmlFor="otp">Verification Code</label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 6) {
                    setOtp(value);
                    if (error) setError('');
                  }
                }}
                placeholder="123456"
                className={`otp-input ${error ? 'error' : ''}`}
                maxLength={6}
                required
              />
            </div>
            
            <button type="submit" className="button" disabled={loading || otp.length !== 6}>
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
            
            <div className="resend-container">
              <div className="resend-text">
                Didn't receive the code?
              </div>
              {countdown > 0 ? (
                <div className="countdown">
                  Resend in {countdown} seconds
                </div>
              ) : (
                <button 
                  type="button" 
                  className="button secondary" 
                  onClick={handleResendOTP}
                  disabled={loading}
                >
                  Resend Code
                </button>
              )}
            </div>
            
            <button 
              type="button" 
              className="back-button" 
              onClick={() => setStep('phone')}
            >
              Change phone number
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
