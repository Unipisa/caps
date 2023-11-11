'use client'

import { useState, createContext, useContext  } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'

const queryClient = new QueryClient()

export default function Provider({children}:{
    children: React.ReactNode
}) {
    return <QueryClientProvider client={queryClient}>
        <UserProfileProvider value={userProfile}>
            {children}
        </UserProfileProvider>
    </QueryClientProvider>
}

export type UserProfile = {
    _id: string,
    username: string,
    name: string,
    admin: boolean,
} 

const userProfile: UserProfile|null = {
    _id: '123',
    username: "mario.rossi",
    name: "Mario Rossi",
    admin: true,
}

const UserProfileContext = createContext<UserProfile|null|undefined>(undefined)
export const UserProfileProvider = UserProfileContext.Provider
  
export function useUserProfile(): UserProfile|null {
    const userProfile = useContext(UserProfileContext)
    if (userProfile === undefined) throw new Error("useUserProfile must be used inside UserProfileProvider")
    return userProfile
}

export function f() {}

export function UserProvider() {
    
}

