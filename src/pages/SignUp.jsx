import React, { useState } from 'react'
import { AiFillEyeInvisible, AiFillEye } from "react-icons/ai"
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { db } from '../firebase'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { MdAccountCircle, MdEmail } from 'react-icons/md'

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: 0,
  });
  const { name, email, password } = formData;
  const navigate = useNavigate()
  function onChange(e) {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }))
  }
  async function onSubmit(e) {
    e.preventDefault()
    if (email.endsWith('@real-estate-csie-degree.com')) {
      toast.error('Nu te poți înregistra ca agent')
    } else {
      try {
        const auth = getAuth()
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        updateProfile(auth.currentUser, {
          displayName: name
        })
        const user = userCredential.user
        const formDataCopy = { ...formData }
        delete formDataCopy.password
        formDataCopy.timestamp = serverTimestamp()
        await setDoc(doc(db, 'users', user.uid), formDataCopy)
        navigate('/')
      } catch (error) {
        toast.error('Înregistrarea nu a funcționat')
      }
    }
  }
  return (
    <section>
      <h1 className='text-3xl text-center  ml-5 mr-5 py-1 text-gray-100 mt-6 font-semibold mb-4 bg-slate-500 rounded-lg shadow-lg'>Creare cont</h1>
      <div className='justify-center items-center max-w-xl bg-slate-500 rounded-md mx-auto px-10 py-5 shadow-lg'>
        <div className='mx-auto px-3'>
          <form onSubmit={onSubmit}>
            <div className='relative mb-6'>
              <input type="text" id="name" value={name} onChange={onChange} placeholder="Nume și prenume" className='w-full px-4 py-2 text-xl bg-gray-100 border-gray-300 rounded transition ease-in-out focus:border-red-500 focus:ring-2 focus:ring-red-500' />
              <MdAccountCircle className="absolute right-3 top-2 text-3xl" />
            </div>
            <div className='relative mb-6'>
              <input type="email" id="email" value={email} onChange={onChange} placeholder="Email" className='w-full px-4 py-2 text-xl bg-gray-100 border-gray-300 rounded transition ease-in-out focus:border-red-500 focus:ring-2 focus:ring-red-500' />
              <MdEmail className="absolute right-3 top-2 text-3xl" />
            </div>
            <div className='relative mb-6'>
              <input type={showPassword ? "text" : "password"} id="password" value={password} onChange={onChange} placeholder="Parolă" className='w-full px-4 py-2 text-xl bg-gray-100 border-gray-300 rounded transition ease-in-out focus:border-red-500 focus:ring-2 focus:ring-red-500' />
              {showPassword ? (
                <AiFillEyeInvisible className='absolute right-3 top-2 text-3xl cursor-pointer'
                  onClick={() => setShowPassword((prevState) => !prevState)} />
              ) : (
                <AiFillEye className='absolute right-3 top-2 text-3xl cursor-pointer'
                  onClick={() => setShowPassword((prevState) => !prevState)} />
              )}
            </div>
            <div className='text-center'>
              <button className='items-center text-center bg-red-600 text-gray-100 px-10 py-2 text-lg font-medium uppercase rounded-2xl shadow-md hover:bg-red-700 transition duration-150 ease-in-out hover:shadow-lg active:bg-red-800' type='submit'>Continuă</button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}