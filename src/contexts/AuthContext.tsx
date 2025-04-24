// src/contexts/AuthContext.tsx
"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import type { User, Role } from '@prisma/client'; // Import Role type

// Define the shape of the user object stored in context state
// Make sure it includes all fields returned by the /api/auth/me endpoint's select clause
type CurrentUser = Pick<User, 'id' | 'email' | 'name' | 'phoneNumber' | 'role' | 'createdAt'> | null;

interface AuthContextProps {
    currentUser: CurrentUser;
    setCurrentUser: (user: CurrentUser) => void; // Allow manual override if needed (e.g., optimistic updates)
    isLoading: boolean; // Indicate if the initial auth check is happening
    refetchUser: () => Promise<void>; // Make refetch async if needed
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<CurrentUser>(null);
    const [isLoading, setIsLoading] = useState(true); // Start loading initially

    // Use useCallback to memoize the fetch function
    const fetchCurrentUser = useCallback(async () => {
        console.log("AuthContext: Attempting to fetch current user...");
        // Don't reset state here, only on explicit logout or error
        setIsLoading(true); // Ensure loading is true at the start of fetch

        try {
            const response = await fetch('/api/auth/me'); // Fetch from the /me endpoint

            if (response.status === 401) {
                 // Unauthorized (no token, invalid token, expired token, user not found)
                console.log("AuthContext fetch: Unauthorized (401) - User logged out.");
                setCurrentUser(null); // Clear user state
            } else if (response.ok) {
                const data = await response.json();
                console.log("AuthContext: Raw user data from /api/auth/me:", data.user); // Log raw data

                // Validate the expected structure, especially the role
                if (data.user && typeof data.user.id === 'string' && typeof data.user.role === 'string') {
                     setCurrentUser(data.user as CurrentUser); // Set user state
                     console.log("AuthContext: Set currentUser state:", data.user);
                } else {
                     console.error("AuthContext: Fetched user data is missing required fields (id, role)!", data.user);
                     setCurrentUser(null); // Treat incomplete data as logged out
                }
            } else {
                // Handle other non-401 errors (e.g., 500)
                const errorText = await response.text(); // Get error text if not JSON
                console.error(`AuthContext fetch: HTTP error! Status: ${response.status}`, errorText);
                setCurrentUser(null); // Assume logged out on server error
            }
        } catch (error) {
            console.error('AuthContext fetch: Network or other error', error);
            setCurrentUser(null); // Assume logged out on network error etc.
        } finally {
            setIsLoading(false); // Always stop loading
            console.log("AuthContext fetch: Loading finished.");
        }
    }, []); // Empty dependency array - fetchCurrentUser function itself doesn't change

    // Fetch user on initial mount
    useEffect(() => {
        fetchCurrentUser();
    }, [fetchCurrentUser]); // Depend on the memoized fetch function

    // Provide refetchUser which just calls the memoized fetchCurrentUser
    const refetchUser = useCallback(async () => {
       await fetchCurrentUser();
    }, [fetchCurrentUser]);

    return (
        // Provide the state and the refetch function to children
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