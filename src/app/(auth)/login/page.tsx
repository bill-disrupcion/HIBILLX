'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Simple inline SVG for HIBLLX logo (replace with actual logo if available)
const HibllxLogo = () => (
  <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-4 text-primary">
    <path d="M20 80 L50 20 L80 80 Z" stroke="currentColor" strokeWidth="10" fill="none"/>
    <path d="M35 60 H65" stroke="hsl(var(--accent))" strokeWidth="8"/>
  </svg>
);


export default function LoginPage() {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    // TODO: Implement actual login logic (e.g., using Firebase Auth, NextAuth.js)
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        console.log('Logging in with:', { email, password });
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        // On success, redirect to dashboard (use next/navigation)
        // On failure: setError("Invalid credentials"); setLoading(false);
        setError("Login functionality not implemented yet."); // Placeholder
        setLoading(false);
    };

    return (
        <Card className="w-full max-w-sm shadow-lg">
          <CardHeader className="text-center">
             <HibllxLogo />
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>Log in to access your HIBLLX dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                 />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                   <Link href="#" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Logging in...' : 'Log In'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="text-center text-sm">
            Don't have an account?{" "}
            <Link href="/signup" className="ml-1 text-primary hover:underline">
              Sign up
            </Link>
          </CardFooter>
        </Card>
  );
}
