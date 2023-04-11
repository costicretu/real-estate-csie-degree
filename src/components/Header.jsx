import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { db } from "../firebase";

export default function Header() {
  const [pageState, setPageState] = useState('Sign in')
  const location = useLocation()
  const navigate = useNavigate()
  const auth = getAuth()

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Check if the authenticated user is also an agent
        const agentDoc = doc(db, 'agents', user.uid)
        const agentDocSnap = await getDoc(agentDoc)
        if (agentDocSnap.exists()) {
          setPageState('Profile agent')
        } else {
          setPageState('Profile')
        }
      } else {
        setPageState('Sign in')
      }
    })
  }, [auth, db])

  function pathMatchRoute(route) {
    if (route === location.pathname) {
      return true
    }
  }

  function handleProfileClick() {
    if (pageState === 'Sign in') {
      navigate("/sign-in")
    } else if (pageState === 'Profile') {
      navigate("/profile")
    } else if (pageState === 'Profile agent') {
      navigate("/profile-agent")
    }
  }

  return (
    <div className="bg-white border-b shadow-sm sticky top-0 z-50">
      <header className="flex justify-between items-center px-3 max-w-6xl mx-auto">
        <div>
          <img src="https://static.rdc.moveaws.com/images/logos/rdc-logo-default.svg" alt="logo"
            className="h-5 cursor-pointer" onClick={() => navigate("/")}
          />
        </div>
        <div>
          <ul className="flex space-x-10">
            <li className={`cursor-pointer py-3 text-sm font-semibold text-gray-400 border-b-[3px] border-b-transparent 
            ${pathMatchRoute("/") && "text-black border-b-red-500"}`} onClick={() => navigate("/")}>
              Home</li>
            <li className={`cursor-pointer py-3 text-sm font-semibold text-gray-400 border-b-[3px] border-b-transparent 
            ${pathMatchRoute("/offers") && "text-black border-b-red-500"}`} onClick={() => navigate("/offers")}>
              Offers</li>
            <li className={`cursor-pointer py-3 text-sm font-semibold text-gray-400 border-b-[3px] border-b-transparent 
            ${(pathMatchRoute("/sign-in") || pathMatchRoute("/profile") || pathMatchRoute("/profile-agent")) && "text-black border-b-red-500"}`} onClick={handleProfileClick}>
              {pageState}</li>
          </ul>
        </div>
      </header>
    </div>
  );
}