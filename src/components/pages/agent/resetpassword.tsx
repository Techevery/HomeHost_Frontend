import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "../../UI/Card";
import { Input } from "../../UI/Input";
import Button from "../../UI/Button";
import CardHeader from "../../UI/CardHeader";
import Label from "../../UI/Label";
import useAgentStore from '../../../stores/agentstore';
import { useSearchParams, useNavigate } from 'react-router-dom'; // Change useParams to useSearchParams

const ResetPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState('');
  const [step, setStep] = useState(1);
  
  const { forgotPassword, resetPassword, isLoading, error, clearError } = useAgentStore();
  const [successMessage, setSuccessMessage] = useState('');
  
  // Get token from query parameters
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  useEffect(() => {
    // If token is in query parameters, skip step 1
    const tokenFromUrl = searchParams.get('token');
    const emailFromUrl = searchParams.get('email');
    
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      setStep(2);
    }
    
    if (emailFromUrl) {
      setEmail(emailFromUrl);
    }
  }, [searchParams]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      clearError();
      setSuccessMessage('');
      await forgotPassword(email);
      setStep(2);
    } catch (error) {
      // Error is handled by the store
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (password !== confirmPassword) {
      clearError();
      return;
    }
    
    // Validate password strength
    if (password.length < 8) {
      clearError();
      return;
    }
    
    try {
      clearError();
      setSuccessMessage('');
      await resetPassword(token, password);
      setSuccessMessage('Password has been reset successfully! You can now log in with your new password.');
      
      // Redirect to login after successful reset
      setTimeout(() => {
        navigate('/agent-login');
      }, 3000);
      
    } catch (error) {
      // Error is handled by the store
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          {step === 1 ? 'Reset Your Password' : 'Create New Password'}
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {successMessage}
            </div>
          )}
          
          {step === 1 ? (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  placeholder="Enter your email address"
                  className="w-full"
                />
                <p className="text-sm text-gray-600 mt-1">
                  We'll send a reset token to your email.
                </p>
              </div>
              
              <Button 
                text={isLoading ? 'Sending...' : 'Send Reset Token'}
                type="submit" 
                disabled={isLoading || !email}
                className="w-full"
              />
            </form>
          ) : (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <Label htmlFor="token">Reset Token</Label>
                <Input
                  type="text"
                  id="token"
                  value={token}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setToken(e.target.value)}
                  required
                  disabled={isLoading || !!searchParams.get('token')} // Disable if token is from URL
                  placeholder="Enter the token from your email"
                  className="w-full"
                />
                {searchParams.get('token') && (
                  <p className="text-green-600 text-sm mt-1">Token loaded from URL</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="password">New Password</Label>
                <Input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  placeholder="Enter your new password (min. 8 characters)"
                  className="w-full"
                />
              </div>
              
              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  placeholder="Confirm your new password"
                  className="w-full"
                />
                {password && confirmPassword && password !== confirmPassword && (
                  <p className="text-red-600 text-sm mt-1">Passwords do not match</p>
                )}
              </div>
              
              <Button 
                text={isLoading ? 'Resetting...' : 'Reset Password'}
                type="submit" 
                disabled={isLoading || !token || !password || !confirmPassword || password !== confirmPassword}
                className="w-full"
              />
              
              <div className="text-center text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    clearError();
                    setSuccessMessage('');
                    setToken('');
                    setPassword('');
                    setConfirmPassword('');
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Back to email entry
                </button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;