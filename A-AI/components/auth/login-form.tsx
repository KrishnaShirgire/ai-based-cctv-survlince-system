"use client"

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/components/providers/auth-provider';
import { Loader2, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [systemName, setSystemName] = useState('SecureView AI');
  const { login } = useAuth();
  const { toast } = useToast();

  // Load system name from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedSettings = localStorage.getItem('generalSettings');
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          if (settings.systemName) {
            setSystemName(settings.systemName);
          }
        }
      } catch (error) {
        console.error('Error loading system name:', error);
      }
    }
  }, []);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      await login(values.username, values.password);
      toast({
        title: "Login successful",
        description: `Welcome back to ${systemName}`,
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg border-border/40">
      <CardHeader className="space-y-1 text-center">
        <div className="flex items-center justify-center">
          <Shield className="h-10 w-10 text-primary mb-2" />
        </div>
        <CardTitle className="text-2xl font-semibold">{systemName}</CardTitle>
        <CardDescription>CCTV Monitoring Dashboard</CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          className="w-full" 
          disabled={isLoading}
          onClick={() => onSubmit({ username: 'admin', password: 'dummy' })}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Logging in...
            </>
          ) : (
            "Enter Dashboard (Dummy Login)"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}