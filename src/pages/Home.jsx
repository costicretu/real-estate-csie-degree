import { useEffect, useState } from 'react'
import Slider from '../components/Slider'
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore'
import { db } from '../firebase'
import { Link } from 'react-router-dom'
import ListingItem from '../components/ListingItem'
import Spinner from '../components/Spinner'

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
    <div className='absolute top-0 left-0 w-full h-full z-10'>
      <Slider />
    </div>
    <div className='relative z-20 max-w-6xl mx-auto pt-4 space-y-6'>
      {loading ? (<Spinner />) : offerListing && offerListing.length > 0 ? (
        <div className='m-2 mb-6'>
          <h2 className='px-3 text-2xl mt-6 font-semibold'>Cele mai recente oferte</h2>
          <Link to='/offers'>
            <p className='px-3 text-sm text-blue-600 hover:text-blue-800 transition duration-150 ease-in-out'>
              Arată mai multe oferte
            </p>
          </Link>
          <ul className='sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {offerListing.map((listing) => (
              <ListingItem key={listing.id} listing={listing.data} id={listing.id} />
            ))}
          </ul>
        </div>
      ) : (<p>Nu există oferte recente momentan</p>)}
    </div>
  </div>
  )
}