import { useEffect, useState } from 'react'
import Slider from '../components/Slider'
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore'
import { db } from '../firebase'
import { Link } from 'react-router-dom'
import ListingItem from '../components/ListingItem'
import Spinner from '../components/Spinner'

export default function Home() {
  // offers
  const [offerListings, setOfferListing] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    async function fetchListings() {
      try {
        // get reference
        const listingsRef = collection(db, 'listings')
        // create the condition of that request
        const q = query(listingsRef, where('offer', '==', true), orderBy('timestamp', 'desc'), limit(4))
        // execute the query
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
  // rent
  const [rentListings, setRentListing] = useState(null)
  useEffect(() => {
    async function fetchListings() {
      try {
        // get reference
        const listingsRef = collection(db, 'listings')
        // create the condition of that request
        const q = query(listingsRef, where('type', '==', 'rent'), orderBy('timestamp', 'desc'), limit(4))
        // execute the query
        const querySnap = await getDocs(q)
        const listings = []
        querySnap.forEach((doc) => {
          return listings.push({
            id: doc.id,
            data: doc.data(),
          })
        })
        setRentListing(listings)
      } catch (error) {
        console.log(error);
      }
    }
    fetchListings()
    setLoading(false)
  }, [])
  // sale
  const [saleListings, setSaleListing] = useState(null)
  useEffect(() => {
    async function fetchListings() {
      try {
        // get reference
        const listingsRef = collection(db, 'listings')
        // create the condition of that request
        const q = query(listingsRef, where('type', '==', 'sale'), orderBy('timestamp', 'desc'), limit(4))
        // execute the query
        const querySnap = await getDocs(q)
        const listings = []
        querySnap.forEach((doc) => {
          return listings.push({
            id: doc.id,
            data: doc.data(),
          })
        })
        setSaleListing(listings)
      } catch (error) {
        console.log(error);
      }
    }
    fetchListings()
    setLoading(false)
  }, [])
  return (
    <div>
      <Slider />
      <div className='max-w-6xl mx-auto pt-4 space-y-6'>
        {loading ? (<Spinner />) : offerListings && offerListings.length > 0 ? (
          <div className='m-2 mb-6'>
            <h2 className='px-3 text-2xl mt-6 font-semibold'>Recent offers</h2>
            <Link to='/offers'>
              <p className='px-3 text-sm text-blue-600 hover:text-blue-800 transition duration-150 ease-in-out'>
                Show more offers
              </p>
            </Link>
            <ul className='sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
              {offerListings.map((listing)=>(
                <ListingItem key={listing.id} listing={listing.data} id={listing.id}/>
              ))}
            </ul>
          </div>
        ) : (<p>There are no recent offers</p>)}
        {loading ? (<Spinner />) : rentListings && rentListings.length > 0 ? (
          <div className='m-2 mb-6'>
            <h2 className='px-3 text-2xl mt-6 font-semibold'>Places for rent</h2>
            <Link to='/category/rent'>
              <p className='px-3 text-sm text-blue-600 hover:text-blue-800 transition duration-150 ease-in-out'>
                Show more places for rent
              </p>
            </Link>
            <ul className='sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
              {rentListings.map((listing)=>(
                <ListingItem key={listing.id} listing={listing.data} id={listing.id}/>
              ))}
            </ul>
          </div>
        ): (<p>There are no current rent listings</p>)}
        {loading ? (<Spinner />) : saleListings && saleListings.length > 0 ? (
          <div className='m-2 mb-6'>
            <h2 className='px-3 text-2xl mt-6 font-semibold'>Places for sale</h2>
            <Link to='/category/sale'>
              <p className='px-3 text-sm text-blue-600 hover:text-blue-800 transition duration-150 ease-in-out'>
                Show more places for sale
              </p>
            </Link>
            <ul className='sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
              {saleListings.map((listing)=>(
                <ListingItem key={listing.id} listing={listing.data} id={listing.id}/>
              ))}
            </ul>
          </div>
        ): (<p>There are no current sale listings</p>)}
      </div>
    </div>
  )
}
