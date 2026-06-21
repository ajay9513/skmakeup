import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput } from '@sk-makeup/shared';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { authApi } from '@/lib/api';
import { getErrorMessage } from '@/lib/axios';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/slices/authSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginInput) => authApi.login(data),
    onSuccess: ({ data }) => {
      dispatch(setCredentials({ accessToken: data.data.accessToken, user: data.data.user }));
      navigate('/');
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-charcoal p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/20">
            <Sparkles className="h-7 w-7 text-gold" />
          </div>
          <h1 className="font-serif text-3xl font-semibold text-ivory">SK Makeup Artist</h1>
          <p className="mt-2 text-sm text-ivory/50">Admin Studio — Sign in to continue</p>
        </div>

        <Card className="border-0 shadow-2xl">
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>Enter your credentials to access the dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit((d) => loginMutation.mutate(d))} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Email</label>
                <Input type="email" {...register('email')} placeholder="admin@skmakeup.com" />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Password</label>
                <Input type="password" {...register('password')} placeholder="••••••••••••" />
                {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
              </div>
              {loginMutation.isError && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{getErrorMessage(loginMutation.error)}</p>
              )}
              <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
