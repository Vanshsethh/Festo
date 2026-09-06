import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Lock } from 'lucide-react';
import { authService } from '../../services/auth.service.js';
import { Button } from '../../components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Label } from '../../components/ui/label.jsx';

export const ResetPasswordPage = () => {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!token) return setError('This password-reset link is invalid.');
    if (password !== confirmPassword) return setError('Passwords do not match.');
    setIsSubmitting(true);
    try {
      const response = await authService.resetPassword(token, password);
      setSuccess(response.data?.message || 'Password reset successfully. You can now sign in.');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to reset your password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center px-4 py-8"><Card className="w-full max-w-md border-purple-500/20"><CardHeader><CardTitle>Choose a new password</CardTitle><CardDescription>Your reset link expires after one hour.</CardDescription></CardHeader><form onSubmit={handleSubmit}><CardContent className="space-y-4">{error && <p className="flex gap-2 text-sm text-destructive"><AlertCircle className="w-4 h-4 shrink-0" />{error}</p>}{success && <p className="flex gap-2 text-sm text-emerald-400"><CheckCircle2 className="w-4 h-4 shrink-0" />{success}</p>}<div className="space-y-2"><Label htmlFor="password">New password</Label><div className="relative"><Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input id="password" type="password" minLength="8" className="pl-10" value={password} onChange={(e) => setPassword(e.target.value)} required /></div></div><div className="space-y-2"><Label htmlFor="confirm-password">Confirm new password</Label><Input id="confirm-password" type="password" minLength="8" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required /></div></CardContent><CardFooter className="flex flex-col gap-4"><Button type="submit" disabled={isSubmitting || Boolean(success)} className="w-full">{isSubmitting ? 'Saving…' : 'Save new password'}</Button><Link to="/login" className="text-xs font-semibold text-purple-400 hover:text-purple-300 underline underline-offset-4">Back to sign in</Link></CardFooter></form></Card></div>;
};
