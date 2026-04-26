import { db } from '@/config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const SEED_DOCTORS = [
  {
    uid: 'seed-doctor-sharma',
    email: 'dr.sharma@femtrack.demo',
    name: 'Dr. Sarah Sharma',
    licenseNumber: 'MCI-2019-GYN-4821',
    licenseFileURL: 'https://res.cloudinary.com/dkuwxm3ax/image/upload/v1/demo/license-placeholder.png',
    specialization: 'Gynecologist',
    bio: 'Senior Gynecologist with 12+ years of experience in reproductive health, PCOD management, and hormonal therapy. Passionate about empowering women with knowledge about their bodies.',
    certificates: [],
    extraLicenses: [],
    profilePhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DrSharma&backgroundColor=0D9488',
    isVerified: true,
    createdAt: new Date().toISOString(),
    notificationCount: 0,
  },
  {
    uid: 'seed-doctor-patel',
    email: 'dr.patel@femtrack.demo',
    name: 'Dr. Ananya Patel',
    licenseNumber: 'MCI-2021-ENDO-7392',
    licenseFileURL: 'https://res.cloudinary.com/dkuwxm3ax/image/upload/v1/demo/license-placeholder.png',
    specialization: 'PCOD Specialist',
    bio: 'Endocrinologist specializing in PCOD/PCOS, insulin resistance, and fertility optimization. Believes in a holistic approach combining lifestyle changes with evidence-based medicine.',
    certificates: [],
    extraLicenses: [],
    profilePhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DrPatel&backgroundColor=C94B8A',
    isVerified: true,
    createdAt: new Date().toISOString(),
    notificationCount: 0,
  },
  {
    uid: 'seed-doctor-mehta',
    email: 'dr.mehta@femtrack.demo',
    name: 'Dr. Priya Mehta',
    licenseNumber: 'MCI-2018-FERT-1055',
    licenseFileURL: 'https://res.cloudinary.com/dkuwxm3ax/image/upload/v1/demo/license-placeholder.png',
    specialization: 'Fertility Specialist',
    bio: 'Fertility specialist with expertise in IVF, egg freezing, and natural conception support. Dedicated to helping couples and individuals on their journey to parenthood.',
    certificates: [],
    extraLicenses: [],
    profilePhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DrMehta&backgroundColor=B39DDB',
    isVerified: true,
    createdAt: new Date().toISOString(),
    notificationCount: 0,
  },
];

/**
 * Seeds 3 demo doctor profiles into Firestore if they don't already exist.
 * Call this once during app initialization.
 */
export async function seedDoctors(): Promise<void> {
  try {
    for (const doctor of SEED_DOCTORS) {
      const docRef = doc(db, 'doctors', doctor.uid);
      const existing = await getDoc(docRef);
      if (!existing.exists()) {
        await setDoc(docRef, doctor);
        console.log(`[Seed] Created doctor: ${doctor.name}`);
      }
    }
  } catch (err) {
    console.error('[Seed] Error seeding doctors:', err);
  }
}
