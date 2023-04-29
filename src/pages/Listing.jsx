import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import Spinner from "../components/Spinner";
import { Swiper, SwiperSlide } from 'swiper/react'
import SwiperCore, { EffectFade, Autoplay, Navigation, Pagination } from 'swiper'
import 'swiper/css/bundle'
import { FaShare, FaMapMarkerAlt, FaBed, FaBath, FaParking, FaChair } from 'react-icons/fa'
import { FiMap } from 'react-icons/fi'
import { getAuth } from 'firebase/auth'
import Contact from '../components/Contact';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { BsFillArrowDownCircleFill } from 'react-icons/bs'

export default function Listing() {
    const auth = getAuth()
    const params = useParams()
    const [listing, setListing] = useState(null)
    const [loading, setLoading] = useState(true)
    const [shareLinkCopied, setShareLinkCopied] = useState(false)
    const [contactLandLord, setContactLandLord] = useState(false)
    const [details, setDetails] = useState(false)
    SwiperCore.use([Autoplay, Navigation, Pagination])
    useEffect(() => {
        async function fetchListing() {
            const docRef = doc(db, 'listings', params.listingId)
            const docSnap = await getDoc(docRef)
            if (docSnap.exists()) {
                setListing(docSnap.data())
                setLoading(false)
            }
        }
        fetchListing()
    }, [params.listingId])
    if (loading) {
        return <Spinner />
    }
    return (
        <main>
            <div className="m-10 flex flex-col md:flex-row max-w-7xl lg:mx-auto p-4 rounded-lg shadow-lg bg-white lg:space-x-5 relative">
                <div className="w-full lg:h-[600px] md:h-[500px] z-10 overflow-x-hidden overflow-y-hidden mt-6 md:mt-0 md:ml-2">
                    <p className='text-2xl font-bold mb-1 text-blue-900'>
                        {listing.title} - €{" "}
                        {listing.offer
                            ? listing.discountedPrice
                                .toString()
                                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            : listing.regularPrice
                                .toString()
                                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        {listing.type === "rent" ? " / lună" : ""}
                    </p>
                    <div className='flex justify-start items-center space-x-4 w-[75%]'>
                        <p className='w-full max-w-[200px] bg-green-800 rounded p-1 text-white text-center font-semibold shadow-md'>
                            {listing.offer && (
                                <p>
                                    €{+listing.regularPrice - +listing.discountedPrice} discount
                                </p>
                            )}
                            {listing.property === 'apartment' && (
                                <p>Apartament</p>
                            )}
                            {listing.property === 'house' && (
                                <p>Casă</p>
                            )}
                            {listing.property === 'land' && (
                                <p>Teren</p>
                            )}
                        </p>
                        <p className='bg-red-800 w-full max-w[200px] rounded-md p-1 text-white text-center font-semibold shadow-md'>
                            {listing.type === 'rent' ? 'De închiriat' : 'De vânzare'}
                        </p>
                    </div>
                    <Swiper slidesPerView={1} navigation pagination={{ type: "progressbar" }} effect='fade' modules={[EffectFade]}>
                        {listing.imgUrls.map((url, index) => (
                            <SwiperSlide key={index}>
                                <div className='relative w-full overflow-hidden h-[400px]' style={{ background: `url(${listing.imgUrls[index]}) center no-repeat`, backgroundSize: 'cover' }}>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                    {listing.property === 'land' ? (
                        <ul className='flex items-center space-x-2 lg:space-x-10 text-sm font-semibold mb-6'>
                            <li className='flex items-center whitespace-nowrap'>
                                <FiMap className='text-lg mr-1' />
                                {listing.utilSurface}
                            </li>
                        </ul>
                    ) : (
                        <ul className='flex items-center space-x-2 lg:space-x-10 text-sm font-semibold mb-6'>
                            <li className='flex items-center whitespace-nowrap'>
                                <FaBed className='text-lg mr-1' />
                                {+listing.rooms > 1 ? `${listing.rooms} camere` : '1 cameră'}
                            </li>
                            <li className='flex items-center whitespace-nowrap'>
                                <FaBath className='text-lg mr-1' />
                                {+listing.bathrooms > 1 ? `${listing.bathrooms} băi` : '1 baie'}
                            </li>
                            <li className='flex items-center whitespace-nowrap'>
                                <FaParking className='text-lg mr-1' />
                                {+listing.parking ? 'Loc de parcare' : 'X parcare'}
                            </li>
                            <li className='flex items-center whitespace-nowrap'>
                                <FaChair className='text-lg mr-1' />
                                {+listing.furnished ? 'Mobilat' : 'Nemobilat'}
                            </li>
                        </ul>
                    )}
                    <p className='mt-3 mb-3 '>
                        <div className='relative'>
                            <span className='font-semibold'>Detalii adiționale </span>
                            <button onClick={() => setDetails()}></button>
                            {details ? (<BsFillArrowDownCircleFill  onClick={() => setDetails((prevState) => !prevState)} />)
                                : (<BsFillArrowDownCircleFill  onClick={() => setDetails((prevState) => !prevState)} />)}
                                {details && (
                                    <div>
                                        {listing.description}
                                    </div>
                                )}
                        </div>
                    </p>
                </div>
                <div className="lg:w-[500px] md:w-[500px] lg:h-[500px] md:h-[500px]" id='a'>
                    <div className='mt-5 rounded-md w-[400px] h-[300px] overflow-hidden'>
                        <p className='flex items-center  mb-1 font-semibold'>
                            <FaMapMarkerAlt className='text-green-700 mr-1' />
                            {listing.address}
                        </p>
                        <MapContainer center={[listing.geolocation.lat, listing.geolocation.lng]}
                            zoom={13} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <Marker position={[listing.geolocation.lat, listing.geolocation.lng]}>
                                <Popup>
                                    Locația se află aici<br />
                                </Popup>
                            </Marker>
                        </MapContainer>
                    </div>
                    {listing.userRef !== auth.currentUser?.uid && !contactLandLord && (
                        <div className='mt-6'>
                            <button onClick={() => setContactLandLord(true)} className='px-7 py-3 bg-blue-600 text-white font-medium text-sm uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg w-full text-center transition duration-150 ease-in-out'>
                                Contactează agent
                            </button>
                        </div>
                    )}
                    {contactLandLord && (
                        <Contact userRef={listing.userRef} listing={listing} />
                    )}
                </div>
                <div className="absolute top-1 right-1 z-10 bg-white cursor-pointer border-2 border-gray-400 rounded-full w-12 h-12 flex justify-center items-center" id='share'
                    onClick={() => {
                        navigator.clipboard.writeText(window.location.href)
                        setShareLinkCopied(true)
                        setTimeout(() => {
                            setShareLinkCopied(false)
                        }, 2000)
                    }}>
                    <FaShare className='text-lg text-slate-500' />
                </div>
                {shareLinkCopied && (
                    <p className='fixed top-[10%] right-[11%] font-semibold border-2 border-gray-400 rounded-md bg-white z-10 p-2'>Link copiat</p>
                )}
            </div>
        </main>
    )
}