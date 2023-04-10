import { useState } from "react";
import { AiFillEyeInvisible, AiFillEye } from "react-icons/ai";
import { Link } from "react-router-dom";
import { useNavigate } from 'react-router'
import OAuth from "../components/OAuth";
import { signInWithEmailAndPassword, getAuth } from "firebase/auth";
import { toast } from "react-toastify";

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [isForAgent, setIsForAgent] = useState(false);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [showCode, setShowCode] = useState(false)
  const myCode = 'costi'
  const [codeInputValue, setCodeInputValue] = useState('');
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { email, password } = formData;
  const [formDataAgent, setFormDataAgent] = useState({
    emailAgent: "",
    passwordAgent: "",
  });
  const { emailAgent, passwordAgent } = formData;
  const navigate = useNavigate()
  function onChange(e) {
    if (e.target.id === 'code') {
      setCodeInputValue(e.target.value);
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
      toast.error('You cannot sign-in as an agent')
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
      toast.error("Bad user credentials");
    }
  }

  async function onSubmitAgent(e) {
    e.preventDefault();
    if (emailAgent.endsWith('@real-estate-csie-degree.com')) {
      setShowCode(true)
      if (codeInputValue !== myCode && codeInputValue !== '') {
        toast.error('The code is not correct');
        setIsFormSubmitted(false);
        return;
      } else if (codeInputValue === myCode) {
        try {
          const auth = getAuth();
          const userCredential = await signInWithEmailAndPassword(
            auth,
            emailAgent,
            passwordAgent,
          );
          if (userCredential.user) {
            navigate("/")
          }
        } catch (error) {
          toast.error("Bad agent credentials");
        }
      }
    } else {
      toast.error('YOU DONT BELONG HERE')
    }
  }
  return (
    <section>
      <h1 className="text-3xl text-center mt-6 font-bold">Sign In</h1>
      <div className="flex justify-center flex-wrap items-center px-6 py-12 max-w-6xl mx-auto">
        <div className="md:w-[67%] lg:w-[50%] mb-12 md:mb-6">
          <img
            src="https://images.unsplash.com/flagged/photo-1564767609342-620cb19b2357?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1373&q=80"
            alt="key"
            className="w-full rounded-2xl"
          />
        </div>
        <div className="w-full md:w-[67%] lg:w-[40%] lg:ml-20">
          <input onChange={(e) => setIsForAgent(e.target.checked)} type="checkbox" name="forAgent" id="forAgent" />
          <label for="forAgent" className="mb-6 w-full px-4 py-2 text-xl text-gray-700  ">I am an agent</label>
          {!isForAgent && (
            <form onSubmit={onSubmit}>
              <input type="email" id="email" value={email} onChange={onChange} placeholder="Email address" className="mt-6 mb-6 w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition ease-in-out" />
              <div className="relative mb-6">
                <input type={showPassword ? "text" : "password"} id="password" value={password} onChange={onChange} placeholder="Password" className="w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition ease-in-out" />
                {showPassword ? (<AiFillEyeInvisible className="absolute right-3 top-3 text-xl cursor-pointer" onClick={() => setShowPassword((prevState) => !prevState)} />)
                  : (<AiFillEye className="absolute right-3 top-3 text-xl cursor-pointer" onClick={() => setShowPassword((prevState) => !prevState)} />)}
              </div>
              <div className="flex justify-between whitespace-nowrap text-sm sm:text-lg">
                <p className="mb-6">Don't have a account?<Link to="/sign-up" className="text-red-600 hover:text-red-700 transition duration-200 ease-in-out ml-1">Register</Link></p>
                <p> <Link to="/forgot-password" className="text-blue-600 hover:text-blue-800 transition duration-200 ease-in-out">Forgot password?</Link></p>
              </div>
              <button className="w-full bg-blue-600 text-white px-7 py-3 text-sm font-medium uppercase rounded shadow-md hover:bg-blue-700 transition duration-150 ease-in-out hover:shadow-lg active:bg-blue-800" type="submit">Sign in</button>
              <div className="flex items-center  my-4 before:border-t before:flex-1 before:border-gray-300 after:border-t after:flex-1 after:border-gray-300">
                <p className="text-center font-semibold mx-4">OR</p>
              </div>
              <OAuth />
            </form>
          )}
          {isForAgent && (
            <form onSubmit={onSubmitAgent}>
              <input type="email" id="emailAgent" value={emailAgent} onChange={onChange} placeholder="Email address agent" className="mt-6 mb-6 w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition ease-in-out" />
              <div className="relative mb-6">
                <input type={showPassword ? "text" : "password"} id="passwordAgent" value={passwordAgent} onChange={onChange} placeholder="Password agent" className="w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition ease-in-out" />
                {showPassword ? (<AiFillEyeInvisible className="absolute right-3 top-3 text-xl cursor-pointer" onClick={() => setShowPassword((prevState) => !prevState)} />)
                  : (<AiFillEye className="absolute right-3 top-3 text-xl cursor-pointer" onClick={() => setShowPassword((prevState) => !prevState)} />)}
              </div>
              {showCode && (
                            <div>
                                <p className='text-lg font-semibold'>Code</p>
                                <input type="text" id="code" onChange={onChange} placeholder="Code" className='mb-6 w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition ease-in-out' />
                            </div>
                        )}
              <div className="flex justify-between whitespace-nowrap text-sm sm:text-lg">
                <p className="mb-6">Don't have an agent account?<Link to="/sign-up-agent" className="text-red-600 hover:text-red-700 transition duration-200 ease-in-out ml-1">Register</Link></p>
              </div>
              <button className="w-full bg-blue-600 text-white px-7 py-3 text-sm font-medium uppercase rounded shadow-md hover:bg-blue-700 transition duration-150 ease-in-out hover:shadow-lg active:bg-blue-800" type="submit">Sign in as agent</button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}