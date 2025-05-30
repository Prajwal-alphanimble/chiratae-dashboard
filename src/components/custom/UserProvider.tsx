'use client';

import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';

export default function UserProvider({ children }) {
  const { isLoaded, userId, isSignedIn } = useAuth();
  
  useEffect(() => {
    // Only run if auth is loaded and user is signed in
    if (isLoaded && isSignedIn && userId) {
      // Create or fetch user in our database
      const createUserInDb = async () => {
        try {
          const response = await fetch('/api/create-user', {
            headers: {
              'Content-Type': 'application/json',
            }
          });
          
          if (!response.ok) {
            console.error('Failed to sync user with database');
          }
        } catch (error) {
          console.error('Error syncing user with database:', error);
        }
      };
      
      createUserInDb();
    }
  }, [isLoaded, isSignedIn, userId]);
  
  return children;
}
