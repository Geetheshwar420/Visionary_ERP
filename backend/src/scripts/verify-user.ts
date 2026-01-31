import 'dotenv/config';
import admin, { collections } from '../config/firebase';

async function verifyUser() {
    console.log('🔍 Verifying user in Firestore...');
    try {
        const email = 'sara@vision.com';
        const snapshot = await collections.users.where('email', '==', email).get();

        if (snapshot.empty) {
            console.log('❌ User NOT found:', email);
        } else {
            const user = snapshot.docs[0].data();
            console.log('✅ User found:', email);
            console.log('   ID:', user.id);
            console.log('   Name:', user.name);
            console.log('   Password Hash exists:', !!user.password);
        }
        process.exit(0);
    } catch (error) {
        console.error('❌ Verification failed:', error);
        process.exit(1);
    }
}

verifyUser();
