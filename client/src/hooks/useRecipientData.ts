import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/integrations/supabase/types';

// Skills
export function useSkills(recipientId?: string) {
  return useQuery({
    queryKey: ['skills', recipientId],
    queryFn: async () => {
      if (!recipientId) return [];
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .eq('recipient_id', recipientId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!recipientId,
  });
}

export function useMySkills() {
  const { user } = useAuth();
  return useSkills(user?.id);
}

export function useCreateSkill() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (skill: Database['public']['Tables']['skills']['Insert']) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('skills')
        .insert({ ...skill, recipient_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills', user?.id] });
    },
  });
}

export function useUpdateSkill() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...skill }: { id: string } & Partial<Database['public']['Tables']['skills']['Update']>) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('skills')
        .update(skill)
        .eq('id', id)
        .eq('recipient_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills', user?.id] });
    },
  });
}

export function useDeleteSkill() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('skills')
        .delete()
        .eq('id', id)
        .eq('recipient_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills', user?.id] });
    },
  });
}

// Courses
export function useCourses(recipientId?: string) {
  return useQuery({
    queryKey: ['courses', recipientId],
    queryFn: async () => {
      if (!recipientId) return [];
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('recipient_id', recipientId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!recipientId,
  });
}

export function useMyCourses() {
  const { user } = useAuth();
  return useCourses(user?.id);
}

export function useCreateCourse() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (course: Database['public']['Tables']['courses']['Insert']) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('courses')
        .insert({ ...course, recipient_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses', user?.id] });
    },
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...course }: { id: string } & Partial<Database['public']['Tables']['courses']['Update']>) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('courses')
        .update(course)
        .eq('id', id)
        .eq('recipient_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses', user?.id] });
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id)
        .eq('recipient_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses', user?.id] });
    },
  });
}

// Projects
export function useProjects(recipientId?: string) {
  return useQuery({
    queryKey: ['projects', recipientId],
    queryFn: async () => {
      if (!recipientId) return [];
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('recipient_id', recipientId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!recipientId,
  });
}

export function useMyProjects() {
  const { user } = useAuth();
  return useProjects(user?.id);
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (project: Database['public']['Tables']['projects']['Insert']) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('projects')
        .insert({ ...project, recipient_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', user?.id] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...project }: { id: string } & Partial<Database['public']['Tables']['projects']['Update']>) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('projects')
        .update(project)
        .eq('id', id)
        .eq('recipient_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', user?.id] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('recipient_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', user?.id] });
    },
  });
}

// Career Events
export function useCareerEvents(recipientId?: string) {
  return useQuery({
    queryKey: ['career_events', recipientId],
    queryFn: async () => {
      if (!recipientId) return [];
      const { data, error } = await supabase
        .from('career_events')
        .select('*')
        .eq('recipient_id', recipientId)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!recipientId,
  });
}

export function useMyCareerEvents() {
  const { user } = useAuth();
  return useCareerEvents(user?.id);
}

export function useCreateCareerEvent() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (event: Database['public']['Tables']['career_events']['Insert']) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('career_events')
        .insert({ ...event, recipient_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['career_events', user?.id] });
    },
  });
}

export function useUpdateCareerEvent() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...event }: { id: string } & Partial<Database['public']['Tables']['career_events']['Update']>) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('career_events')
        .update(event)
        .eq('id', id)
        .eq('recipient_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['career_events', user?.id] });
    },
  });
}

export function useDeleteCareerEvent() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('career_events')
        .delete()
        .eq('id', id)
        .eq('recipient_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['career_events', user?.id] });
    },
  });
}

// Recommendations
export function useRecommendations(recipientId?: string) {
  return useQuery({
    queryKey: ['recommendations', recipientId],
    queryFn: async () => {
      if (!recipientId) return [];
      const { data, error } = await supabase
        .from('recommendations')
        .select('*')
        .eq('recipient_id', recipientId)
        .eq('status', 'approved')
        .order('submitted_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!recipientId,
  });
}

export function useMyRecommendations() {
  const { user } = useAuth();
  return useRecommendations(user?.id);
}

// Journey Events
export function useJourneyEvents(recipientId?: string) {
  return useQuery({
    queryKey: ['journey_events', recipientId],
    queryFn: async () => {
      if (!recipientId) return [];
      const { data, error } = await supabase
        .from('journey_events')
        .select('*')
        .eq('recipient_id', recipientId)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!recipientId,
  });
}

export function useMyJourneyEvents() {
  const { user } = useAuth();
  return useJourneyEvents(user?.id);
}

export function useCreateJourneyEvent() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (event: Database['public']['Tables']['journey_events']['Insert']) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('journey_events')
        .insert({ ...event, recipient_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journey_events', user?.id] });
    },
  });
}

// XP Rules
export function useXPRules() {
  return useQuery({
    queryKey: ['xp_rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('xp_rules')
        .select('*')
        .order('action');
      
      if (error) throw error;
      return data;
    },
  });
}

// XP Transactions
export function useMyXPTransactions() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['xp_transactions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('xp_transactions')
        .select(`
          *,
          rule:xp_rules(*)
        `)
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
}

// Employment History
export function useEmploymentHistory(recipientId?: string) {
  return useQuery({
    queryKey: ['employment_history', recipientId],
    queryFn: async () => {
      if (!recipientId) return [];
      const { data, error } = await supabase
        .from('employment_history')
        .select('*')
        .eq('recipient_id', recipientId)
        .order('start_date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!recipientId,
  });
}

export function useMyEmploymentHistory() {
  const { user } = useAuth();
  return useEmploymentHistory(user?.id);
}

export function useCreateEmployment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (employment: { company_name: string; job_title: string; start_date: string; end_date?: string | null; is_current?: boolean; description?: string | null }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('employment_history')
        .insert({ ...employment, recipient_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employment_history', user?.id] });
    },
  });
}

export function useUpdateEmployment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...employment }: { id: string } & Partial<{ company_name: string; job_title: string; start_date: string; end_date?: string | null; is_current?: boolean; description?: string | null }>) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('employment_history')
        .update(employment)
        .eq('id', id)
        .eq('recipient_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employment_history', user?.id] });
    },
  });
}

export function useDeleteEmployment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('employment_history')
        .delete()
        .eq('id', id)
        .eq('recipient_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employment_history', user?.id] });
    },
  });
}

// Awards
export function useAwards(recipientId?: string) {
  return useQuery({
    queryKey: ['awards', recipientId],
    queryFn: async () => {
      if (!recipientId) return [];
      const { data, error } = await supabase
        .from('awards')
        .select('*')
        .eq('recipient_id', recipientId)
        .order('date_received', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!recipientId,
  });
}

export function useMyAwards() {
  const { user } = useAuth();
  return useAwards(user?.id);
}

export function useCreateAward() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (award: { title: string; issuer?: string | null; date_received?: string | null; description?: string | null; url?: string | null }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('awards')
        .insert({ ...award, recipient_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['awards', user?.id] });
    },
  });
}

export function useUpdateAward() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...award }: { id: string } & Partial<{ title: string; issuer?: string | null; date_received?: string | null; description?: string | null; url?: string | null }>) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('awards')
        .update(award)
        .eq('id', id)
        .eq('recipient_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['awards', user?.id] });
    },
  });
}

export function useDeleteAward() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('awards')
        .delete()
        .eq('id', id)
        .eq('recipient_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['awards', user?.id] });
    },
  });
}
