import React, { useEffect, useState } from 'react'
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore'
import { db } from '../firebase'
import Spinner from '../components/Spinner'
import { Swiper, SwiperSlide } from 'swiper/react'
import SwiperCore, { EffectFade, Navigation, Pagination, Autoplay } from 'swiper'
import 'swiper/css/bundle'
import { useNavigate } from 'react-router-dom'

export default function Slider() {
  const [listings, setListings] = useState(null)
  const [loading, setLoading] = useState(true)
  SwiperCore.use([Navigation, Pagination, Autoplay])
  const navigate = useNavigate()
  useEffect(() => {
    async function fetchListings() {
      const listingsRef = collection(db, 'listings')
      const q = query(listingsRef, where('offer', '==', true), orderBy('timestamp', 'desc'), limit(5))
      const querySnap = await getDocs(q)
      let listings = []
      querySnap.forEach((doc) => {
        return listings.push({
          id: doc.id,
          data: doc.data(),
        })
      })
      setListings(listings)
      setLoading(false)
    }
    fetchListings()
  }, [])
  if (loading) {
    return <Spinner />
  }
  if (listings.length === 0) {
    return <></>
  }
  return (
    listings && (
      <>
        <Swiper
          slidesPerView={1}
          navigation
          effect="fade"
          modules={[EffectFade]}
          autoplay={{ delay: 3000 }}
        >
          {listings.map(({ data, id }) => (
            <SwiperSlide
              key={id}
              onClick={() => navigate(`/category/${data.type}/${id}`)}
            >
              <div
               style={{
                background: `url(${data.imgUrls[0]}) center no-repeat`,
                backgroundSize: "cover",
              }}
                className="relative w-full h-[300px] overflow-hidden"
              ></div>
              <p className="text-[#f1faee] absolute left-1 top-1 font-medium max-w-[90%] bg-[#0b5d91] shadow-lg opacity-90 p-2 rounded-br-3xl">
                {data.property === 'apartment' ? 'Apartament' : data.property === 'house' ? 'Casă' : data.property === 'land' ? 'Teren' : ''}
              </p>
              <p className="text-[#f1faee] absolute left-1 bottom-1 font-medium max-w-[90%] bg-[#fca311] shadow-lg opacity-90 p-2 rounded-tr-3xl">
                {data.type === 'rent' ? 'De închiriat' : 'De vânzare'}
              </p>
              <p className="text-[#f1faee] absolute right-1 top-1 font-semibold max-w-[90%] bg-[#986cc0] shadow-lg opacity-90 p-2 rounded-bl-3xl">
                €{data.discountedPrice ?? data.regularPrice}
                {data.type === "rent" && " / lună"}
              </p>
              <p className="text-[#f1faee] absolute right-1 bottom-1 font-medium max-w-[90%] bg-[#2a9d8f] shadow-lg opacity-90 p-2 rounded-tl-3xl">
                {data.title}
              </p>
            </SwiperSlide>
          ))}
        </Swiper>
      </>
    )
  );
}