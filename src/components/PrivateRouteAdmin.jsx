import React from 'react'
import { Outlet, Navigate } from 'react-router'
import { useAuthStatusAgent } from '../hooks/useAuthStatusAgent'
import Spinner from './Spinner'

export default function PrivateRouteAdmin() {
    const { loggedIn, isAgent, checkingStatus, email } = useAuthStatusAgent()
    if (checkingStatus) {
      return <Spinner />
    }
    if (!loggedIn) {
      return <Navigate to="/sign-in" />
    }
    if (!isAgent) {
      return <Navigate to="/profile" />
    }
    if (email !== 'admineu@real-estate-csie-degree.com') {
      return <Navigate to="/profile" />
    }
    return <Outlet />
  }
