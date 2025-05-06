// @ts-nocheck
'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Import useRouter
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
import { useToast } from "@/hooks/use-toast" // Import useToast

// Simple inline SVG for HIBLLX logo (reuse)
const HibllxLogo = () => (
  <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-4 text-primary">
    <path d="M20 80 L50 20 L80 80 Z" stroke="currentColor" strokeWidth="10" fill="none"/>
    <path d="M35 60 H65" stroke="hsl(var(--accent))" strokeWidth="8"/>
  </svg>
);


export default function SignupPage() {
    const router = useRouter(); // Initialize router
    const { toast } = useToast(); // Initialize toast
    const [name, setName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    // TODO: Implement actual signup logic using Firebase Auth or similar
    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null); // Clear previous errors

        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        console.log('Attempting signup with:', { name, email }); // Avoid logging password

        try {
            // Simulate API call to your backend or Firebase Auth
            // Example: const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            // await updateProfile(userCredential.user, { displayName: name });
            // await sendEmailVerification(userCredential.user);

            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

            // **On successful signup:**
            // 1. Show a success toast
            toast({
                title: "Account Created!",
                description: "Please check your email to verify your account.",
            });
            // 2. Redirect to the verify-email page
            router.push('/verify-email');

            // In a real app, ensure loading=false is set appropriately even after redirect or if component unmounts

        } catch (err: any) {
            console.error('Signup failed:', err);
            // Map Firebase or backend errors to user-friendly messages
            let errorMessage = "Failed to create account. Please try again.";
            if (err.code === 'auth/email-already-in-use') {
                errorMessage = "This email address is already in use.";
            } else if (err.code === 'auth/invalid-email') {
                errorMessage = "Please enter a valid email address.";
            } else if (err.code === 'auth/weak-password') {
                errorMessage = "Password is too weak.";
            }
            setError(errorMessage);
            setLoading(false); // Ensure loading is set to false on error
        }
        // Removed the placeholder error and setLoading(false) from here as success redirects
    };

    return (
        <Card className="w-full max-w-sm shadow-lg">
          <CardHeader className="text-center">
            <HibllxLogo />
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <CardDescription>Join HIBLLX and start your AI-powered investment journey.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                    id="name"
                    type="text"
                    placeholder="Your Name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                 />
              </div>
               <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                 />
              </div>
              <div className="space-y-2">
                 <Label htmlFor="password">Password</Label>
                <Input
                    id="password"
                    type="password"
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                />
              </div>
              <div className="space-y-2">
                 <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                    id="confirm-password"
                    type="password"
                    required
                     autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                 {loading ? 'Creating Account...' : 'Sign Up'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="ml-1 text-primary hover:underline">
              Log in
            </Link>
          </CardFooter>
        </Card>
  );
}
