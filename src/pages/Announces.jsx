import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { collection, getDocs, limit, orderBy, query, startAfter, where } from 'firebase/firestore'
import { db } from '../firebase'
import Spinner from '../components/Spinner'
import ListingItem from '../components/ListingItem'
import { AiOutlineSearch } from 'react-icons/ai'

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
  async function onFetchMoreListings(type, property, address) {
    try {
      const listingRef = collection(db, 'listings');
      let q = query(
        listingRef,
        where('offer', '==', false),
        where('type', '==', type),
        where('property', '==', property),
        orderBy('timestamp', 'desc'),
        startAfter(lastFetchListing),
        limit(4)
      );
      if (address) {
        q = query(
          listingRef,
          where('offer', '==', false),
          where('type', '==', type),
          where('property', '==', property),
          where('address', '==', address),
          orderBy('timestamp', 'desc'),
          startAfter(lastFetchListing),
          limit(4)
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
      setListings((prevState) => [...prevState, ...listings]);
      setLoading(false);
    } catch (error) {
      toast.error('Nu s-a putut prelua anunțul');
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
          where('offer', '==', false),
          where('type', '==', type),
          where('property', '==', property),
          orderBy('timestamp', 'desc'),
          limit(8)
        );
        if (address) {
          q = query(
            listingRef,
            where('offer', '==', false),
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
    <div className='justify-center items-center'>
      <h1 className="text-3xl text-center mt-6 font-bold mb-5">Anunțuri</h1>
      <div className="flex flex-wrap mx-auto my-auto ">
        <div className=" flex flex-col mt-2 ml-7 md:w-[67%] lg:w-[15%] lg:ml-30" id="pentruMine">
          <div className="flex items-center justify-center">
            <label className="mr-4">
              <input
                type="radio"
                name="type"
                value="rent"
                checked={type === "rent"}
                onChange={handleTypeChange}
                className="mr-2"
              />
              De închiriat
            </label>
            <label>
              <input
                type="radio"
                name="type"
                value="sale"
                checked={type === "sale"}
                onChange={handleTypeChange}
                className="mr-2"
              />
              De vânzare
            </label>
          </div>
          <select name="property" value={property} onChange={handlePropertyChange} className="block w-full mt-4 px-4 py-2 rounded-md bg-gray-100 border-gray-300 focus:outline-none focus:ring focus:ring-blue-500 focus:border-blue-500">
            <option value="apartment">Apartament</option>
            <option value="house">Casă</option>
            <option value="land">Teren</option>
          </select>
          <input type="text" name="address" placeholder="Introdu o adresă..." value={address} onChange={handleAddressChange} className="block w-full mt-4 px-4 py-2 rounded-md bg-gray-100 border-gray-300 focus:outline-none focus:ring focus:ring-blue-500 focus:border-blue-500" />
          <button className="relative mt-4 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded" onClick={handleSearchClick}>
            Caută
            <AiOutlineSearch className='absolute right-3 top-1/2 transform -translate-y-1/2 text-xl cursor-pointer' />
          </button>
        </div>
        <div className="max-w-6xl  px-3" id="pentruAnunturi">
          {loading ? (
            <Spinner />
          ) : listings && listings.length > 0 ? (
            <>
              <main>
                <ul className="sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5s mb-6">
                  {listings.map((listing) => (
                    <ListingItem key={listing.id} id={listing.id} listing={listing.data} />
                  ))}
                </ul>
              </main>
              {lastFetchListing && (
                <div className="flex justify-center items-center">
                  <button className=" bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded" onClick={() => onFetchMoreListings(type, property, address)}>
                    Afișează mai multe
                  </button>

                </div>
              )}
            </>
          ) : (
            <p>Nu există anunțuri recente momentan</p>
          )}
        </div>
      </div>
    </div>
  )
}