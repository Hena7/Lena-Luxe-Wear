// src/contexts/AuthContext.tsx
"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import type { User } from '@prisma/client'; // Use Prisma type

// Define the shape of the user object we expect after filtering sensitive data
// Exclude passwordHash and potentially other sensitive fields later
type CurrentUser = Omit<User, 'passwordHash'> | null;

interface AuthContextProps {
    currentUser: CurrentUser;
    setCurrentUser: (user: CurrentUser) => void; // Allow manual setting if needed
    isLoading: boolean; // Indicate if auth status is being checked
    refetchUser: () => void; // Function to manually trigger re-fetching user
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<CurrentUser>(null);
    const [isLoading, setIsLoading] = useState(true); // Start loading initially

    const fetchCurrentUser = async () => {
        console.log("Attempting to fetch current user...");
        setIsLoading(true); // Set loading before fetch
        try {
            const response = await fetch('/api/auth/me');

            if (response.status === 401) {
                 // Unauthorized, likely no valid token
                console.log("Auth fetch: Unauthorized (401)");
                setCurrentUser(null);
            } else if (response.ok) {
                const data = await response.json();
                console.log("Auth fetch: Success, user data:", data.user);
                setCurrentUser(data.user as CurrentUser); // Set user state
            } else {
                // Handle other potential errors (e.g., 500)
                console.error("Auth fetch: HTTP error!", response.status);
                const errorData = await response.json().catch(() => ({})); // Try getting error message
                console.error("Error data:", errorData);
                setCurrentUser(null); // Assume logged out on error
            }
        } catch (error) {
            console.error('Auth fetch: Failed to fetch user status', error);
            setCurrentUser(null); // Assume logged out on network error etc.
        } finally {
            setIsLoading(false); // Always stop loading
            console.log("Auth fetch: Loading finished.");
        }
    };

    // Fetch user on initial mount
    useEffect(() => {
        fetchCurrentUser();
    }, []);

    // Provide a function to manually refetch (e.g., after login/logout actions)
    const refetchUser = () => {
        fetchCurrentUser();
    };

    return (
        <AuthContext.Provider value={{ currentUser, setCurrentUser, isLoading, refetchUser }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use the AuthContext
export const useAuth = (): AuthContextProps => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};