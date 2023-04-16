import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { collection, getDocs, limit, orderBy, query, startAfter, where } from 'firebase/firestore'
import { db } from '../firebase'
import Spinner from '../components/Spinner'
import ListingItem from '../components/ListingItem'

export default function Announces() {
  const [listings, setListings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastFetchListing, setLastFetchListing] = useState(null)
  useEffect(() => {
    async function fetchListings() {
      try {
        const listingRef = collection(db, 'listings')
        const q = query(listingRef, where('offer', '==', false), orderBy('timestamp', 'desc'), limit(8))
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
        toast.error('Nu s-a putut prelua anunțul')
      }
    }
    fetchListings()
  }, [])
  const [type, setType] = useState('rent')
  const [property, setProperty] = useState('apartment')
  const [address, setAddress] = useState('')
  async function onFetchMoreListings() {
    try {
      const listingRef = collection(db, 'listings')
      const q = query(listingRef, orderBy('timestamp', 'desc'), startAfter(lastFetchListing), limit(4))
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
      toast.error('Nu s-a putut prelua anunțul')
    }
  }
  function handleTypeChange(event) {
    setType(event.target.value)
  }
  function handlePropertyChange(event) {
    setProperty(event.target.value)
  }
  function handleAddressChange(event) {
    setAddress(event.target.value)
  }
  function handleSearchClick() {
    setLoading(true);
    async function fetchListings() {
      try {
        const listingRef = collection(db, 'listings');
        let q = query(
          listingRef,
          where('type', '==', type),
          where('property', '==', property),
          orderBy('timestamp', 'desc'),
          limit(8)
        );
        if (address) {
          q = query(
            listingRef,
            where('type', '==', type),
            where('property', '==', property),
            where('address', '==', address),
            orderBy('timestamp', 'desc'),
            limit(8)
          );
        }
        const querySnap = await getDocs(q);
        const lastVisible = querySnap.docs[querySnap.docs.length - 1];
        setLastFetchListing(lastVisible);
        const listings = [];
        querySnap.forEach((doc) => {
          return listings.push({
            id: doc.id,
            data: doc.data(),
          });
        });
        setListings(listings);
        setLoading(false);
      } catch (error) {
        toast.error('Nu s-a putut prelua anunțul');
      }
    }
    fetchListings();
  }
  return (
    <div className='max-w-6xl mx-auto px-3'>
      <div className="flex flex-col items-start" id="pentruMine">
        <select name="type" className="mr-2" value={type} onChange={handleTypeChange}>
          <option value="rent">De închiriat</option>
          <option value="sale">De vânzare</option>
        </select>
        <select name="property" value={property} onChange={handlePropertyChange}>
          <option value="apartment">Apartament</option>
          <option value="house">Casă</option>
          <option value="land">Teren</option>
        </select>
        <input type="text" name="address" placeholder="Introdu o adresă..." value={address} onChange={handleAddressChange} />
        <button className="ml-2 bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded" onClick={handleSearchClick}>
          Search
        </button>
      </div>
      <h1 className='text-3xl text-center mt-6 font-bold'>Anunțuri</h1>
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
      ) : (<p>Nu există anunțuri recente momentan</p>)}
    </div>
  )
}