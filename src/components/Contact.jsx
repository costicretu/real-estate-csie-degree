import React, { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { toast } from 'react-toastify'

export default function Contact({ userRef, listing }) {
    const [landlord, setLandLord] = useState(null)
    const [message, setMessage] = useState('')
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
    function onChange(e) {
        setMessage(e.target.value)
    }
    return (
        <>{landlord !== null && (
            <div className='flex flex-col w-full'>
                <div className='mt-3'>
                    <textarea placeholder='Scrie un mesaj...' name="message" id="message" rows="2" value={message} onChange={onChange} className='w-full px-2 py-1 text-xl h-[80px] bg-white border-gray-300 rounded transition duration-150 ease-in-out focus:border-red-500 focus:ring-2 focus:ring-red-500'>
                    </textarea>
                </div>
                <a href={`mailto:${landlord.emailAgent}?Subject=${listing.title}&body=${message}`} className='text-center'>
                    <button className='bg-gray-300 text-black px-5 py-2 text-lg font-medium uppercase rounded-2xl shadow-md hover:bg-gray-400 hover:text-white transition duration-150 ease-in-out hover:shadow-lg active:bg-gray-500 active:text-white' type='button'>
                        Trimite mesaj
                    </button>
                </a>
            </div>
        )}</>
    )
}
