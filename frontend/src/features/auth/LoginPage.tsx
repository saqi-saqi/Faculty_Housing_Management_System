import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Lock, Mail, Building, Sparkles } from 'lucide-react';
import api from '../../lib/api.js';
import { useAuthStore } from '../../lib/store.js';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', values);
      const { token, user, faculty } = response.data.data;

      login(token, user, faculty);
      toast.success(`Welcome back, ${faculty?.name || user.email}!`);

      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/portal/dashboard');
      }
    } catch (err: any) {
      const message = err.response?.data?.error?.message || 'Login failed. Please check your credentials.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const setDemoCredentials = (email: string, pass: string) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', pass, { shouldValidate: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-black text-2xl shadow-lg shadow-primary/25 mb-2">
            <Building className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Sign In to FHMS</h1>
          <p className="text-sm text-muted-foreground">
            Faculty Housing & Estate Management Portal
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                University Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  {...register('email')}
                  placeholder="name@university.edu"
                  disabled={isLoading}
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive mt-1 font-medium">{errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  {...register('password')}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50"
                />
              </div>
              {errors.password && (
                <p className="text-xs text-destructive mt-1 font-medium">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-primary text-primary-foreground font-semibold text-sm rounded-xl hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            New faculty member?{' '}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Activate your account
            </Link>
          </div>
        </div>

        {/* Dev-only Demo Credentials Pills (gated behind import.meta.env.DEV) */}
        {import.meta.env.DEV && (
          <div className="rounded-xl border border-dashed border-border bg-card/60 p-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Development Demo Accounts (Click to Fill):
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDemoCredentials('admin@example.com', 'admin1234')}
                className="p-2 text-left rounded-lg bg-background hover:bg-muted/70 border border-border transition-colors text-xs"
              >
                <div className="font-semibold text-foreground">Estate Admin</div>
                <div className="text-[10px] text-muted-foreground truncate">admin@example.com</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials('aris.thorne@fhms.edu', 'Password123!')}
                className="p-2 text-left rounded-lg bg-background hover:bg-muted/70 border border-border transition-colors text-xs"
              >
                <div className="font-semibold text-foreground">Faculty Resident</div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400">Has Quarters H-101</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials('robert.chen@fhms.edu', 'Password123!')}
                className="p-2 text-left rounded-lg bg-background hover:bg-muted/70 border border-border transition-colors text-xs"
              >
                <div className="font-semibold text-foreground">Faculty Applicant</div>
                <div className="text-[10px] text-amber-600 dark:text-amber-400">Queue Applicant #1</div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
