'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth, initiateEmailSignIn, initiateAnonymousSignIn } from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Auth } from 'firebase/auth';
import { UnauthenticatedAuthGuard } from '@/components/layout/auth-guard';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { AuthLayout } from '@/components/layout/auth-layout';

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, { message: 'Password is required' }),
});

export default function LoginPage() {
  const auth = useAuth() as Auth;
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isAnonymousLoading, setAnonymousLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await initiateEmailSignIn(auth, values.email, values.password);
      // AuthGuard will redirect after auth state updates
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description:
          error?.code === 'auth/wrong-password' || error?.code === 'auth/invalid-credential'
            ? 'Incorrect email or password.'
            : 'Something went wrong. Please try again.',
      });
      form.resetField('password');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAnonymousLogin() {
    setAnonymousLoading(true);
    try {
      await initiateAnonymousSignIn(auth);
      toast({
        title: 'Guest mode',
        description: 'You are signed in as a guest. Some features may be limited.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Anonymous Login Failed',
        description: error.message,
      });
    } finally {
      setAnonymousLoading(false);
    }
  }

  return (
    <UnauthenticatedAuthGuard>
      <AuthLayout
        title="Take control of your finances."
        description="Track spending, manage bills, and reach savings goals."
      >
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>Enter your email to continue.</CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" disabled={isLoading || isAnonymousLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" disabled={isLoading || isAnonymousLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isLoading || isAnonymousLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign in
                </Button>
              </form>
            </Form>
          </CardContent>

          <CardFooter className="flex-col gap-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleAnonymousLogin}
              disabled={isLoading || isAnonymousLoading}
            >
              {isAnonymousLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Continue as Guest
            </Button>

            <div className="text-sm text-center">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </AuthLayout>
    </UnauthenticatedAuthGuard>
  );
}