import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

import { firebaseConfig } from './config';
import { FirebaseProvider, useFirebase, useFirebaseApp, useAuth, useFirestore } from './provider';
import { FirebaseClientProvider } from './client-provider';
import { useUser } from './auth/use-user';


// This function initializes Firebase and returns the app, auth, and firestore instances.
export const initializeFirebase = (): {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
} => {
  if (getApps().length) {
    const firebaseApp = getApp();
    const auth = getAuth(firebaseApp);
    const firestore = getFirestore(firebaseApp);
    return { firebaseApp, auth, firestore };
  }

  const firebaseApp = initializeApp(firebaseConfig);
  const auth = getAuth(firebaseApp);
  const firestore = getFirestore(firebaseApp);

  return { firebaseApp, auth, firestore };
};


export {
    FirebaseProvider,
    FirebaseClientProvider,
    useUser,
    useFirebase,
    useFirebaseApp,
    useAuth,
    useFirestore,
};
