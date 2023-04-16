import { useEffect, useState } from 'react'
import Slider from '../components/Slider'
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore'
import { db } from '../firebase'
import { Link } from 'react-router-dom'
import ListingItem from '../components/ListingItem'
import Spinner from '../components/Spinner'

export default function Home() {
  const [offerListings, setOfferListing] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    async function fetchListings() {
      try {
        const listingsRef = collection(db, 'listings')
        const q = query(listingsRef, limit(4))
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
  const [rentListings, setRentListing] = useState(null)
  useEffect(() => {
    async function fetchListings() {
      try {
        const listingsRef = collection(db, 'listings')
        const q = query(listingsRef, where('type', '==', 'rent'), orderBy('timestamp', 'desc'), limit(4))
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
  const [saleListings, setSaleListing] = useState(null)
  useEffect(() => {
    async function fetchListings() {
      try {
        const listingsRef = collection(db, 'listings')
        const q = query(listingsRef, where('type', '==', 'sale'), orderBy('timestamp', 'desc'), limit(4))
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
  const [apartmentListings, setApartmentListing] = useState(null)
  useEffect(() => {
    async function fetchListings() {
      try {
        const listingsRef = collection(db, 'listings')
        const q = query(listingsRef, where('property', '==', 'apartment'), orderBy('timestamp', 'desc'), limit(4))
        const querySnap = await getDocs(q)
        const listings = []
        querySnap.forEach((doc) => {
          return listings.push({
            id: doc.id,
            data: doc.data(),
          })
        })
        setApartmentListing(listings)
      } catch (error) {
        console.log(error);
      }
    }
    fetchListings()
    setLoading(false)
  }, [])
  const [houseListings, setHouseListing] = useState(null)
  useEffect(() => {
    async function fetchListings() {
      try {
        const listingsRef = collection(db, 'listings')
        const q = query(listingsRef, where('property', '==', 'house'), orderBy('timestamp', 'desc'), limit(4))
        const querySnap = await getDocs(q)
        const listings = []
        querySnap.forEach((doc) => {
          return listings.push({
            id: doc.id,
            data: doc.data(),
          })
        })
        setHouseListing(listings)
      } catch (error) {
        console.log(error);
      }
    }
    fetchListings()
    setLoading(false)
  }, [])
  const [landListings, setLandListing] = useState(null)
  useEffect(() => {
    async function fetchListings() {
      try {
        const listingsRef = collection(db, 'listings')
        const q = query(listingsRef, where('property', '==', 'land'), orderBy('timestamp', 'desc'), limit(4))
        const querySnap = await getDocs(q)
        const listings = []
        querySnap.forEach((doc) => {
          return listings.push({
            id: doc.id,
            data: doc.data(),
          })
        })
        setLandListing(listings)
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
            <h2 className='px-3 text-2xl mt-6 font-semibold'>Cele mai recente anunțuri</h2>
            <Link to='/announces'>
              <p className='px-3 text-sm text-blue-600 hover:text-blue-800 transition duration-150 ease-in-out'>
                Arată mai multe anunțuri
              </p>
            </Link>
            <ul className='sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
              {offerListings.map((listing) => (
                <ListingItem key={listing.id} listing={listing.data} id={listing.id} />
              ))}
            </ul>
          </div>
        ) : (<p>Nu există oferte recente momentan</p>)}
        {/* {loading ? (<Spinner />) : apartmentListings && apartmentListings.length > 0 ? (
          <div className='m-2 mb-6'>
            <h2 className='px-3 text-2xl mt-6 font-semibold'>Apartamente</h2>
            <Link to='/property/apartment'>
              <p className='px-3 text-sm text-blue-600 hover:text-blue-800 transition duration-150 ease-in-out'>
                Arată mai multe apartamente
              </p>
            </Link>
            <ul className='sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
              {apartmentListings.map((listing) => (
                <ListingItem key={listing.id} listing={listing.data} id={listing.id} />
              ))}
            </ul>
          </div>
        ) : (<p>Nu există apartamente momentan</p>)}
        {loading ? (<Spinner />) : houseListings && houseListings.length > 0 ? (
          <div className='m-2 mb-6'>
            <h2 className='px-3 text-2xl mt-6 font-semibold'>Case</h2>
            <Link to='/property/house'>
              <p className='px-3 text-sm text-blue-600 hover:text-blue-800 transition duration-150 ease-in-out'>
                Arată mai multe case
              </p>
            </Link>
            <ul className='sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
              {houseListings.map((listing) => (
                <ListingItem key={listing.id} listing={listing.data} id={listing.id} />
              ))}
            </ul>
          </div>
        ) : (<p>Nu există case momentan</p>)}
        {loading ? (<Spinner />) : landListings && landListings.length > 0 ? (
          <div className='m-2 mb-6'>
            <h2 className='px-3 text-2xl mt-6 font-semibold'>Terenuri</h2>
            <Link to='/property/land'>
              <p className='px-3 text-sm text-blue-600 hover:text-blue-800 transition duration-150 ease-in-out'>
                Arată mai multe terenuri
              </p>
            </Link>
            <ul className='sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
              {landListings.map((listing) => (
                <ListingItem key={listing.id} listing={listing.data} id={listing.id} />
              ))}
            </ul>
          </div>
        ) : (<p>Nu există terenuri momentan</p>)} */}
        {/* {loading ? (<Spinner />) : rentListings && rentListings.length > 0 ? (
          <div className='m-2 mb-6'>
            <h2 className='px-3 text-2xl mt-6 font-semibold'>Proprietăți de închiriat</h2>
            <Link to='/category/rent'>
              <p className='px-3 text-sm text-blue-600 hover:text-blue-800 transition duration-150 ease-in-out'>
                Arată mai multe proprietăți de închiriat
              </p>
            </Link>
            <ul className='sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
              {rentListings.map((listing) => (
                <ListingItem key={listing.id} listing={listing.data} id={listing.id} />
              ))}
            </ul>
          </div>
        ) : (<p>Nu există proprietăți de închiriat momentan</p>)}
        {loading ? (<Spinner />) : saleListings && saleListings.length > 0 ? (
          <div className='m-2 mb-6'>
            <h2 className='px-3 text-2xl mt-6 font-semibold'>Proprietăți de vânzare</h2>
            <Link to='/category/sale'>
              <p className='px-3 text-sm text-blue-600 hover:text-blue-800 transition duration-150 ease-in-out'>
                Arată mai multe proprietăți de vânzare
              </p>
            </Link>
            <ul className='sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
              {saleListings.map((listing) => (
                <ListingItem key={listing.id} listing={listing.data} id={listing.id} />
              ))}
            </ul>
          </div>
        ) : (<p>Nu există proprietăți de vânzare momentan</p>)} */}
      </div>
    </div>
  )
}