import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2, QrCode, ShieldX, Ticket } from 'lucide-react';
import { checkinsService } from '../../services/checkins.service.js';
import { Button } from '../../components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Input } from '../../components/ui/input.jsx';

const resultStyle = {
  VALID: { label: 'Check-in confirmed', icon: CheckCircle2, className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' },
  ALREADY_CHECKED_IN: { label: 'Already checked in', icon: AlertTriangle, className: 'border-amber-500/30 bg-amber-500/10 text-amber-300' },
  INVALID_TICKET: { label: 'Invalid ticket', icon: Ticket, className: 'border-destructive/30 bg-destructive/10 text-destructive' },
  UNAUTHORIZED: { label: 'Unauthorized for this event', icon: ShieldX, className: 'border-destructive/30 bg-destructive/10 text-destructive' },
};

export const CheckinScannerPage = () => {
  const [token, setToken] = React.useState('');
  const [result, setResult] = React.useState(null);
  const inputRef = React.useRef(null);
  const scan = useMutation({
    mutationFn: checkinsService.scan,
    onSuccess: (response) => {
      setResult(response.data);
      setToken('');
      inputRef.current?.focus();
    },
    onError: (error) => setResult({ status: 'INVALID_TICKET', message: error.response?.data?.message || 'The scan could not be processed.' }),
  });
  const onSubmit = (event) => {
    event.preventDefault();
    if (!token.trim() || scan.isPending) return;
    setResult(null);
    scan.mutate(token.trim());
  };
  const style = result && resultStyle[result.status] || resultStyle.INVALID_TICKET;
  const ResultIcon = style.icon;

  return <div className="max-w-3xl mx-auto py-8 space-y-6">
    <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400"><QrCode className="w-5 h-5" /></div><div><h1 className="text-2xl font-bold">Gate Ticket Scanner</h1><p className="text-sm text-muted-foreground">Scan a guest QR ticket or use a hardware scanner to validate entry.</p></div></div>
    <Card><CardHeader><CardTitle className="text-lg">Scan event ticket</CardTitle><CardDescription>Keep this field focused; most USB/Bluetooth scanners enter the token automatically.</CardDescription></CardHeader><CardContent><form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3"><Input ref={inputRef} autoFocus value={token} onChange={(event) => setToken(event.target.value)} placeholder="Scan or paste QR token" autoComplete="off" disabled={scan.isPending} /><Button type="submit" disabled={!token.trim() || scan.isPending} className="sm:w-32">{scan.isPending ? 'Checking…' : 'Check in'}</Button></form></CardContent></Card>
    {result && <Card className={style.className}><CardContent className="p-5 flex gap-4 items-start"><ResultIcon className="w-6 h-6 shrink-0 mt-0.5" /><div className="space-y-1"><p className="font-bold">{style.label}</p>{result.message && <p className="text-sm">{result.message}</p>}{result.attendee && <p className="text-sm">Guest: <span className="font-semibold">{result.attendee.name}</span></p>}{result.event && <p className="text-sm">Event: <span className="font-semibold">{result.event.title}</span></p>}{result.checked_in_at && <p className="text-xs opacity-80">Check-in time: {new Date(result.checked_in_at).toLocaleString()}</p>}</div></CardContent></Card>}
  </div>;
};