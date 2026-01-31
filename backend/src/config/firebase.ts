import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

// Check if Firebase is already initialized
if (!admin.apps.length) {
  try {
    if (!firebaseConfig.projectId) {
      console.error('❌ FIREBASE_PROJECT_ID is missing from environment variables');
    }
    admin.initializeApp({
      credential: admin.credential.cert(firebaseConfig as admin.ServiceAccount),
    });
    console.log('✅ Firebase Admin SDK initialized successfully for project:', firebaseConfig.projectId);
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    // Continue without Firebase for development
    console.log('⚠️  Running in demo mode without Firebase');
  }
}

// Export Firestore database instance
export const db = admin.firestore();
export const auth = admin.auth();
export const FieldValue = admin.firestore.FieldValue;
export const Timestamp = admin.firestore.Timestamp;

// Collection references
export const collections = {
  users: db.collection('users'),
  products: db.collection('products'),
  transactions: db.collection('transactions'),
  insights: db.collection('insights'),
  spoilageRisks: db.collection('spoilageRisks'),
  chatHistory: db.collection('chatHistory'),
};

export default admin;
