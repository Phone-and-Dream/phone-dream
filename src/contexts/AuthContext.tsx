import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  roles: AppRole[];
  rolesLoaded: boolean;
  isAdmin: boolean;
  isDonor: boolean;
  isRecipient: boolean;
  signUp: (email: string, password: string, fullName: string, role: 'donor' | 'recipient') => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [rolesLoaded, setRolesLoaded] = useState(false);

  const fetchRoles = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching roles:', error);
      setRolesLoaded(true);
      return [];
    }
    
    setRolesLoaded(true);
    return data.map(r => r.role);
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Use setTimeout to avoid potential race conditions with profile creation trigger
        setTimeout(async () => {
          const userRoles = await fetchRoles(session.user.id);
          setRoles(userRoles);
        }, 0);
      } else {
        setRoles([]);
        setRolesLoaded(true);
      }
      
      setIsLoading(false);
    });

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const userRoles = await fetchRoles(session.user.id);
        setRoles(userRoles);
      }
      
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string, role: 'donor' | 'recipient') => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Update the profile with full name
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ full_name: fullName })
          .eq('id', data.user.id);
        
        if (profileError) console.error('Profile update error:', profileError);

        // Insert user role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({ user_id: data.user.id, role });
        
        if (roleError) console.error('Role insert error:', roleError);

        // Create role-specific profile
        if (role === 'donor') {
          const { error: donorError } = await supabase
            .from('donor_profiles')
            .insert({ user_id: data.user.id });
          if (donorError) console.error('Donor profile error:', donorError);
        } else {
          const { error: recipientError } = await supabase
            .from('recipient_profiles')
            .insert({ user_id: data.user.id });
          if (recipientError) console.error('Recipient profile error:', recipientError);
        }

        // CRITICAL: Manually update local role state BEFORE returning
        // This prevents the race condition where navigation happens before roles are loaded
        setRoles([role]);
        setRolesLoaded(true);
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Immediately fetch and set roles to prevent race condition
      // This ensures rolesLoaded is true before the function returns
      if (data.user) {
        const userRoles = await fetchRoles(data.user.id);
        setRoles(userRoles);
        setRolesLoaded(true);
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRoles([]);
    setRolesLoaded(false);
  };

  const isAdmin = roles.includes('admin');
  const isDonor = roles.includes('donor');
  const isRecipient = roles.includes('recipient');

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isLoading,
      roles,
      rolesLoaded,
      isAdmin,
      isDonor,
      isRecipient,
      signUp,
      signIn,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
