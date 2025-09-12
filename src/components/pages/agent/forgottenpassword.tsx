import React, { useState } from 'react';
import { Card, CardContent } from "../../UI/Card";
import { Input } from "../../UI/Input";
import { Button } from "../../UI/Bottons";
import CardHeader from "../../UI/CardHeader";
import Label from "../../UI/Label";
import useAgentStore from '../../../stores/agentstore';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [step, setStep] = useState(1);
  
  const { forgotPassword, resetPassword, isLoading, error, clearError } = useAgentStore();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      clearError();
      await forgotPassword(email);
      setStep(2);
    } catch (error) {
      console.error('Error sending reset email:', error);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      clearError();
      await resetPassword(token, password);
      alert('Password has been reset successfully!');
      setStep(1);
      setEmail('');
      setToken('');
      setPassword('');
    } catch (error) {
      console.error('Error resetting password:', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>{step === 1 ? 'Forgot Password' : 'Reset Password'}</CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          {step === 1 ? (
            <form onSubmit={handleEmailSubmit}>
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handlePasswordReset}>
              <Label htmlFor="token">Reset Token</Label>
              <Input
                type="text"
                id="token"
                value={token}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setToken(e.target.value)}
                required
                disabled={isLoading}
                placeholder="Enter the token sent to your email"
              />
              <Label htmlFor="password">New Password</Label>
              <Input
                type="password"
                id="password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                placeholder="Enter your new password"
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;