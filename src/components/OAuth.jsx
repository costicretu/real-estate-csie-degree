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
      const docRef = doc(db, 'users', user.uid)
      const docSnap = await getDoc(docRef)
      if (!docSnap.exists()) {
        await setDoc(docRef, {
          name: user.displayName,
          email: user.email,
          timestamp: serverTimestamp(),
        })
      }
      navigate("/")
    } catch (error) {
      toast.error('Nu s-a putut autoriza cu Google')
    }
  }
  return (
    <div className='relative'>
      <button type='button' onClick={onGoogleClick} className='flex w-full justify-center items-center bg-gray-300 text-gray-900 px-7 py-3 uppercase text-sm font-medium hover:bg-gray-400 active:bg-gray-500 shadow-md hover:shadow-lg active:shadow-lg transition duration-150 ease-in-out rounded-lg'>
        <FcGoogle className='text-2xl bg-white rounded-full absolute left-2 top-2.5' />Continuă cu Google
      </button>
    </div>

  )
}