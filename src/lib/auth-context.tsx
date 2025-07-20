/**
 * Community Authentication Context for Empathy Ledger
 * 
 * Philosophy: Authentication should feel like joining a trusted community,
 * not accessing a corporate service. Every interaction should respect
 * community protocols and individual sovereignty.
 */

'use client';

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from './supabase'

interface CommunityMember extends User {
  // Extended user data for community features
  community_affiliation?: string
  cultural_protocols?: any
  storyteller_profile?: any
}

interface AuthContextType {
  user: CommunityMember | null
  loading: boolean
  // Community-centered authentication methods
  joinCommunityWithEmail: (email: string, password: string) => Promise<void>
  joinCommunityWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  // Community profile management
  updateCommunityProfile: (data: any) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CommunityMember | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Initialize community member session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        // Enhance user with community data
        const enhancedUser = await enrichUserWithCommunityData(session.user)
        setUser(enhancedUser)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    // Listen for community membership changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const enhancedUser = await enrichUserWithCommunityData(session.user)
        setUser(enhancedUser)
      } else {
        setUser(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Enhance user with community-specific data
  const enrichUserWithCommunityData = async (authUser: User): Promise<CommunityMember> => {
    try {
      // Check if user profile exists in our users table
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create one
        const { data: newProfile, error: insertError } = await supabase
          .from('users')
          .insert({
            id: authUser.id,
            email: authUser.email!,
            full_name: authUser.user_metadata?.full_name || null,
            role: 'storyteller'
          })
          .select()
          .single()
        
        if (insertError) {
          console.error('Failed to create user profile:', insertError)
          return authUser as CommunityMember
        }
        
        return {
          ...authUser,
          community_affiliation: newProfile?.community_affiliation,
          cultural_protocols: newProfile?.cultural_protocols,
          storyteller_profile: newProfile
        }
      }

      return {
        ...authUser,
        community_affiliation: profile?.community_affiliation,
        cultural_protocols: profile?.cultural_protocols,
        storyteller_profile: profile
      }
    } catch (error) {
      console.error('Error enriching user data:', error)
      return authUser as CommunityMember
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    
    // Community-centered registration
    joinCommunityWithEmail: async (email: string, password: string) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            joined_community_at: new Date().toISOString(),
            platform: 'empathy-ledger'
          }
        }
      })
      if (error) throw error
    },

    joinCommunityWithGoogle: async () => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })
      if (error) throw error
    },

    // Community-centered sign in
    signInWithEmail: async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) throw error
    },

    signInWithGoogle: async () => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })
      if (error) throw error
    },

    signOut: async () => {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    },

    resetPassword: async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      if (error) throw error
    },

    updateCommunityProfile: async (data: any) => {
      if (!user) throw new Error('Must be signed in to update profile')
      
      const { error } = await supabase
        .from('users')
        .update(data)
        .eq('id', user.id)
      
      if (error) throw error
      
      // Refresh user data
      const enhancedUser = await enrichUserWithCommunityData(user)
      setUser(enhancedUser)
    }
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider - this means the component is not wrapped in the community authentication context')
  }
  return context
}

// Helper hook for community-specific features
export function useCommunityMember() {
  const { user } = useAuth()
  
  return {
    isSignedIn: !!user,
    isCommunityMember: !!user?.community_affiliation,
    hasCompletedProfile: !!(
      user?.storyteller_profile?.full_name && 
      user?.storyteller_profile?.community_affiliation
    ),
    needsProfileSetup: !!(
      user && 
      (!user?.storyteller_profile?.full_name || !user?.storyteller_profile?.community_affiliation)
    ),
    communityAffiliation: user?.community_affiliation,
    culturalProtocols: user?.cultural_protocols,
    fullName: user?.storyteller_profile?.full_name || user?.user_metadata?.full_name,
    preferredPronouns: user?.storyteller_profile?.preferred_pronouns,
    role: user?.storyteller_profile?.role || 'storyteller',
    bio: user?.storyteller_profile?.bio,
    languagesSpoken: user?.storyteller_profile?.languages_spoken || []
  }
}
