import React, { useState } from 'react'
import { AiFillEyeInvisible, AiFillEye } from "react-icons/ai"
import { Link } from 'react-router-dom'
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { db } from '../firebase'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

export default function SignUpAgent() {
    const [showPassword, setShowPassword] = useState(false);
    const [showCode, setShowCode] = useState(false)
    const [isFormSubmitted, setIsFormSubmitted] = useState(false);
    const [formDataAgent, setFormDataAgent] = useState({
        nameAgent: "",
        emailAgent: "",
        passwordAgent: "",

    });
    const { nameAgent, emailAgent, passwordAgent } = formDataAgent;
    const navigate = useNavigate()
    const myCode = 'costi'
    const [codeInputValue, setCodeInputValue] = useState('');
    function onChange(e) {
        if (e.target.id === 'code') {
            setCodeInputValue(e.target.value);
        }
        setFormDataAgent((prevState) => ({
            ...prevState,
            [e.target.id]: e.target.value,
        }))
    }

    async function onSubmit(e) {
        e.preventDefault()
        setIsFormSubmitted(true);
        if (emailAgent.endsWith('@real-estate-csie-degree.com')) {
            setShowCode(true)
            if (codeInputValue !== myCode && codeInputValue !== '') {
                toast.error('The code is not correct');
                setIsFormSubmitted(false);
                return;
            } else if (codeInputValue === myCode) {
                try {
                    setIsFormSubmitted(true)
                    try {
                        const auth = getAuth()
                        const userCredential = await createUserWithEmailAndPassword(auth, emailAgent, passwordAgent)
                        updateProfile(auth.currentUser, {
                            displayName: nameAgent
                        })
                        const agent = userCredential.user
                        const formDataCopyAgent = { ...formDataAgent }
                        delete formDataCopyAgent.password
                        formDataCopyAgent.timestamp = serverTimestamp()
                        await setDoc(doc(db, 'agents', agent.uid), formDataCopyAgent)
                        navigate('/')
                        // toast.success('Sign up was succesful')
                    } catch (error) {
                        toast.error('Something went wrong with the registration agency')
                    }
                    return
                } catch (error) {
                    toast.error('Please fill the code')
                }
            }
        }
    }
    return (
        <section>
            <h1 className='text-3xl text-center mt-6 font-bold'>Sign up as agent</h1>
            <div className='flex justify-center flex-wrap items-center px-6 py-12 max-w-6xl mx-auto'>
                <div className='md:w-[67%] lg:w-[50%] mb-12 md:mb-6'>
                    <img src="https://images.unsplash.com/flagged/photo-1564767609342-620cb19b2357?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=773&q=80" alt="key" className='w-full rounded-2xl' />
                </div>
                <div className='w-full md:w-[67%] lg:w-[40%] lg:ml-20'>
                    <form onSubmit={onSubmit}>
                        <input type="text" id="nameAgent" value={nameAgent} onChange={onChange} placeholder="Full name agent" className='mb-6 w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition ease-in-out' />
                        <input type="email" id="emailAgent" value={emailAgent} onChange={onChange} placeholder="Email address agent" className='mb-6 w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition ease-in-out' />
                        <div className='relative mb-6'>
                            <input type={showPassword ? "text" : "password"} id="passwordAgent" value={passwordAgent} onChange={onChange} placeholder="Password agent" className='w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition ease-in-out' />
                            {showPassword ? (
                                <AiFillEyeInvisible className='absolute right-3 top-3 text-xl cursor-pointer'
                                    onClick={() => setShowPassword((prevState) => !prevState)} />
                            ) : (
                                <AiFillEye className='absolute right-3 top-3 text-xl cursor-pointer'
                                    onClick={() => setShowPassword((prevState) => !prevState)} />
                            )}
                        </div>
                        {showCode && (
                            <div>
                                <p className='text-lg font-semibold'>Code</p>
                                <input type="text" id="code" onChange={onChange} placeholder="Code" className='mb-6 w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition ease-in-out' />
                            </div>
                        )}
                        <div className='flex justify-between whitespace-nowrap text-sm:text-lg'>
                            <p className='mb-6'>Have an account?
                                <Link to='/sign-in' className='text-red-600 hover:text-red-700 transition duration-200 ease-in-out ml-1'>Sign in</Link>
                            </p>
                            
                        </div>
                        <button className='w-full bg-blue-600 text-white px-7 py-3 text-sm font-medium uppercase rounded shadow-md hover:bg-blue-700 transition duration-150 ease-in-out hover:shadow-lg active:bg-blue-800' type='submit'>Sign up as agent</button>

                    </form>
                </div>
            </div>
        </section>
    )
}
