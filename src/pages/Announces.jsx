import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { collection, getDocs, limit, orderBy, query, startAfter, where } from 'firebase/firestore'
import { db } from '../firebase'
import Spinner from '../components/Spinner'
import ListingItem from '../components/ListingItem'
import { AiOutlineSearch } from 'react-icons/ai'
import { BsFillBuildingFill } from 'react-icons/bs'

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
    <div>
      <h1 className="text-3xl text-center mt-6 font-bold mb-6">Anunțuri</h1>
      <div className='max-w-6xl mx-2 px-3'>
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-[30%] lg:w-[30%] mb-4 mr-3 md:mb-0 bg-slate-500 rounded px-2 py-2 shadow-lg" id="pentruMine">
            <div className=' bg-red-500 text-white rounded-lg flex items-center px-2 mt-1  my-4  after:border-t after:flex-1 after:border-gray-300'>
              <AiOutlineSearch className='px-1 text-4xl' />
            </div>
            <div className="flex items-center justify-center px-1 py-1 mt-6 text-gray-100">
              <label className='mr-3 text-4xl'>
                <BsFillBuildingFill className='bg-red-500 rounded px-1' />
              </label>
              <label className="mr-3 text-md font-medium">
                <input
                  type="radio"
                  name="type"
                  value="rent"
                  checked={type === "rent"}
                  onChange={handleTypeChange}
                  className="mr-1 transition ease-in-out"
                />
                Închiriere
              </label>
              <label className='text-md font-medium '>
                <input
                  type="radio"
                  name="type"
                  value="sale"
                  checked={type === "sale"}
                  onChange={handleTypeChange}
                  className="mr-1 transition ease-in-out"
                />
                Vânzare
              </label>
            </div>
            <select name="property" value={property} onChange={handlePropertyChange} className="text-md font-medium transition ease-in-out block w-full mt-6 px-4 py-2 rounded-md bg-gray-100 border-gray-300 focus:outline-none focus:ring focus:ring-blue-500 focus:border-blue-500">
              <option value="apartment">Apartament</option>
              <option value="house">Casă</option>
              <option value="land">Teren</option>
            </select>
            <input type="text" name="address" placeholder="Introdu o adresă..." value={address} onChange={handleAddressChange} className="text-md transition ease-in-out font-medium block w-full mt-6 px-4 py-2 rounded-md bg-gray-100 border-gray-300 focus:outline-none focus:ring focus:ring-blue-500 focus:border-blue-500" />
            <div className="flex justify-center mt-8">
              <button className="bg-red-500 hover:bg-red-600  text-slate-200 px-10 py-1 rounded  text-md font-medium " onClick={handleSearchClick}>
                Caută acum
              </button>
            </div>
          </div>
          <div className="w-full md:flex-2 md:w-[100%] lg:w-[100%]" id="pentruAnunturi">
            {loading ? (
              <Spinner />
            ) : listings && listings.length > 0 ? (
              <>
                <main>
                  <ul className="sm:grid sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3">
                    {listings.map((listing) => (
                      <ListingItem key={listing.id} id={listing.id} listing={listing.data} />
                    ))}
                  </ul>
                </main>

              </>
            ) : (
              <p className='text-2xl font-normal'>Nu există anunțuri momentan</p>
            )}
          </div>
        </div>
      </div>
      {lastFetchListing && (
        <div className="flex justify-center items-center">
          <button className=" bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded" onClick={() => onFetchMoreListings(type, property, address)}>
            Afișează mai multe
          </button>
        </div>
      )}
    </div>
  )
}