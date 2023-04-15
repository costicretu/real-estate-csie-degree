import React, { useEffect, useState } from 'react'
import { AiFillEyeInvisible, AiFillEye } from "react-icons/ai"
import { Link } from 'react-router-dom'
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { db } from '../firebase'
import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

export default function SignUpAgent() {
    const [showPassword, setShowPassword] = useState(false);
    const [showCode, setShowCode] = useState(false)
    const [isFormSubmitted, setIsFormSubmitted] = useState(false);
    const [showQuestions, setShowQuestions] = useState(false)
    const [question1Type, setQuestion1] = useState('')
    const [question2Type, setQuestion2] = useState('')
    const [question3Type, setQuestion3] = useState('')
    const [formDataAgent, setFormDataAgent] = useState({
        nameAgent: "",
        emailAgent: "",
        passwordAgent: "",
        answer1: "",
        answer2: "",
        answer3: "",
        question1: "Ce nume are câinele tău ?",
        question2: "Unde locuiești ?",
        question3: "Care este destinația ta de vacanță preferată ?",

    });
    const { nameAgent, emailAgent, passwordAgent, answer1, answer2, answer3, question1, question2, question3 } = formDataAgent;
    const navigate = useNavigate()
    const [codeInputValue, setCodeInputValue] = useState('costi');
    const [myCodeValue, setMyCodeValue] = useState('');
    const [isCodeMatched, setIsCodeMatched] = useState(false);
    const saveCodeToFirestore = async (code) => {
        try {
            const docRef = await addDoc(collection(db, "codes"), { code, timestamp: serverTimestamp()});
        } catch (e) {
            toast.error(e)
        }
    };
    useEffect(() => {
        if (codeInputValue === myCodeValue) {
            setIsCodeMatched(true);
        }
    }, [codeInputValue, myCodeValue]);
    function onChange(e) {
        if (e.target.id === 'code') {
            setCodeInputValue(e.target.value);
        }
        setFormDataAgent((prevState) => ({
            ...prevState,
            [e.target.id]: e.target.value,
        }))
        if (e.target.id === "question1") {
            setQuestion1(e.target.value);
        }
        if (e.target.id === "question2") {
            setQuestion2(e.target.value);
        }
        if (e.target.id === "question3") {
            setQuestion3(e.target.value);
        }
    }
    const [hasGeneratedCode, setHasGeneratedCode] = useState(false);
    useEffect(() => {
        if (showCode && !hasGeneratedCode) {
            const newCode = Math.random().toString(36).substring(2, 8);
            setMyCodeValue(newCode);
            saveCodeToFirestore(newCode);
            setHasGeneratedCode(true);
        }
    }, [showCode, hasGeneratedCode]);
    async function onSubmit(e) {
        e.preventDefault();
        setIsFormSubmitted(true);
        if (emailAgent.endsWith('@real-estate-csie-degree.com') && passwordAgent.length > 4 && nameAgent.length > 4) {
            setShowCode(true);
            if (codeInputValue !== myCodeValue && codeInputValue === '') {
                setIsFormSubmitted(false);
                return;
            } else if (codeInputValue === myCodeValue) {
                setShowQuestions(true);
                if (answer1 === "" || answer2 === "" || answer3 === "") {
                    //toast.error('Please fill in all the answers');
                    setIsFormSubmitted(false);
                    return;
                } else {
                    try {

                        setIsFormSubmitted(true);
                        const auth = getAuth();
                        const userCredential = await createUserWithEmailAndPassword(auth, emailAgent, passwordAgent);
                        updateProfile(auth.currentUser, {
                            displayName: nameAgent
                        });
                        const agent = userCredential.user;
                        const formDataCopyAgent = { ...formDataAgent };
                        //delete formDataCopyAgent.passwordAgent;
                        formDataCopyAgent.timestamp = serverTimestamp();
                        await setDoc(doc(db, 'agents', agent.uid), formDataCopyAgent);
                        navigate('/');

                    } catch (error) {
                        toast.error('Exista deja contu ba');
                    }
                    return;
                }
            }
        } else {
            toast.error('Please fill the inputs');
        }
    }
    return (
        <section>
            <h1 className='text-3xl text-center mt-6 font-bold'>Înregistrează agent</h1>
            <div className='flex justify-center flex-wrap items-center px-6 py-12 max-w-6xl mx-auto'>
                <div className='md:w-[67%] lg:w-[50%] mb-12 md:mb-6'>
                    <img src="https://images.unsplash.com/flagged/photo-1564767609342-620cb19b2357?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=773&q=80" alt="key" className='w-full rounded-2xl' />
                </div>
                <div className='w-full md:w-[67%] lg:w-[40%] lg:ml-20'>
                    <form onSubmit={onSubmit}>
                        <input type="text" id="nameAgent" value={nameAgent} onChange={onChange} placeholder="Nume prenume agent" className='mb-6 w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition ease-in-out' />
                        <input type="email" id="emailAgent" value={emailAgent} onChange={onChange} placeholder="Adresă email agent" className='mb-6 w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition ease-in-out' />
                        <div className='relative mb-6'>
                            <input type={showPassword ? "text" : "password"} id="passwordAgent" value={passwordAgent} onChange={onChange} placeholder="Parolă agent" className='w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition ease-in-out' />
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
                                <input type="text" id="code" onChange={onChange} placeholder="Cod înregistrare agent" className='mb-6 w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition ease-in-out' />
                            </div>
                        )}
                        {showQuestions && (
                            <div>
                                <select value={question1} onChange={onChange} name="question1" id="question1" className='w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600'>
                                    <option value="Ce nume are câinele tău ?">Ce nume are câinele tău?</option>
                                    <option value="Ce nume are pisica ta ?">Ce nume are pisica ta ?</option>
                                    <option value="Care este cel mai bun prieten al tău ?">Care este cel mai bun prieten al tău ?</option>
                                </select>
                                <input type="text" id="answer1" onChange={onChange} placeholder="Răspuns la prima întrebare" value={answer1} className='mb-6 w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition ease-in-out' />
                                <select value={question2} onChange={onChange} name="question2" id="question2" className='w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600'>
                                    <option value="Unde locuiești ?">Unde locuiești ?</option>
                                    <option value="Unde te-ai născut ?">Unde te-ai născut ?</option>
                                    <option value="Ce culoare au ochii tăi ?">Ce culoare au ochii tăi ?</option>
                                </select>
                                <input type="text" id="answer2" onChange={onChange} placeholder="Răspuns la a doua întrebare" value={answer2} className='mb-6 w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition ease-in-out' />
                                <select value={question3} onChange={onChange} name="question3" id="question3" className='w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600'>
                                    <option value="Care este destinația ta de vacanță preferată ?">Care este destinația ta de vacanță preferată ?</option>
                                    <option value="Care este culoarea ta preferată ?">Care este culoarea ta preferată ?</option>
                                    <option value="Ce sport te pasionează ?">Ce sport te pasionează ?</option>
                                </select>
                                <input type="text" id="answer3" onChange={onChange} placeholder="Răspuns la a treia întrebare" value={answer3} className='mb-6 w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition ease-in-out' />
                            </div>
                        )}
                        <button className='w-full bg-blue-600 text-white px-7 py-3 text-sm font-medium uppercase rounded shadow-md hover:bg-blue-700 transition duration-150 ease-in-out hover:shadow-lg active:bg-blue-800' type='submit'>Înregistrează agent</button>
                    </form>
                </div>
            </div>
        </section>
    )
}