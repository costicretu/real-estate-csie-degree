// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB6C13kXzhZOzkk-sdHb0Wcm2QLwkVT3ak",
    authDomain: "real-estate-csie-degree.firebaseapp.com",
    projectId: "real-estate-csie-degree",
    storageBucket: "real-estate-csie-degree.appspot.com",
    messagingSenderId: "1085883723439",
    appId: "1:1085883723439:web:374fbf47464af33a3fee5a"
};

initializeApp(firebaseConfig);
export const db = getFirestore()
