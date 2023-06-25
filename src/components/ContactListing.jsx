import React, { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { toast } from 'react-toastify'
import { RiAccountCircleFill } from 'react-icons/ri'

export default function Contact({ userRef, listing }) {
    const [landlord, setLandLord] = useState(null)
    useEffect(() => {
        async function getLandLord() {
            const docRef = doc(db, 'agents', userRef)
            const docSnap = await getDoc(docRef)
            if (docSnap.exists()) {
                setLandLord(docSnap.data())
            } else {
                toast.error('Nu am putut prelua datele agentului')
            }
        }
        getLandLord()
    }, [userRef])
    return (
        <>{landlord !== null && (
            <div className='flex items-center'>
                <RiAccountCircleFill className='mr-1 text-5xl text-gray-400' />

                <div>
                    <p className='text-lg font-medium'>{landlord.nameAgent}</p>
                    {landlord.phone !== 0 && (
                        <p className='text-base text-red-600 font-semibold '>T: {landlord.phone}</p>
                    )}
                </div>
            </div>
        )}</>
    )
}
