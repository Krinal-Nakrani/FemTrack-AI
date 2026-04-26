import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/config/firebase';
import { doc, getDoc } from 'firebase/firestore';

export type UserType = 'doctor' | 'patient' | null;

/**
 * Custom hook to determine if the current user is a doctor or patient.
 * Checks if the user's Firebase Auth UID exists in the /doctors/ collection.
 * Returns null while loading.
 */
export function useUserType(): { userType: UserType; loading: boolean } {
  const { user } = useAuth();
  const [userType, setUserType] = useState<UserType>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setUserType(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function check() {
      try {
        const doctorDoc = await getDoc(doc(db, 'doctors', user!.uid));
        if (!cancelled) {
          setUserType(doctorDoc.exists() ? 'doctor' : 'patient');
        }
      } catch (err) {
        console.error('Error checking user type:', err);
        if (!cancelled) setUserType('patient');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    check();
    return () => { cancelled = true; };
  }, [user]);

  return { userType, loading };
}
