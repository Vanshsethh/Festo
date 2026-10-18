import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import { ShieldAlert } from 'lucide-react';
import { Button } from '../ui/button.jsx';
import { Link } from 'react-router-dom';

export const RoleGuard = ({ allowedRoles = [], children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user?.role)) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-2xl border border-destructive/30 bg-destructive/5 text-center space-y-4 shadow-xl">
        <div className="w-12 h-12 mx-auto rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Access Restricted</h2>
        <p className="text-sm text-muted-foreground">
          You don't have the required role permissions to view this section.
        </p>
        <div className="pt-2">
          <Button asChild variant="outline">
            <Link to="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return children;
};
