import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import Spinner from "../components/Spinner";
import { Swiper, SwiperSlide } from 'swiper/react'
import SwiperCore, { EffectFade, Autoplay, Navigation, Pagination } from 'swiper'
import 'swiper/css/bundle'
import { FaShareSquare, FaMapMarkerAlt, FaBed, FaBath, FaChair } from 'react-icons/fa'
import { getAuth } from 'firebase/auth'
import Contact from '../components/Contact';
import ContactListing from '../components/ContactListing';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { BsFillArrowDownCircleFill, BsFillArrowUpCircleFill } from 'react-icons/bs'
import { GiStairs } from 'react-icons/gi'
import { TbParking, TbParkingOff } from 'react-icons/tb'

export default function Listing() {
    const auth = getAuth()
    const params = useParams()
    const [listing, setListing] = useState(null)
    const [loading, setLoading] = useState(true)
    const [contactLandLord, setContactLandLord] = useState(false)
    const [detailsVisible, setDetailsVisible] = useState(false);
    const [shareLinkCopied, setShareLinkCopied] = useState(false);
    const toggleDetails = () => {
        setDetailsVisible((prevState) => !prevState);
    };
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
            <div className="m-5 flex flex-col md:flex-row max-w-7xl lg:mx-auto p-2 rounded-lg shadow-lg bg-white lg:space-x-5 relative">
                <div className="w-full max-h-[900px] h-full  overflow-x-hidden overflow-y-hidden mt-6 md:mt-0 md:ml-2">
                    <div className='relative h-full mb-2 text-2xl'>
                        <div className='font-normal mb-1' id='a'>
                            {listing.title} {" "}
                        </div>
                        {listing.offer ? (
                            <div className='text-lg absolute right-0 top-0 w-[40%] h-full'>
                                <div className='flex space-x-4'>
                                    <p className='w-full bg-red-500 rounded-lg p-1 text-white text-center font-semibold '>
                                        {listing.offer
                                            ? listing.discountedPrice
                                                .toString()
                                                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                            : listing.regularPrice
                                                .toString()
                                                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                        €{listing.type === "rent" ? " / lună" : ""}
                                    </p>
                                    {listing.offer && (
                                        <div className='w-full bg-green-800 text-center p-1 font-semibold rounded-lg text-white'>
                                            <p>
                                                {+listing.regularPrice - +listing.discountedPrice}€ discount
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className='text-lg absolute right-0 top-0 w-[20%] h-full'>
                                <div className='flex space-x-4'>
                                    <p className='w-full bg-red-500 rounded-lg p-1 text-white text-center font-semibold '>
                                        {listing.offer
                                            ? listing.discountedPrice
                                                .toString()
                                                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                            : listing.regularPrice
                                                .toString()
                                                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                        €{listing.type === "rent" ? " / lună" : ""}
                                    </p>
                                    {listing.offer && (
                                        <div className='w-full bg-green-800 text-center p-1 font-semibold rounded-lg text-white'>
                                            <p>
                                                {+listing.regularPrice - +listing.discountedPrice}€ discount
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    <Swiper slidesPerView={1} navigation pagination={{ type: "progressbar" }} effect='fade' modules={[EffectFade]}>
                        {listing.imgUrls.map((url, index) => (
                            <SwiperSlide key={index}>
                                <div className='relative w-full overflow-hidden h-[450px]' style={{ background: `url(${listing.imgUrls[index]}) center no-repeat`, backgroundSize: 'cover' }}>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                    <h2 className='text-2xl mt-1 text-red-600 font-semibold'>Specificații</h2>
                    <div className="flex items-center mt-1 before:border-t-2  before:flex-1 before:border-gray-300 after:border-t-2 after:flex-1 after:border-gray-300 " />
                    {listing.property === 'apartment' && (
                        <div>
                            <ul className='list-none space-y-2 mt-1 text-lg'>
                                <li className='list-inside' style={{ '--tw-text-opacity': '1' }}>
                                    <span className='mr-1 text-2xl' style={{ '--tw-text-opacity': '1' }}>•</span>
                                    <span className='font-semibold'>Tip compartimentare:</span>
                                    <span className='text-gray-700'> {listing.partitioning}</span>
                                </li>
                                <li className='list-inside' style={{ '--tw-text-opacity': '1' }}>
                                    <span className='mr-1 text-2xl' style={{ '--tw-text-opacity': '1' }}>•</span>
                                    <span className='font-semibold'>Suprafață utilă:</span>
                                    <span className='text-gray-700'> {listing.utilSurface}mp</span>
                                </li>
                                <li className='list-inside' style={{ '--tw-text-opacity': '1' }}>
                                    <span className='mr-1 text-2xl' style={{ '--tw-text-opacity': '1' }}>•</span>
                                    <span className='font-semibold'>An clădire:</span>
                                    <span className='text-gray-700'> {listing.constructionYear}</span>
                                </li>
                            </ul>
                            <ul className='flex items-center space-x-2 lg:space-x-10 text-md font-semibold ml-1 mt-3'>
                                <li className='flex items-center whitespace-nowrap'>
                                    <FaBed className='text-lg mr-1' />
                                    {+listing.rooms > 1 ? `${listing.rooms} camere` : '1 cameră'}
                                </li>
                                <li className='flex items-center whitespace-nowrap'>
                                    <FaBath className='text-lg mr-1' />
                                    {+listing.bathrooms > 1 ? `${listing.bathrooms} băi` : '1 baie'}
                                </li>
                                <li className='flex items-center whitespace-nowrap'>
                                    <GiStairs className='text-lg mr-1' />
                                    {listing.floor}
                                </li>
                                <li className='flex items-center whitespace-nowrap'>
                                    {listing.parking ? <TbParking className='text-xl mr-1' /> : <TbParkingOff className='text-xl mr-1' />}
                                    {+listing.parking ? 'Loc de parcare' : 'Loc de parcare'}
                                </li>
                                <li className='flex items-center whitespace-nowrap'>
                                    <FaChair className='text-lg mr-1' />
                                    {+listing.furnished ? 'Mobilat' : 'Nemobilat'}
                                </li>
                            </ul>
                        </div>
                    )}
                    {/* {listing.property === 'house' && (
                        <div>
                            <ul className='list-none space-y-2 mt-1 text-lg'>
                                <li className='list-inside' style={{ '--tw-text-opacity': '1' }}>
                                    <span className='mr-1 text-2xl' style={{ '--tw-text-opacity': '1' }}>•</span>
                                    <span className='font-semibold'>Tip compartimentare:</span>
                                    <span className='text-gray-700'> {listing.partitioning}</span>
                                </li>
                                <li className='list-inside' style={{ '--tw-text-opacity': '1' }}>
                                    <span className='mr-1 text-2xl' style={{ '--tw-text-opacity': '1' }}>•</span>
                                    <span className='font-semibold'>Suprafață utilă:</span>
                                    <span className='text-gray-700'> {listing.utilSurface}mp</span>
                                </li>
                                <li className='list-inside' style={{ '--tw-text-opacity': '1' }}>
                                    <span className='mr-1 text-2xl' style={{ '--tw-text-opacity': '1' }}>•</span>
                                    <span className='font-semibold'>An clădire:</span>
                                    <span className='text-gray-700'> {listing.constructionYear}</span>
                                </li>
                            </ul>
                            <ul className='flex items-center space-x-2 lg:space-x-10 text-md font-semibold ml-1 mt-3'>
                                <li className='flex items-center whitespace-nowrap'>
                                    <FaBed className='text-lg mr-1' />
                                    {+listing.rooms > 1 ? `${listing.rooms} camere` : '1 cameră'}
                                </li>
                                <li className='flex items-center whitespace-nowrap'>
                                    <FaBath className='text-lg mr-1' />
                                    {+listing.bathrooms > 1 ? `${listing.bathrooms} băi` : '1 baie'}
                                </li>
                                <li className='flex items-center whitespace-nowrap'>
                                    <GiStairs className='text-lg mr-1' />
                                    {listing.floor}
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
                        </div>
                    )} */}
                    <div className='relative mt-1 mb-3 items-center'>
                        <p className='font-semibold text-xl text-blue-700'>Detalii adiționale </p>
                        <div className='absolute left-40 top-0 text-2xl'>
                            {detailsVisible ? (
                                <BsFillArrowUpCircleFill
                                    className='text-blue-700'
                                    onClick={toggleDetails}
                                />
                            ) : (
                                <BsFillArrowDownCircleFill
                                    className='text-blue-700'
                                    onClick={toggleDetails}
                                />
                            )}
                        </div>
                        {detailsVisible && (
                            <div>
                                <div className="flex items-center mt-1 before:border-t-2  before:flex-1 before:border-gray-300 after:border-t-2 after:flex-1 after:border-gray-300 " />
                                <div className='text-md'>{listing.description}</div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="lg:w-[500px] md:w-[550px] lg:h-[500px] md:h-[500px] z-10" id='a'>
                    <ContactListing userRef={listing.userRef} listing={listing} />
                    <div className='w-[420px] h-[430px] z-10 overflow-hidden'>
                        <p className='flex items-center font-medium text-xl'>
                            <FaMapMarkerAlt className='text-green-700 mr-1 text-xl' />
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
                        <div className='mt-2 text-center'>
                            <button onClick={() => setContactLandLord(true)} className='w-full bg-gray-300 text-black px-5 py-2 text-lg font-medium uppercase rounded-2xl shadow-md hover:bg-gray-400 hover:text-white transition duration-150 ease-in-out hover:shadow-lg active:bg-gray-500 active:text-white'>
                                Contactează agent
                            </button>
                        </div>
                    )}
                    {contactLandLord && (
                        <Contact userRef={listing.userRef} listing={listing} />
                    )}
                </div>
                <FaShareSquare className='absolute right-1 bottom-1 text-3xl text-gray-600' onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    setShareLinkCopied(true);
                    setTimeout(() => {
                        setShareLinkCopied(false);
                    }, 2000);
                }} />
                {shareLinkCopied && (
                    <p className="absolute right-10 bottom-1 font-semibold border-2 border-gray-400 rounded-md bg-white z-10 p-2 text-gray-600 text-lg">
                        Link copiat
                    </p>
                )}
            </div>
        </main>
    )
}