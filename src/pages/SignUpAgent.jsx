import React, { useEffect, useState } from 'react'
import { AiFillEyeInvisible, AiFillEye } from "react-icons/ai"
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { db } from '../firebase'
import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { MdAccountCircle, MdEmail, MdQuestionAnswer } from 'react-icons/md'

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
        phone: 0,

    });
    const { nameAgent, emailAgent, passwordAgent, answer1, answer2, answer3, question1, question2, question3 } = formDataAgent;
    const navigate = useNavigate()
    const [codeInputValue, setCodeInputValue] = useState('costi');
    const [myCodeValue, setMyCodeValue] = useState('');
    const [isCodeMatched, setIsCodeMatched] = useState(false);
    const saveCodeToFirestore = async (code) => {
        try {
            const docRef = await addDoc(collection(db, "codes"), { code, timestamp: serverTimestamp() });
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
                        formDataCopyAgent.timestamp = serverTimestamp();
                        await setDoc(doc(db, 'agents', agent.uid), formDataCopyAgent);
                        navigate('/');

                    } catch (error) {
                        toast.error(error);
                    }
                    return;
                }
            }
        } else {
            toast.error('Te rog completează câmpurile');
        }
    }
    return (
        <section>
            <h1 className='text-3xl text-center  ml-5 mr-5 py-1 text-gray-100 mt-6 font-semibold mb-4 bg-slate-500 rounded-lg shadow-lg'>Înregistrează agent</h1>
            <div className='justify-center items-center max-w-xl bg-slate-500 rounded-md mx-auto px-10 py-5 shadow-lg'>
                <div className='mx-auto px-3'>
                    <form onSubmit={onSubmit}>
                        <div className='relative mb-6'>
                            <MdAccountCircle className="absolute right-3 top-2 text-3xl" />
                            <input type="text" id="nameAgent" value={nameAgent} onChange={onChange} placeholder="Nume și prenume" className='w-full px-4 py-2 text-xl bg-gray-100 border-gray-300 rounded transition ease-in-out focus:border-red-500 focus:ring-2 focus:ring-red-500' />
                        </div>
                        <div className='relative mb-6'>
                            <MdEmail className="absolute right-3 top-2 text-3xl" />
                            <input type="email" id="emailAgent" value={emailAgent} onChange={onChange} placeholder="Email" className='w-full px-4 py-2 text-xl bg-gray-100 border-gray-300 rounded transition ease-in-out focus:border-red-500 focus:ring-2 focus:ring-red-500' />
                        </div>
                        <div className='relative mb-6'>
                            <input type={showPassword ? "text" : "password"} id="passwordAgent" value={passwordAgent} onChange={onChange} placeholder="Parolă" className='w-full px-4 py-2 text-xl bg-gray-100 border-gray-300 rounded transition ease-in-out focus:border-red-500 focus:ring-2 focus:ring-red-500' />
                            {showPassword ? (
                                <AiFillEyeInvisible className='absolute right-3 top-2 text-3xl cursor-pointer'
                                    onClick={() => setShowPassword((prevState) => !prevState)} />
                            ) : (
                                <AiFillEye className='absolute right-3 top-2 text-3xl cursor-pointer'
                                    onClick={() => setShowPassword((prevState) => !prevState)} />
                            )}
                        </div>
                        {showCode && (
                            <div>
                                <input type="text" id="code" onChange={onChange} placeholder="Cod autentificare" className='mb-3 w-full px-4 py-2 text-xl text-gray-700 bg-gray-100 border-gray-300 rounded transition ease-in-out focus:border-red-500 focus:ring-2 focus:ring-red-500' />
                            </div>
                        )}
                        {showQuestions && (
                            <div>
                                <h3 className="text-center text-gray-100 text-xl mb-2">Întrebări pentru securitatea contului:</h3>
                                <div className="bg-gray-700 px-0.5 py-2 mb-3 rounded-md shadow-lg ">
                                    <div className='relative mb-1 '>
                                        <MdQuestionAnswer className="absolute left-0 top-0 text-3xl" />
                                        <h3 className='font-semibold text-lg text-gray-100 ml-8'>Secțiunea 1</h3>
                                    </div>
                                    <div className='px-2 py-1'>
                                        <select value={question1} onChange={onChange} name="question1" id="question1" className='w-full rounded-md text-xl text-gray-700 bg-gray-100 border-gray-300  transition duration-150 ease-in-out focus:border-red-500 focus:ring-2 focus:ring-red-500'>
                                            <option value="Ce nume are câinele tău ?">Ce nume are câinele tău?</option>
                                            <option value="Ce nume are pisica ta ?">Ce nume are pisica ta ?</option>
                                            <option value="Care este cel mai bun prieten al tău ?">Care este cel mai bun prieten al tău ?</option>
                                        </select>
                                        <input type="text" id="answer1" onChange={onChange} placeholder="Răspuns" value={answer1} className='w-full mt-1 text-xl text-gray-700 bg-gray-100 border-gray-300 rounded transition ease-in-out focus:border-red-500 focus:ring-2 focus:ring-red-500' />
                                    </div>
                                </div>
                                <div className="bg-gray-700 px-0.5 py-2 mb-3 rounded-md shadow-lg ">
                                    <div className='relative mb-1 '>
                                        <MdQuestionAnswer className="absolute left-0 top-0 text-3xl" />
                                        <h3 className='font-semibold text-lg text-gray-100 ml-8'>Secțiunea 2</h3>
                                    </div>
                                    <div className='px-2 py-1'>
                                        <select value={question2} onChange={onChange} name="question2" id="question2" className='w-full rounded-md text-xl text-gray-700 bg-gray-100 border-gray-300  transition duration-150 ease-in-out focus:border-red-500 focus:ring-2 focus:ring-red-500'>
                                            <option value="Unde locuiești ?">Unde locuiești ?</option>
                                            <option value="Unde te-ai născut ?">Unde te-ai născut ?</option>
                                            <option value="Ce culoare au ochii tăi ?">Ce culoare au ochii tăi ?</option>
                                        </select>
                                        <input type="text" id="answer2" onChange={onChange} placeholder="Răspuns" value={answer2} className='w-full mt-1 text-xl text-gray-700 bg-gray-100 border-gray-300 rounded transition ease-in-out focus:border-red-500 focus:ring-2 focus:ring-red-500' />
                                    </div>
                                </div>
                                <div className="bg-gray-700 px-0.5 py-2 mb-3 rounded-md shadow-lg ">
                                    <div className='relative mb-1 '>
                                        <MdQuestionAnswer className="absolute left-0 top-0 text-3xl" />
                                        <h3 className='font-semibold text-lg text-gray-100 ml-8'>Secțiunea 3</h3>
                                    </div>
                                    <div className='px-2 py-1'>
                                        <select value={question3} onChange={onChange} name="question3" id="question3" className='w-full rounded-md text-xl text-gray-700 bg-gray-100 border-gray-300  transition duration-150 ease-in-out focus:border-red-500 focus:ring-2 focus:ring-red-500'>
                                            <option value="Care este destinația ta de vacanță preferată ?">Care este destinația ta de vacanță preferată ?</option>
                                            <option value="Care este culoarea ta preferată ?">Care este culoarea ta preferată ?</option>
                                            <option value="Ce sport te pasionează ?">Ce sport te pasionează ?</option>
                                        </select>
                                        <input type="text" id="answer3" onChange={onChange} placeholder="Răspuns" value={answer3} className='w-full mt-1 text-xl text-gray-700 bg-gray-100 border-gray-300 rounded transition ease-in-out focus:border-red-500 focus:ring-2 focus:ring-red-500' />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className='text-center'>
                            <button className='items-center text-center bg-red-600 text-gray-100 px-10 py-2 text-lg font-medium uppercase rounded-2xl shadow-md hover:bg-red-700 transition duration-150 ease-in-out hover:shadow-lg active:bg-red-800' type='submit'>Continuă</button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    )
}