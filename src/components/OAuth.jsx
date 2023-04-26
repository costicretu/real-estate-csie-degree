import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import React from 'react'
import { FcGoogle } from 'react-icons/fc'
import { toast } from 'react-toastify'
import { db } from '../firebase'
import { useNavigate } from 'react-router'

export default function OAuth() {
  const navigate = useNavigate()
  async function onGoogleClick() {
    try {
      const auth = getAuth()
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const user = result.user
      user.phoneNumber = 0;
      const docRef = doc(db, 'users', user.uid)
      const docSnap = await getDoc(docRef)
      if (!docSnap.exists()) {
        await setDoc(docRef, {
          name: user.displayName,
          email: user.email,
          phone: 0,
          timestamp: serverTimestamp(),
        })
      }
      navigate("/")
    } catch (error) {
      toast.error('Nu s-a putut autoriza cu Google')
    }
  }
  return (
    <div className='relative mb-3'>
      <button type='button' onClick={onGoogleClick} className='items-center text-center bg-gray-300 text-gray-900  w-full px-10 py-2 text-lg font-medium uppercase rounded-2xl shadow-md hover:bg-gray-400 transition duration-150 ease-in-out hover:shadow-lg active:bg-gray-500'>
        <FcGoogle className='text-2xl bg-white rounded-full absolute left-3 top-2.5' />Continuă cu Google
      </button>
    </div>

  )
}