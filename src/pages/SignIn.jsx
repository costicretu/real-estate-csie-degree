import { useState } from "react";
import { AiFillEyeInvisible, AiFillEye } from "react-icons/ai";
import { Link } from "react-router-dom";
import { useNavigate } from 'react-router'
import OAuth from "../components/OAuth";
import { signInWithEmailAndPassword, getAuth } from "firebase/auth";
import { toast } from "react-toastify";
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { MdMail, MdQuestionAnswer } from 'react-icons/md'

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [isForAgent, setIsForAgent] = useState(false);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [showCode, setShowCode] = useState(false)
  const [codeInputValue, setCodeInputValue] = useState('');
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  var a = 0
  const { email, password } = formData;
  const [formDataAgent, setFormDataAgent] = useState({
    emailAgent: "",
    passwordAgent: "",
    answer1: "",
    answer2: "",
    answer3: "",
    question1: "",
    question2: "",
    question3: "",
  });
  const { emailAgent, passwordAgent, answer1, answer2, answer3, question1, question2, question3 } = formDataAgent;
  const [showQuestions, setShowQuestions] = useState(false)
  const [answer1InputValue, setAnswer1InputValue] = useState('');
  const [answer2InputValue, setAnswer2InputValue] = useState('');
  const [answer3InputValue, setAnswer3InputValue] = useState('');
  const [question1Type, setQuestion1] = useState('')
  const [question2Type, setQuestion2] = useState('')
  const [question3Type, setQuestion3] = useState('')
  const navigate = useNavigate()
  function onChange(e) {
    if (e.target.id === 'code') {
      setCodeInputValue(e.target.value);
    }
    if (e.target.id === 'answer1') {
      setAnswer1InputValue(e.target.value);
    }
    if (e.target.id === 'answer2') {
      setAnswer2InputValue(e.target.value);
    }
    if (e.target.id === 'answer3') {
      setAnswer3InputValue(e.target.value);
    }
    if (e.target.id === "question1") {
      setQuestion1(e.target.value);
    }
    if (e.target.id === "question2") {
      setQuestion2(e.target.value);
    }
    if (e.target.id === "question3") {
      setQuestion3(e.target.value);
    }
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
    setFormDataAgent((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  }
  async function onSubmit(e) {
    e.preventDefault();
    if (email.endsWith('@real-estate-csie-degree.com')) {
      toast.error('Nu te poți loga ca agent')
      return
    }
    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      if (userCredential.user) {
        navigate("/")
      }
    } catch (error) {
      toast.error("Acreditări de utilizator neutilizabile");
    }
  }
  async function onSubmitAgent(e) {
    e.preventDefault();
    const agentsCollection = collection(db, 'agents');
    const agentsQuery = query(agentsCollection, where('emailAgent', '==', emailAgent));
    const agentDocs = await getDocs(agentsQuery);
    const agentDoc = agentDocs.docs[0];
    const agentData = agentDoc.data();
    if (agentData.emailAgent === emailAgent && agentData.passwordAgent === passwordAgent) {
      setShowCode(true);
      const agentsCollection = collection(db, 'agents');
      const agentsQuery = query(agentsCollection, where('emailAgent', '==', emailAgent));
      const agentDocs = await getDocs(agentsQuery);
      if (agentDocs.size === 1) {
        const agentDoc = agentDocs.docs[0];
        const agentData = agentDoc.data();
        const agentCode = agentData.code;
        const agentAnswer1 = agentData.answer1;
        const agentAnswer2 = agentData.answer2;
        const agentAnswer3 = agentData.answer3;
        const agentQuestion1 = agentData.question1;
        const agentQuestion2 = agentData.question2;
        const agentQuestion3 = agentData.question3;
        if (codeInputValue !== agentCode && codeInputValue !== '') {
          toast.error('Codul pentru autentificare este incorect');
          setIsFormSubmitted(false);
          return;
        } else if (codeInputValue === agentCode) {
          if(answer1InputValue !== '' || answer2InputValue !== '' || answer3InputValue !== '') {
            a = 1
          }
          setShowQuestions(true)
          setQuestion1("Care este mâncarea ta favorită ?")
          setQuestion2("Unde locuiești ?")
          setQuestion3("Care este destinația ta de vacanță preferată ?")
          if (answer1InputValue === agentAnswer1 && answer2InputValue === agentAnswer2 && answer3InputValue === agentAnswer3
            && question1Type === agentQuestion1 && question2Type === agentQuestion2 && question3Type === agentQuestion3) {
            setIsFormSubmitted(true)
            try {
              const auth = getAuth();
              const userCredential = await signInWithEmailAndPassword(
                auth,
                emailAgent,
                passwordAgent,
              );
              if (userCredential.user) {
                navigate('/');
              }
            } catch (error) {
              toast.error('Acreditări de utilizator agent neutilizabile');
            }
          } else if(a === 1) {
            toast.error('Nu functioneaza')
            setIsFormSubmitted(false)
            return;
          }
        }
      } else {
        toast.error('Agentul nu există');
      }
    } else {
      toast.error('Parola sau email greșit')
    }
  }
  return (
    <section className="h-screen">
      <h1 className="text-3xl text-center  ml-5 mr-5 py-1 text-gray-100 mt-6 font-semibold mb-4 bg-slate-500 rounded-lg shadow-lg">Intră în cont</h1>
      <div className="justify-center items-center max-w-xl bg-slate-500 rounded-md mx-auto px-10 py-5 shadow-lg" id='pentruCont'>
        <div className="mx-auto px-3 ">
          <div className="flex text-center items-center justify-center rounded-sm py-1">
            <label for="forAgent" className=" text-gray-100 text-xl mr-2">Sunt agent RE/CSIE</label>
            <input onChange={(e) => setIsForAgent(e.target.checked)} type="checkbox" name="forAgent" id="forAgent"
              className="transition ease-in-out text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 mt-1" />
          </div>
          {!isForAgent && (
            <form onSubmit={onSubmit}>
              <div className="relative mb-6 mt-6">
                <input type="email" id="email" value={email} onChange={onChange} placeholder="Email" className="w-full px-4 py-2 text-xl bg-gray-100 border-gray-300 rounded transition ease-in-out focus:border-red-500 focus:ring-2 focus:ring-red-500" />
                <MdMail className="absolute right-3 top-2 text-3xl" />
              </div>
              <div className="relative mb-6">
                <input type={showPassword ? "text" : "password"} id="password" value={password} onChange={onChange} placeholder="Parolă" className="w-full px-4 py-2 text-xl bg-gray-100 border-gray-300 rounded transition ease-in-out focus:border-red-500 focus:ring-2 focus:ring-red-500" />
                {showPassword ? (<AiFillEyeInvisible className="absolute right-3 top-2 text-3xl cursor-pointer" onClick={() => setShowPassword((prevState) => !prevState)} />)
                  : (<AiFillEye className="absolute right-3 top-2 text-3xl cursor-pointer" onClick={() => setShowPassword((prevState) => !prevState)} />)}
              </div>
              <div class="flex justify-between mb-3 items-center">
                <Link to="/sign-up" class="bg-gray-300 rounded-md px-2 py-1 text-sm sm:text-lg font-medium text-red-600 hover:text-red-800 transition duration-200 ease-in-out">Nu ai încă cont?</Link>
                <p class="flex-grow"></p>
                <Link to="/forgot-password" class="bg-gray-300 rounded-md px-2 py-1 text-sm sm:text-lg font-medium text-blue-600 hover:text-blue-800 transition duration-200 ease-in-out">Ai greșit parola?</Link>
              </div>
              <div className="text-center">
                <button className="items-center text-center bg-red-600 text-gray-100 px-10 py-2 text-lg font-medium uppercase rounded-2xl shadow-md hover:bg-red-700 transition duration-150 ease-in-out hover:shadow-lg active:bg-red-800" type="submit">Continuă</button>
              </div>
              <div className="flex items-center  my-4 before:border-t before:flex-1 before:border-gray-300 after:border-t after:flex-1 after:border-gray-300">
                <p className="text-center font-semibold mx-4">SAU</p>
              </div>
              <div className="text-center">
                <OAuth />
              </div>
            </form>
          )}
          {isForAgent && (
            <form onSubmit={onSubmitAgent}>
              <div className="relative">
                <input type="email" id="emailAgent" value={emailAgent} onChange={onChange} placeholder="Email agent" className="mt-6 mb-6 w-full px-4 py-2 text-xl bg-gray-100 border-gray-300 rounded transition ease-in-out focus:border-red-500 focus:ring-2 focus:ring-red-500" />
                <MdMail className="absolute right-3 top-8 text-3xl" />
              </div>
              <div className="relative mb-6">
                <input type={showPassword ? "text" : "password"} id="passwordAgent" value={passwordAgent} onChange={onChange} placeholder="Parolă agent" className="w-full px-4 py-2 text-xl bg-gray-100 border-gray-300 rounded transition ease-in-out focus:border-red-500 focus:ring-2 focus:ring-red-500" />
                {showPassword ? (<AiFillEyeInvisible className="absolute right-3 top-2 text-3xl cursor-pointer" onClick={() => setShowPassword((prevState) => !prevState)} />)
                  : (<AiFillEye className="absolute right-3 top-2 text-3xl cursor-pointer" onClick={() => setShowPassword((prevState) => !prevState)} />)}
              </div>
              {showCode && (
                <div>
                  <input type="text" id="code" onChange={onChange} placeholder="Cod autentificare" className='mb-3 w-full px-4 py-2 text-xl text-gray-700 bg-gray-100 border-gray-300 rounded transition ease-in-out focus:border-red-500 focus:ring-2 focus:ring-red-500' />
                </div>
              )}
              {showQuestions && (
                <div>
                  <h3 className="text-center text-gray-100 text-xl mb-2">Alege și răspunde la următoarele întrebări:</h3>
                  <div className="bg-gray-700 px-0.5 py-2 mb-3 rounded-md shadow-lg ">
                    <div className='relative mb-1 '>
                      <MdQuestionAnswer className="absolute left-0 top-0 text-3xl" />
                      <h3 className='font-semibold text-lg text-gray-100 ml-8'>Secțiunea 1</h3>
                    </div>
                    <div className='px-2 py-1'>
                      <select value={question1} onChange={onChange} name="question1" id="question1" className='w-full rounded-md text-xl text-gray-700 bg-gray-100 border-gray-300  transition duration-150 ease-in-out focus:border-red-500 focus:ring-2 focus:ring-red-500'>
                        <option value="Care este mâncarea ta favorită ?" >Care este mâncarea ta favorită ?</option>
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
              <div className="text-center">
                <button className="items-center text-center bg-red-600 text-gray-100 px-10 py-2 text-lg font-medium uppercase rounded-2xl shadow-md hover:bg-red-700 transition duration-150 ease-in-out hover:shadow-lg active:bg-red-800" type="submit">Continuă</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}