import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { db } from "../firebase";
import { useAuthStatusAgent } from '../hooks/useAuthStatusAgent'

export default function Header() {
  const [pageState, setPageState] = useState('Conectează-te')
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
          setPageState('Profil agent')
        } else {
          setPageState('Profil')
        }
      } else {
        setPageState('Conectează-te')
      }
    })
  }, [auth, db])
  function pathMatchRoute(route) {
    if (route === location.pathname) {
      return true
    }
  }
  function handleProfileClick() {
    if (pageState === 'Conectează-te') {
      navigate("/sign-in")
    } else if (pageState === 'Profil') {
      navigate("/profile")
    } else if (pageState === 'Profil agent') {
      navigate("/profile-agent")
    }
  }
  return (
    <div className="bg-slate-600 shadow-sm sticky top-0 z-50">
      <header className="flex justify-between items-center px-3 max-w-6xl mx-auto">
        <div>
          <img src="https://static.rdc.moveaws.com/images/logos/rdc-logo-default.svg" alt="logo"
            className="h-5 cursor-pointer" onClick={() => navigate("/")}
          />
        </div>
        <div>
          <ul className="flex space-x-10">
            {auth.currentUser?.email === 'admineu@real-estate-csie-degree.com' && (
              <li className={`cursor-pointer py-3 text-sm font-semibold text-gray-400 border-b-[3px] border-b-transparent 
                ${pathMatchRoute("/sign-up-agent") && "text-black border-b-red-500"}`}
                id="pentruInregistrare"
                onClick={() => navigate("/sign-up-agent")}
              >
                Înregistrează agent
              </li>
            )}
            <li className={`cursor-pointer py-3 text-sm font-semibold text-gray-400 border-b-[3px] border-b-transparent 
              ${pathMatchRoute("/") && "text-black border-b-red-500"}`} onClick={() => navigate("/")}>
              Acasă</li>
            <li className={`cursor-pointer py-3 text-sm font-semibold text-gray-400 border-b-[3px] border-b-transparent 
              ${pathMatchRoute("/announces") && "text-black border-b-red-500"}`} onClick={() => navigate("/announces")}>
              Anunțuri</li>
            <li className={`cursor-pointer py-3 text-sm font-semibold text-gray-400 border-b-[3px] border-b-transparent 
              ${(pathMatchRoute("/sign-in") || pathMatchRoute("/profile") || pathMatchRoute("/profile-agent")) && "text-black border-b-red-500"}`}
              onClick={handleProfileClick}>
              {pageState}</li>
          </ul>
        </div>
      </header>
    </div>
  );
}