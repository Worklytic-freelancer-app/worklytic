import auth from '@react-native-firebase/auth';

// Inisialisasi Firebase Auth untuk React Native
// Ini akan otomatis menggunakan persistence yang tepat
export { auth };

// Fungsi helper untuk mendapatkan user saat ini
export const getCurrentUser = () => {
    return auth().currentUser;
};

// Fungsi untuk sign in dengan email dan password
export const signInWithEmailAndPassword = async (email: string, password: string) => {
    try {
        const userCredential = await auth().signInWithEmailAndPassword(email, password);
        return userCredential.user;
    } catch (error) {
        console.error('Error signing in:', error);
        throw error;
    }
};

// Fungsi untuk sign up dengan email dan password
export const createUserWithEmailAndPassword = async (email: string, password: string) => {
    try {
        const userCredential = await auth().createUserWithEmailAndPassword(email, password);
        return userCredential.user;
    } catch (error) {
        console.error('Error signing up:', error);
        throw error;
    }
};

// Fungsi untuk sign out
export const signOut = async () => {
    try {
        await auth().signOut();
    } catch (error) {
        console.error('Error signing out:', error);
        throw error;
    }
};

// Fungsi untuk mendengarkan perubahan state auth
export const onAuthStateChanged = (callback: (user: any) => void) => {
    return auth().onAuthStateChanged(callback);
};

// Fungsi untuk reset password
export const sendPasswordResetEmail = async (email: string) => {
    try {
        await auth().sendPasswordResetEmail(email);
    } catch (error) {
        console.error('Error sending password reset email:', error);
        throw error;
    }
};