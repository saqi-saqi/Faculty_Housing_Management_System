import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Wrench, ArrowLeft, Send, AlertTriangle } from 'lucide-react';
import api from '../../lib/api.js';
import { PageHeader } from '../../components/shared/PageHeader.js';
import { CardSkeleton } from '../../components/shared/LoadingSkeleton.js';
import { MaintenanceCategory } from '../../types/index.js';

const requestSchema = z.object({
  categoryId: z.coerce.number().int().positive('Please select a maintenance category'),
  problem: z.string().min(1, 'Problem summary is required'),
  description: z.string().min(10, 'Please provide a clear description of the issue (at least 10 characters)'),
  priority: z.enum(['low', 'medium', 'high', 'emergency'])
});

type RequestFormValues = z.infer<typeof requestSchema>;

export function NewMaintenanceRequestPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<MaintenanceCategory[]>({
    queryKey: ['maintenance', 'categories'],
    queryFn: async () => {
      const res = await api.get('/maintenance/categories');
      return res.data.data;
    }
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      categoryId: 1,
      problem: '',
      description: '',
      priority: 'medium'
    }
  });

  const selectedCategoryId = watch('categoryId');

  // Update default problem name and priority when category changes
  useEffect(() => {
    if (categories.length > 0 && selectedCategoryId) {
      const cat = categories.find((c) => c.id === Number(selectedCategoryId));
      if (cat) {
        setValue('problem', cat.name);
        setValue('priority', cat.default_priority);
      }
    }
  }, [selectedCategoryId, categories, setValue]);

  const submitMutation = useMutation({
    mutationFn: async (data: RequestFormValues) => {
      await api.post('/maintenance', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal', 'my-maintenance'] });
      toast.success('Maintenance ticket submitted successfully!');
      navigate('/portal/maintenance');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to submit maintenance ticket.');
    }
  });

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Link
        to="/portal/maintenance"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Maintenance Tickets
      </Link>

      <PageHeader
        title="File a Maintenance Ticket"
        description="Report a repair or service issue in your university quarters. Work orders are triaged by the Estate Office."
      />

      <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm">
        {categoriesLoading ? (
          <CardSkeleton />
        ) : (
          <form onSubmit={handleSubmit((data) => submitMutation.mutate(data))} className="space-y-5">
            {/* Category Dropdown */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Issue Category
              </label>
              <select
                {...register('categoryId')}
                className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.default_priority} priority)
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-xs text-destructive mt-1 font-medium">{errors.categoryId.message}</p>
              )}
            </div>

            {/* Problem Title */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Specific Problem Title
              </label>
              <input
                type="text"
                {...register('problem')}
                placeholder="e.g. Master bathroom tap dripping heavily"
                className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {errors.problem && (
                <p className="text-xs text-destructive mt-1 font-medium">{errors.problem.message}</p>
              )}
            </div>

            {/* Priority Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Urgency / Priority Level
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['low', 'medium', 'high', 'emergency'] as const).map((level) => (
                  <label
                    key={level}
                    className={`flex items-center justify-center p-2.5 rounded-xl border text-xs font-semibold capitalize cursor-pointer transition-all ${watch('priority') === level ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'bg-background border-border text-foreground hover:bg-muted'}`}
                  >
                    <input
                      type="radio"
                      value={level}
                      {...register('priority')}
                      className="sr-only"
                    />
                    {level}
                  </label>
                ))}
              </div>
            </div>

            {/* Detailed Description */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Detailed Description & Location in Quarters
              </label>
              <textarea
                {...register('description')}
                rows={4}
                placeholder="Please describe what is happening, where in the house the problem is located, and any convenient times for technicians to visit."
                className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {errors.description && (
                <p className="text-xs text-destructive mt-1 font-medium">{errors.description.message}</p>
              )}
            </div>

            {/* Emergency Notice */}
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>
                For gas leaks, dangerous electrical sparking, or severe pipe bursts requiring immediate emergency shutdown, please also phone the Estate Emergency Desk at <span className="font-bold">+1-555-0199</span>.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => navigate('/portal/maintenance')}
                className="px-4 py-2.5 text-xs font-semibold rounded-xl border border-border hover:bg-muted text-foreground"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || submitMutation.isPending}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {submitMutation.isPending ? 'Filing Work Order...' : 'Submit Maintenance Ticket'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
