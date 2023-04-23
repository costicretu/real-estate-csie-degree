import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import React, { useState } from 'react'
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MdAccountCircle } from 'react-icons/md';

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  function onChange(e) {
    setEmail(e.target.value);
  }
  async function onSubmit(e) {
    e.preventDefault()
    try {
      const auth = getAuth()
      await sendPasswordResetEmail(auth, email)
      toast.success('Email-ul a fost trimis')
    } catch (error) {
      toast.error('Nu s-a putut trimite resetarea parolei')
    }
  }
  return (
    <section>
      <h1 className='text-3xl text-center  ml-5 mr-5 py-1 text-gray-100 mt-6 font-semibold mb-6 bg-slate-500 rounded-lg shadow-lg'>Resetează parola</h1>
      <div className='justify-center items-center max-w-xl bg-slate-500 rounded-md mx-auto px-10 py-5 shadow-lg'>
        <div className='mx-auto px-3'>
          <form onSubmit={onSubmit}>
            <div className='relative mb-6'>
              <input type="email" id="email" value={email} onChange={onChange} placeholder="Email" className='w-full px-4 py-2 text-xl bg-gray-100 border-gray-300 rounded transition ease-in-out focus:border-red-500 focus:ring-2 focus:ring-red-500' />
              <MdAccountCircle className="absolute right-3 top-2 text-3xl" />
            </div>
            
            <div className='text-center'>
              <button className='items-center text-center bg-red-600 text-gray-100 px-12 py-2 text-lg font-medium uppercase rounded-2xl shadow-md hover:bg-red-700 transition duration-150 ease-in-out hover:shadow-lg active:bg-red-800' type='submit'>Trimite</button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
