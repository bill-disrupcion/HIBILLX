
import React from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MailCheck } from 'lucide-react';

// Simple inline SVG for HIBLLX logo (reuse)
const HibllxLogo = () => (
  <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-4 text-primary">
    <path d="M20 80 L50 20 L80 80 Z" stroke="currentColor" strokeWidth="10" fill="none"/>
    <path d="M35 60 H65" stroke="hsl(var(--accent))" strokeWidth="8"/>
  </svg>
);

export default function VerifyEmailPage() {

    // TODO: Add functionality to resend verification email
    const handleResendEmail = async () => {
        console.log("Resending verification email...");
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        alert("Verification email resent (simulated).");
         // Use toast notification in real app
    };

  return (
    <Card className="w-full max-w-sm shadow-lg">
      <CardHeader className="text-center">
         <HibllxLogo />
        <MailCheck className="mx-auto h-12 w-12 text-green-500 mb-3" />
        <CardTitle className="text-2xl">Verify Your Email</CardTitle>
        <CardDescription>
          We've sent a verification link to your email address. Please check your inbox (and spam folder!) to activate your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
         <p className="text-sm text-muted-foreground">
            Didn't receive the email?
         </p>
         <Button variant="outline" size="sm" onClick={handleResendEmail} className="w-full">
           Resend Verification Email
         </Button>
      </CardContent>
      <CardFooter className="text-center text-sm">
        Already verified?{" "}
        <Link href="/login" className="ml-1 text-primary hover:underline">
          Log in here
        </Link>
      </CardFooter>
    </Card>
  );
}
