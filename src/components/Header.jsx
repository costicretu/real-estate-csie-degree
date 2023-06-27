import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { db } from "../firebase";
import { useAuthStatusAgent } from '../hooks/useAuthStatusAgent'
import logo from '../assets/logo-no-background.png';

export default function Header() {
  const [pageState, setPageState] = useState('Cont')
  const location = useLocation()
  const navigate = useNavigate()
  const auth = getAuth()
  const { isAgent } = useAuthStatusAgent()
  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const agentDoc = doc(db, 'agents', user.uid)
        const agentDocSnap = await getDoc(agentDoc)
        if (agentDocSnap.exists()) {
          setPageState('Profil - agent')
        } else {
          setPageState('Profil')
        }
      } else {
        setPageState('Cont')
      }
    })
  }, [auth, db])
  function pathMatchRoute(route) {
    if (route === location.pathname) {
      return true
    }
  }
  function handleProfileClick() {
    if (pageState === 'Cont') {
      navigate("/sign-in")
    } else if (pageState === 'Profil') {
      navigate("/profile")
    } else if (pageState === 'Profil - agent') {
      navigate("/profile-agent")
    }
  }
  return (
    <div className="bg-slate-500 shadow-md sticky top-0 z-50">
      <header className="flex justify-between items-center  max-w-4xl mx-auto">
        <div>
        <img src={logo} alt="logo" className="h-14 py-1 cursor-pointer active:scale-105 transition-scale duration-200 ease-in-out" onClick={() => navigate("/")}/>
        </div>
        <div>
          <ul className="flex space-x-5">
            {auth.currentUser?.email === 'admineu@real-estate-csie-degree.com' && (
              <li className={`cursor-pointer py-3 text-md font-semibold px-3 ${pathMatchRoute("/sign-up-agent") ? "text-gray-100 bg-red-500 rounded-full hover:bg-red-600 transition ease-in-out active:bg-red-700 active:scale-110 transition-scale duration-150" : "text-gray-100 opacity-90 hover:bg-red-500 rounded-full transition  active:scale-110 transition-scale duration-150 ease-in-out hover:opacity-100 active:opacity-100"}`} onClick={() => navigate("/sign-up-agent")}>
                Înregistrează agent
              </li>
            )}
            <li className={`cursor-pointer py-3 text-md text-md font-semibold px-3 ${pathMatchRoute("/") ? "text-gray-100 bg-red-500 rounded-full hover:bg-red-600 transition ease-in-out active:bg-red-700 active:scale-110 transition-scale duration-150 " : "text-gray-100 opacity-90 hover:bg-red-500 rounded-full transition hover:opacity-100  active:scale-110 transition-scale duration-150 ease-in-out active:opacity-100" }`} onClick={() => navigate("/")}>
              Acasă
            </li>
            <li className={`cursor-pointer py-3 text-md font-semibold px-3 ${pathMatchRoute("/announces") ? "text-gray-100 bg-red-500 rounded-full hover:bg-red-600 transition  active:bg-red-700 active:scale-110 transition-scale duration-150 ease-in-out" : "text-gray-100 opacity-90 hover:bg-red-500 rounded-full transition  active:scale-110 transition-scale duration-150 ease-in-out hover:opacity-100 active:opacity-100"}`} onClick={() => navigate("/announces")}>
              Anunțuri
            </li>
            <li className={`cursor-pointer py-3 text-md font-semibold px-3 ${(pathMatchRoute("/sign-in") || pathMatchRoute("/profile") || pathMatchRoute("/profile-agent")) ? "text-gray-100 bg-red-500 rounded-full hover:bg-red-600 transition  active:bg-red-700 active:scale-110 transition-scale duration-150 ease-in-out" : "text-gray-100 opacity-90 hover:bg-red-500 rounded-full transition active:scale-110 transition-scale duration-150 ease-in-out hover:opacity-100 active:opacity-100"}`} onClick={handleProfileClick}>
              {pageState}
            </li>
          </ul>
        </div>
      </header>
    </div>
  );
}