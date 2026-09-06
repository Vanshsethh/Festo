import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight, CheckCircle2, Mail } from 'lucide-react';
import { authService } from '../../services/auth.service.js';
import { Button } from '../../components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Label } from '../../components/ui/label.jsx';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);
    try {
      const response = await authService.forgotPassword(email);
      setSuccess(response.data?.message || 'If an account exists for that email, we have sent a password-reset link.');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to request a password reset. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center px-4 py-8"><Card className="w-full max-w-md border-purple-500/20"><CardHeader><CardTitle>Reset your password</CardTitle><CardDescription>Enter your account email and we’ll send a reset link.</CardDescription></CardHeader><form onSubmit={handleSubmit}><CardContent className="space-y-4">{error && <p className="flex gap-2 text-sm text-destructive"><AlertCircle className="w-4 h-4 shrink-0" />{error}</p>}{success && <p className="flex gap-2 text-sm text-emerald-400"><CheckCircle2 className="w-4 h-4 shrink-0" />{success}</p>}<div className="space-y-2"><Label htmlFor="email">Email address</Label><div className="relative"><Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input id="email" type="email" className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus /></div></div></CardContent><CardFooter className="flex flex-col gap-4"><Button type="submit" disabled={isSubmitting} className="w-full gap-2">{isSubmitting ? 'Sending…' : <>Send reset link <ArrowRight className="w-4 h-4" /></>}</Button><Link to="/login" className="text-xs font-semibold text-purple-400 hover:text-purple-300 underline underline-offset-4">Back to sign in</Link></CardFooter></form></Card></div>;
};
