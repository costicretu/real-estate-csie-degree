import { useEffect, useState } from 'react'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { db } from '../firebase'
import { doc, getDoc } from 'firebase/firestore'

export function useAuthStatusAgent() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [isAgent, setIsAgent] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(true)
  const [email, setEmail] = useState('')
  useEffect(() => {
    const auth = getAuth()
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setLoggedIn(true)
        setEmail(user.email)
        const userDocRef = doc(db, 'agents', user.uid)
        const userDocSnap = await getDoc(userDocRef)
        setIsAgent(userDocSnap.exists())
      } else {
        setIsAgent(false)
      }
      setCheckingStatus(false)
    })
    return () => {
      unsubscribeAuth()
    }
  }, [])
  return { loggedIn, isAgent, checkingStatus, email }
}
