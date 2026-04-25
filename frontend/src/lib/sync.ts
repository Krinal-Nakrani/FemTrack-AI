import { doc, setDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db as firestore } from '@/config/firebase';
import femtrackDB from './db';
import { encryptObject } from './encryption';

export async function syncToFirestore(userId: string) {
  try {
    // Sync unsynced logs
    const unsyncedLogs = await femtrackDB.logs
      .where('userId').equals(userId)
      .and((l) => !l.synced)
      .toArray();
    
    for (const log of unsyncedLogs) {
      const encrypted = encryptObject(log);
      await setDoc(
        doc(firestore, `users/${userId}/logs/${log.date}`),
        { data: encrypted, updatedAt: log.updatedAt }
      );
      await femtrackDB.logs.update(log.id!, { synced: true });
    }
    
    // Sync unsynced cycles
    const unsyncedCycles = await femtrackDB.cycles
      .where('userId').equals(userId)
      .and((c) => !c.synced)
      .toArray();
    
    for (const cycle of unsyncedCycles) {
      const encrypted = encryptObject(cycle);
      await setDoc(
        doc(firestore, `users/${userId}/cycles/${cycle.cycleId}`),
        { data: encrypted }
      );
      await femtrackDB.cycles.update(cycle.id!, { synced: true });
    }
    
    // Sync profile
    const profile = await femtrackDB.profiles
      .where('odataId').equals(userId)
      .and((p) => !p.synced)
      .first();
    
    if (profile) {
      const encrypted = encryptObject(profile);
      await setDoc(
        doc(firestore, `users/${userId}/profile/main`),
        { data: encrypted }
      );
      await femtrackDB.profiles.update(profile.id!, { synced: true });
    }
    
    console.log('Sync to Firestore complete');
  } catch (error) {
    console.error('Sync error:', error);
  }
}

export function setupAutoSync(userId: string) {
  // Sync when coming back online
  window.addEventListener('online', () => {
    console.log('Back online — syncing data...');
    syncToFirestore(userId);
  });
  
  // Periodic sync every 5 minutes
  setInterval(() => {
    if (navigator.onLine) {
      syncToFirestore(userId);
    }
  }, 5 * 60 * 1000);
}
