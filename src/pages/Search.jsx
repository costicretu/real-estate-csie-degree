import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { collection, getDocs, limit, orderBy, query, startAfter, where } from 'firebase/firestore'
import { db } from '../firebase'
import Spinner from '../components/Spinner'
import ListingItem from '../components/ListingItem'
import { useParams } from 'react-router-dom'

export default function Search() {
    const [listings, setListings] = useState(null)
    const [loading, setLoading] = useState(true)
    const [lastFetchListing, setLastFetchListing] = useState(null)
    const params = useParams()
    useEffect(() => {
        async function fetchListings() {
            try {
                const listingRef = collection(db, 'listings')
                const addressWords = params.addressName.split(' ')
                const q = query(listingRef,
                    where('type', '==', params.categoryName),
                    where('property', '==', params.propertyName),
                    where('address', 'array-contains-any', addressWords),
                    orderBy('timestamp', 'desc'),
                    limit(8))
                const querySnap = await getDocs(q)
                const lastVisible = querySnap.docs[querySnap.docs.length - 1]
                setLastFetchListing(lastVisible)
                const listings = []
                querySnap.forEach((doc) => {
                    return listings.push({
                        id: doc.id,
                        data: doc.data(),
                    })
                })
                setListings(listings)
                setLoading(false)
            } catch (error) {
                //toast.error('Nu s-a putut prelua listarea')
            }
        }
        fetchListings()
    }, [params.categoryName, params.propertyName, params.addressName])
    useEffect(() => {
        async function fetchListings() {
            try {
                const listingRef = collection(db, 'listings')
                const q = query(listingRef,
                    where('type', '==', params.categoryName),
                    where('property', '==', params.propertyName),
                    orderBy('timestamp', 'desc'),
                    limit(8))
                const querySnap = await getDocs(q)
                const lastVisible = querySnap.docs[querySnap.docs.length - 1]
                setLastFetchListing(lastVisible)
                const listings = []
                querySnap.forEach((doc) => {
                    return listings.push({
                        id: doc.id,
                        data: doc.data(),
                    })
                })
                setListings(listings)
                setLoading(false)
            } catch (error) {
                //toast.error('Nu s-a putut prelua listarea')
            }
        }
        fetchListings()
    }, [params.categoryName, params.propertyName])
    async function onFetchMoreListings() {
        try {
            const listingRef = collection(db, 'listings')
            const addressWords = params.addressName.split(' ')
            const q = query(listingRef,
                where('type', '==', params.categoryName),
                where('property', '==', params.propertyName),
                where('address', 'array-contains-any', addressWords),
                orderBy('timestamp', 'desc'),
                limit(4))
            const querySnap = await getDocs(q)
            const lastVisible = querySnap.docs[querySnap.docs.length - 1]
            setLastFetchListing(lastVisible)
            const listings = []
            querySnap.forEach((doc) => {
                return listings.push({
                    id: doc.id,
                    data: doc.data(),
                })
            })
            setListings((prevState) => [...prevState, ...listings])
            setLoading(false)
        } catch (error) {
            //toast.error('Nu s-a putut prelua listarea')
        }
    }
    async function onFetchMoreListings() {
        try {
            const listingRef = collection(db, 'listings')
            const q = query(listingRef,
                where('type', '==', params.categoryName),
                where('property', '==', params.propertyName),
                orderBy('timestamp', 'desc'), startAfter(lastFetchListing), limit(4))
            const querySnap = await getDocs(q)
            const lastVisible = querySnap.docs[querySnap.docs.length - 1]
            setLastFetchListing(lastVisible)
            const listings = []
            querySnap.forEach((doc) => {
                return listings.push({
                    id: doc.id,
                    data: doc.data(),
                })
            })
            setListings((prevState) => [...prevState, ...listings])
            setLoading(false)
        } catch (error) {
            //toast.error('Nu s-a putut prelua listarea')
        }
    }
    return (
        <div className='max-w-6xl mx-auto px-3'>
            <h1 className='text-3xl text-center mt-6 font-bold'>
                {params.propertyName === 'apartment' ? 'Apartamente' + (params.categoryName === 'rent' ? '  de inchiriat' : ' de vânzare') :
                    (params.propertyName === 'house' ? 'Case' + (params.categoryName === 'rent' ? ' de inchiriat' : ' de vânzare') :
                        (params.propertyName === 'land' ? 'Terenuri' + (params.categoryName === 'rent' ? ' de inchiriat' : ' de vânzare') : '')
                    )
                }
            </h1>
            {loading ? (<Spinner />) : listings && listings.length > 0 ? (
                <>
                    <main>
                        <ul className='sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 mb-6'>
                            {listings.map((listing) => (
                                <ListingItem key={listing.id} id={listing.id} listing={listing.data} />
                            ))}
                        </ul>
                    </main>
                    {lastFetchListing && (
                        <div className='flex justify-center items-center'>
                            <button onClick={onFetchMoreListings} className='bg-white px-3 py-1.5 text-gray-700 border mb-6 mt-6 hover: border-slate-600 rounded transition duration-150 ease-in-out'>Afișează mai multe</button>
                        </div>
                    )}
                </>
            ) : (
                <p>Momentan nu există
                    {params.propertyName === 'apartment' ? ' apartamente' + (params.categoryName === 'rent' ? '  de inchiriat' : ' de vânzare') :
                        (params.propertyName === 'house' ? ' case' + (params.categoryName === 'rent' ? ' de inchiriat' : ' de vânzare') :
                            (params.propertyName === 'land' ? ' terenuri' + (params.categoryName === 'rent' ? ' de inchiriat' : ' de vânzare') : '')
                        )
                    }
                </p>
            )}
        </div>
    )
}