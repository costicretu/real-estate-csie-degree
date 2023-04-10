import React from 'react'
import { Outlet, Navigate } from 'react-router'
import { useAuthStatusAgent } from '../hooks/useAuthStatusAgent'
import Spinner from './Spinner'

export default function PrivateRoute() {
    const { loggedIn,isAgent, checkingStatus } = useAuthStatusAgent()
    if (checkingStatus) {
        return <Spinner/>
    }
    if (!loggedIn) {
        return <Navigate to="/sign-in" />
      }
    
      if (!isAgent) {
        // Redirect to a non-agent page if the user is not an agent
        return <Navigate to="/profile" />
      }
    return <Outlet />
}
