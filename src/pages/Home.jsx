import { useEffect, useState } from 'react'
import Slider from '../components/Slider'
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore'
import { db } from '../firebase'
import { Link } from 'react-router-dom'
import ListingItem from '../components/ListingItem'
import Spinner from '../components/Spinner'
import { BsBoxArrowUpRight } from 'react-icons/bs'

export default function Home() {
  const [loading, setLoading] = useState(true)
  const [offerListing, setOfferListing] = useState(null)
  useEffect(() => {
    async function fetchListings() {
      try {
        const listingsRef = collection(db, 'listings')
        const q = query(listingsRef, where('offer', '==', true), orderBy('timestamp', 'desc'), limit(4))
        const querySnap = await getDocs(q)
        const listings = []
        querySnap.forEach((doc) => {
          return listings.push({
            id: doc.id,
            data: doc.data(),
          })
        })
        setOfferListing(listings)
      } catch (error) {
        console.log(error);
      }
    }
    fetchListings()
    setLoading(false)
  }, [])
  return (
    <div className='relative'>
      <div className='absolute top-0 left-0 z-10'>
        <Slider />
      </div>
      <div className='relative z-20 max-w-6xl mx-auto pt-4 space-y-6'>
        {loading ? (<Spinner />) : offerListing && offerListing.length > 0 && (
          <div>
            <div className='flex bg-slate-500 rounded-lg'>
              <div className='flex-1 flex'>
                <h2 className='py-2 px-3 text-2xl font-semibold text-gray-100 rounded-full shadow-2xl'>
                  Cele mai recente oferte
                </h2>
              </div>
              <div className='flex items-center justify-center text-xl font-thin'>
                <Link to='/offers'>
                  <p className='px-3 py-1 bg-gray-300 rounded-md mr-1  text-blue-500 hover:text-blue-700 transition font-semibold  flex items-center'>
                    Mai multe oferte?
                    <BsBoxArrowUpRight className='inline-block ml-2 text-2xl' />
                  </p>
                </Link>
              </div>
            </div>
            <ul className='sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
              {offerListing.map((listing) => (
                <ListingItem key={listing.id} listing={listing.data} id={listing.id} />
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}