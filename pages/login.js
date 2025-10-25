import Head from 'next/head';
import Script from 'next/script';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import MobileAuth from '../components/MobileAuth';

export default function LoginPage() {
  const router = useRouter();
  const { signUp, signUpWithGoogle, signIn, signInWithGoogle, resetPassword } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showMobileAuth, setShowMobileAuth] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Check for OAuth errors in URL
  useEffect(() => {
    const { error } = router.query;
    if (error === 'auth_failed') {
      setErrors({ general: 'Google sign-in was cancelled or failed. Please try again.' });
    }
  }, [router.query]);

  const handleBackClick = () => {
    setLoading(true);
    setTimeout(() => {
      router.push('/');
    }, 600);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Password validation for signup
    if (name === 'password' && isSignup) {
      validatePassword(value);
    }
  };

  const validatePassword = (password) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    setPasswordRequirements(requirements);
    return Object.values(requirements).every(req => req);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (isSignup) {
      if (!formData.username) newErrors.username = 'Username is required';
      if (!formData.email) newErrors.email = 'Email is required';
      if (!formData.password) newErrors.password = 'Password is required';
      else if (!validatePassword(formData.password)) newErrors.password = 'Password does not meet requirements';
      if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
      else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    } else {
      if (!formData.email) newErrors.email = 'Email is required';
      if (!formData.password) newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    
    try {
      if (isSignup) {
        const { data, error } = await signUp(formData.email, formData.password, formData.username);
        
        if (error) {
          setErrors({ general: error.message });
          setLoading(false);
          return;
        }
        
        // Check if email confirmation is required
        if (data.user && !data.session) {
          alert('Please check your email for a confirmation link!');
        } else {
          router.push('/');
        }
      } else {
        const { data, error } = await signIn(formData.email, formData.password);
        
        if (error) {
          setErrors({ general: error.message });
          setLoading(false);
          return;
        }
        
        router.push('/');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const { data, error } = isSignup ? await signUpWithGoogle() : await signInWithGoogle();
      
      if (error) {
        setErrors({ general: error.message });
        setLoading(false);
      }
      // If successful, the redirect will happen automatically
      // No need to set loading to false as user will be redirected
    } catch (error) {
      console.error('Google sign-in error:', error);
      setErrors({ general: 'Google sign-in failed. Please try again.' });
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      setErrors({ email: 'Please enter your email address' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await resetPassword(formData.email);
      
      if (error) {
        setErrors({ general: error.message });
      } else {
        alert('Password reset email sent! Please check your inbox.');
        setShowResetPassword(false);
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setErrors({ general: 'Failed to send reset email. Please try again.' });
    }
    setLoading(false);
  };

  const handleMobileAuthSuccess = (data) => {
    console.log('Mobile auth successful:', data);
    router.push('/');
  };

  const handleMobileAuthCancel = () => {
    setShowMobileAuth(false);
    setErrors({});
  };

  const getPasswordStrength = () => {
    const strength = Object.values(passwordRequirements).filter(req => req).length;
    const strengthText = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const strengthColor = ['#e74c3c', '#e67e22', '#f39c12', '#27ae60', '#2ecc71'];
    return {
      text: strengthText[strength - 1] || 'Very Weak',
      color: strengthColor[strength - 1] || '#e74c3c'
    };
  };

  return (
    <>
      <Head>
        <title>Login - Conversational Chatbot</title>
        <meta content="Login to access your personalized conversational chatbot experience with secure authentication and smooth user experience." name="description"/>
        <meta content="Login - Conversational Chatbot" property="og:title"/>
        <meta content="Login to access your personalized conversational chatbot experience with secure authentication and smooth user experience." property="og:description"/>
        <meta content="Login - Conversational Chatbot" property="twitter:title"/>
        <meta content="Login to access your personalized conversational chatbot experience with secure authentication and smooth user experience." property="twitter:description"/>
        <meta property="og:type" content="website"/>
        <meta content="summary_large_image" name="twitter:card"/>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      </Head>

      <style jsx>{`
        .auth-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #040404;
          padding: 20px;
        }
        
        .auth-card {
          background: #2a2a2a;
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
          overflow: hidden;
          width: 100%;
          max-width: 500px;
          position: relative;
        }
        
        .auth-header {
          background: #a8ee48;
          color: #040404;
          padding: 30px;
          text-align: center;
        }
        
        .auth-header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
          font-family: "Fjalla One", sans-serif;
        }
        
        .auth-header p {
          margin: 10px 0 0 0;
          opacity: 0.9;
          font-size: 16px;
        }
        
        .auth-body {
          padding: 40px 30px;
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

        .password-input-container {
          position: relative;
          display: flex;
          align-items: center;
        }

        .password-input-container input {
          padding-right: 50px;
        }

        .password-toggle {
          position: absolute;
          right: 15px;
          background: none;
          border: none;
          color: #7a7a7a;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.3s ease;
        }

        .password-toggle:hover {
          color: #a8ee48;
        }

        .password-toggle .material-icons {
          font-size: 20px;
        }
        
        .form-group input:focus {
          outline: none;
          border-color: #a8ee48;
          box-shadow: 0 0 0 3px rgba(168, 238, 72, 0.1);
        }
        
        .form-group input.error {
          border-color: #e74c3c;
        }
        
        .error-message {
          color: #e74c3c;
          font-size: 12px;
          margin-top: 5px;
          display: none;
        }
        
        .password-requirements {
          background: #3a3a3a;
          border-radius: 8px;
          padding: 15px;
          margin-top: 10px;
          font-size: 12px;
          color: #cccccc;
        }
        
        .password-requirements ul {
          margin: 8px 0 0 0;
          padding-left: 20px;
        }
        
        .password-requirements li {
          margin-bottom: 4px;
        }
        
        .password-requirements li.valid {
          color: #27ae60;
        }
        
        .password-requirements li.invalid {
          color: #e74c3c;
        }
        
        .password-strength-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        
        .button {
          width: 100%;
          margin-bottom: 15px;
        }
        
        .button.is-secondary {
          background: #040404 !important;
          color: #ffffff !important;
          border: 2px solid #ffffff !important;
          box-shadow: 0 0 0 2px #ffffff inset, 4px 4px 0 #ffffff !important;
        }
        
        .button.is-secondary:hover {
          background: #a8ee48 !important;
          color: #040404 !important;
          box-shadow: 0 0 0 2px #040404 inset, 7px 7px 0 #040404 !important;
        }
        
        .btn-google {
          width: 100%;
          background: #3a3a3a;
          color: #ffffff;
          border: 2px solid #e1e5e9;
          padding: 15px;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        
        .btn-google:hover {
          background: #f8f9fa;
          border-color: #a8ee48;
          color: #000000;
        }
        
        .btn-phone {
          width: 100%;
          background: #3a3a3a;
          color: #ffffff;
          border: 2px solid #e1e5e9;
          padding: 15px;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        
        .btn-phone:hover {
          background: #f8f9fa;
          border-color: #a8ee48;
          color: #000000;
        }
        
        .google-icon {
          width: 20px;
          height: 20px;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path fill="%23FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="%23FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/><path fill="%234CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/><path fill="%231976D2" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/></svg>') no-repeat center;
          background-size: contain;
        }
        
        .phone-icon {
          width: 20px;
          height: 20px;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>') no-repeat center;
          background-size: contain;
        }
        
        .divider {
          text-align: center;
          margin: 20px 0;
          position: relative;
          color: #999;
          font-size: 14px;
        }
        
        .divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: #e1e5e9;
        }
        
        .divider span {
          background: #2a2a2a;
          padding: 0 15px;
          position: relative;
          z-index: 1;
          color: #cccccc;
        }
        
        .auth-footer {
          text-align: center;
          margin-top: 20px;
        }
        
        .auth-footer a {
          color: #a8ee48;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.3s ease;
        }
        
        .auth-footer p {
          color: #ffffff;
        }
        
        .auth-footer a:hover {
          color: #c3f380;
        }
        
        .forgot-password {
          text-align: right;
          margin-top: 8px;
        }
        
        .forgot-password a {
          color: #a8ee48;
          text-decoration: none;
          font-size: 14px;
          transition: color 0.3s ease;
        }
        
        .forgot-password a:hover {
          color: #c3f380;
        }
        
        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(4, 4, 4, 0.95);
          display: none;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          backdrop-filter: blur(10px);
        }
        
        .loading-content {
          text-align: center;
          color: #ffffff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
        }
        
        .loading-spinner {
          width: 60px;
          height: 60px;
          border: 4px solid #3a3a3a;
          border-top: 4px solid #a8ee48;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .loading-text {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 10px;
        }
        
        .loading-subtext {
          font-size: 14px;
          color: #cccccc;
          opacity: 0.8;
        }
        
        .back-arrow {
          position: absolute;
          top: 20px;
          left: 20px;
          color: #a8ee48;
          text-decoration: none;
          font-size: 32px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 1000;
        }
        
        .back-arrow:hover {
          color: #c3f380;
          transform: translateX(-5px);
        }

        /* Mobile scaling safeguards */
        *, *::before, *::after { box-sizing: border-box; }
        html, body { overflow-x: hidden; }
        img, video { max-width: 100%; height: auto; }
        
        @media (max-width: 768px) {
          .auth-header h1 { font-size: 24px; }
          .auth-header p { font-size: 14px; }
          .form-group input, .btn-google { font-size: 15px; padding: 14px; }
        }
        
        @media (max-width: 480px) {
          .auth-card {
            margin: 10px;
            border-radius: 15px;
          }
          
          .auth-header {
            padding: 25px 20px;
          }
          
          .auth-body {
            padding: 30px 20px;
          }
          
          .back-arrow {
            top: 15px;
            left: 15px;
            font-size: 28px;
          }
        }
      `}</style>

      <div className="auth-container">
        <div className="back-arrow" onClick={handleBackClick}>←</div>
        
        <div className="auth-card">
        
        {/* Loading Overlay */}
        {loading && (
          <div className="loading-overlay" style={{display: 'flex'}}>
            <div className="loading-content">
              <div className="loading-spinner"></div>
              <div className="loading-text">
                {isSignup ? 'Creating your account...' : 'Signing you in...'}
              </div>
              <div className="loading-subtext">Please wait while we prepare your experience</div>
            </div>
          </div>
        )}

          {/* Login Form */}
          {!isSignup && (
            <div className="form-container">
              <div className="auth-header">
                <h1>Welcome Back</h1>
                <p>Sign in to continue your conversation</p>
              </div>
              
              <div className="auth-body">
                <form onSubmit={handleSubmit}>
                  {errors.general && (
                    <div className="error-message" style={{display: 'block', marginBottom: '20px', textAlign: 'center', background: '#2a2a2a', padding: '15px', borderRadius: '8px', border: '1px solid #e74c3c'}}>
                      {errors.general}
                    </div>
                  )}
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input 
                      type="email" 
                      name="email" 
                      value={formData.email}
                      onChange={handleInputChange}
                      className={errors.email ? 'error' : ''}
                      required
                    />
                    {errors.email && <div className="error-message" style={{display: 'block'}}>{errors.email}</div>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <div className="password-input-container">
                      <input 
                        type={showPassword ? "text" : "password"}
                        name="password" 
                        value={formData.password}
                        onChange={handleInputChange}
                        className={errors.password ? 'error' : ''}
                        required
                      />
                      <button 
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        <span className="material-icons">
                          {showPassword ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                    {errors.password && <div className="error-message" style={{display: 'block'}}>{errors.password}</div>}
                    <div className="forgot-password">
                      <a href="#" onClick={(e) => { e.preventDefault(); setShowResetPassword(true); }}>
                        Forgot your password?
                      </a>
                    </div>
                  </div>
                  
                  <button type="submit" className="button is-secondary">Sign In</button>
                  
                  <div className="divider">
                    <span>or</span>
                  </div>
                  
                  <button type="button" className="btn-google" onClick={handleGoogleSignIn}>
                    <div className="google-icon"></div>
                    Continue with Google
                  </button>
                  
                  <button type="button" className="btn-phone" onClick={() => setShowMobileAuth(true)}>
                    <div className="phone-icon"></div>
                    Sign in with Phone
                  </button>
                 
                  <div className="auth-footer">
                    <p>Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); setIsSignup(true); }}>Sign up</a></p>
                  </div>
                </form>
              </div>
            </div>
          )}
          
          {/* Signup Form */}
          {isSignup && (
            <div className="form-container">
              <div className="auth-header">
                <h1>Create Account</h1>
                <p>Join our community today</p>
              </div>
              
              <div className="auth-body">
                <form onSubmit={handleSubmit}>
                  {errors.general && (
                    <div className="error-message" style={{display: 'block', marginBottom: '20px', textAlign: 'center', background: '#2a2a2a', padding: '15px', borderRadius: '8px', border: '1px solid #e74c3c'}}>
                      {errors.general}
                    </div>
                  )}
                  <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input 
                      type="text" 
                      name="username" 
                      value={formData.username}
                      onChange={handleInputChange}
                      className={errors.username ? 'error' : ''}
                      required
                    />
                    {errors.username && <div className="error-message" style={{display: 'block'}}>{errors.username}</div>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input 
                      type="email" 
                      name="email" 
                      value={formData.email}
                      onChange={handleInputChange}
                      className={errors.email ? 'error' : ''}
                      required
                    />
                    {errors.email && <div className="error-message" style={{display: 'block'}}>{errors.email}</div>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <div className="password-input-container">
                      <input 
                        type={showPassword ? "text" : "password"}
                        name="password" 
                        value={formData.password}
                        onChange={handleInputChange}
                        className={errors.password ? 'error' : ''}
                        required
                      />
                      <button 
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        <span className="material-icons">
                          {showPassword ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                    {errors.password && <div className="error-message" style={{display: 'block'}}>{errors.password}</div>}
                    {formData.password && (
                      <div className="password-requirements">
                        <div className="password-strength-header">
                          <strong>Password must contain:</strong>
                          <span style={{fontWeight: 'bold', marginLeft: '10px', color: getPasswordStrength().color}}>
                            {getPasswordStrength().text}
                          </span>
                        </div>
                        <ul>
                          <li className={passwordRequirements.length ? 'valid' : 'invalid'}>At least 8 characters</li>
                          <li className={passwordRequirements.uppercase ? 'valid' : 'invalid'}>One uppercase letter</li>
                          <li className={passwordRequirements.lowercase ? 'valid' : 'invalid'}>One lowercase letter</li>
                          <li className={passwordRequirements.number ? 'valid' : 'invalid'}>One number</li>
                          <li className={passwordRequirements.special ? 'valid' : 'invalid'}>One special character</li>
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <div className="password-input-container">
                      <input 
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword" 
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={errors.confirmPassword ? 'error' : ''}
                        required
                      />
                      <button 
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                      >
                        <span className="material-icons">
                          {showConfirmPassword ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                    {errors.confirmPassword && <div className="error-message" style={{display: 'block'}}>{errors.confirmPassword}</div>}
                  </div>
                  
                  <button type="submit" className="button is-secondary">Create Account</button>
                  
                  <div className="divider">
                    <span>or</span>
                  </div>
                  
                  <button type="button" className="btn-google" onClick={handleGoogleSignIn}>
                    <div className="google-icon"></div>
                    Sign up with Google
                  </button>
                  
                  <button type="button" className="btn-phone" onClick={() => setShowMobileAuth(true)}>
                    <div className="phone-icon"></div>
                    Sign up with Phone
                  </button>
                  
                  <div className="auth-footer">
                    <p>Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); setIsSignup(false); }}>Sign in</a></p>
                  </div>
                </form>
              </div>
            </div>
          )}

        {/* Password Reset Modal */}
        {showResetPassword && (
          <div className="loading-overlay" style={{display: 'flex'}}>
            <div className="auth-card" style={{maxWidth: '400px'}}>
              <div className="auth-header">
                <h1>Reset Password</h1>
                <p>Enter your email to receive a reset link</p>
              </div>
              
              <div className="auth-body">
                <form onSubmit={handlePasswordReset}>
                  {errors.general && (
                    <div className="error-message" style={{display: 'block', marginBottom: '20px', textAlign: 'center', background: '#2a2a2a', padding: '15px', borderRadius: '8px', border: '1px solid #e74c3c'}}>
                      {errors.general}
                    </div>
                  )}
                  
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input 
                      type="email" 
                      name="email" 
                      value={formData.email}
                      onChange={handleInputChange}
                      className={errors.email ? 'error' : ''}
                      required
                      placeholder="Enter your email address"
                    />
                    {errors.email && <div className="error-message" style={{display: 'block'}}>{errors.email}</div>}
                  </div>
                  
                  <button type="submit" className="button is-secondary" disabled={loading}>
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                  
                  <button 
                    type="button" 
                    className="button is-secondary" 
                    style={{marginTop: '10px', background: '#3a3a3a'}}
                    onClick={() => {
                      setShowResetPassword(false);
                      setErrors({});
                    }}
                  >
                    Cancel
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Authentication Modal */}
        {showMobileAuth && (
          <div className="loading-overlay" style={{display: 'flex'}}>
            <div className="auth-card" style={{maxWidth: '500px'}}>
              <div className="auth-header">
                <h1>{isSignup ? 'Sign Up' : 'Sign In'} with Phone</h1>
                <p>Quick and secure authentication</p>
              </div>
              
              <div className="auth-body">
                <MobileAuth 
                  onSuccess={handleMobileAuthSuccess}
                  onCancel={handleMobileAuthCancel}
                />
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </>
  );
}
