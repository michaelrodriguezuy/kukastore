
import { initializeApp } from "firebase/app";
import { signInWithEmailAndPassword, getAuth, signOut, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'

import { getFirestore } from 'firebase/firestore'

import { getStorage, ref, getDownloadURL, uploadBytesResumable } from 'firebase/storage'
import { v4 } from 'uuid'

const firebaseConfig = {
    apiKey: import.meta.env.VITE_APIKEY,
    authDomain: import.meta.env.VITE_AUTH,
    projectId: import.meta.env.VITE_PROJECTID,
    storageBucket: import.meta.env.VITE_STORAGE,
    messagingSenderId: import.meta.env.VITE_MESSAGING,
    appId: import.meta.env.VITE_APPID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app)
export const db = getFirestore(app)

const storage = getStorage(app)

//LOGIN
export const login = async ({ email, password }) => {
    try {
        let res = await signInWithEmailAndPassword(auth, email, password)
        return res
    } catch (error) {
        console.log(error)
    }
}

//LOGOUT
export const logout = () => {
    return new Promise((resolve, reject) => {
        try {
            signOut(auth).then(() => {
                resolve();
            }).catch((error) => {
                reject(error);
            });
        } catch (error) {
            reject(error);
        }
    });
}

//login con google
let provider = new GoogleAuthProvider()
export const loginGoogle = async () => {
    try {
        let res = await signInWithPopup(auth, provider)
        return res
    } catch (error) {
        console.log(error)
    }
}

//registro
export const register = async ({ email, password }) => {
    try {
        let res = await createUserWithEmailAndPassword(auth, email, password)
        return res
    } catch (error) {
        console.log(error)
    }
}

//recuperar contraseña
export const resetPassword = async (email) => {
    try {
        let res = await sendPasswordResetEmail(auth, email)
        return res
    } catch (error) {
        console.log(error)
    }
}

// storage
export const uploadFile = async (file, onProgress) => {
    const storageRef = ref(storage, v4())
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

        if (onProgress) {
            onProgress(progress);
        }
    });



    try {
        // Esperar a que la carga se complete
        await uploadTask;

        // Obtener la URL de descarga
        const url = await getDownloadURL(storageRef);
        return url;
    } catch (error) {
        console.error("Error al cargar la imagen:", error);
        throw error; // Puedes manejar el error aquí o dejar que se propague
    }

}