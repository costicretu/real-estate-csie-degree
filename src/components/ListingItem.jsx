import React, { useEffect, useState } from 'react'
import Moment from 'react-moment'
import { Link } from 'react-router-dom'
import { MdLocationOn } from 'react-icons/md'
import { FaTrash } from 'react-icons/fa'
import { MdEdit } from 'react-icons/md'
import { AiOutlineHeart } from 'react-icons/ai'
import { useAuthStatusAgent } from '../hooks/useAuthStatusAgent'
import { getAuth } from 'firebase/auth';
import { db } from '../firebase';
import { setDoc, doc, deleteDoc, getDoc, updateDoc } from 'firebase/firestore'

export default function ListingItem({ listing, id, onEdit, onDelete, setListingItems }) {
    const [isFavorite, setIsFavorite] = useState(false);
    const { loggedIn, isAgent } = useAuthStatusAgent();    
    useEffect(() => {
        const fetchIsFavorite = async () => {
            const auth = getAuth();
            const userId = auth.currentUser.uid;
            const favouriteListingsRef = doc(db, 'favouriteListings', id);
            try {
                const favouriteListingSnapshot = await getDoc(favouriteListingsRef);
                const favouriteListingData = favouriteListingSnapshot.data();
                if (favouriteListingData && favouriteListingData.userRefs.includes(userId)) {
                    setIsFavorite(true);
                }
            } catch (error) {
                console.error('Error fetching user document: ', error);
            }
        };
        fetchIsFavorite();
    }, [id]);

    const toggleFavorite = async () => {
        setIsFavorite(!isFavorite);
        const auth = getAuth();
        const userId = auth.currentUser.uid;
        const favouriteListingsRef = doc(db, 'favouriteListings', id);
        const listingRef = doc(db, 'listings', id);
        try {
            if (!isFavorite && auth.currentUser) {
                const listingSnapshot = await getDoc(listingRef);
                const listingData = listingSnapshot.data();
                const favouriteListingSnapshot = await getDoc(favouriteListingsRef);
                const favouriteListingData = favouriteListingSnapshot.data();
                const userRefs = (favouriteListingData && favouriteListingData.userRefs) || [];
                await setDoc(favouriteListingsRef, { userRefs: [...userRefs, userId], listing: listingData });
            } else {
                const favouriteListingSnapshot = await getDoc(favouriteListingsRef);
                const favouriteListingData = favouriteListingSnapshot.data();
                const userRefs = (favouriteListingData && favouriteListingData.userRefs) || [];
                const index = userRefs.indexOf(userId);
                if (index !== -1) {
                    userRefs.splice(index, 1);
                    await updateDoc(favouriteListingsRef, { userRefs });
                    setListingItems(prevListingItems => prevListingItems.filter(item => item.props.id !== id))
                }
            }
        } catch (error) {
            console.error('Error updating user document: ', error);
        }
    };   
    return <li className='relative bg-white flex-col justify-between items-center shadow-md hover:shadow-xl rounded overflow-hidden transition-shadow duration-150 m-[10px]'>
        <Link className='contents' to={`/category/${listing.type}/${id}`}>
            <img className='h-[170px] w-full object-cover hover:scale-105 transition-scale duration-200 ease-in' loading='lazy' src={listing.imgUrls[0]} />
            <Moment className='absolute top-2 bg-[#3377cc] text-white uppercase text-xs font-semibold rounded-md px-2 py-1 shadow-lg left-2' fromNow>{listing.timestamp?.toDate()}</Moment>
            <div className='w-full p-[10px]'>
                <div className='flex items-center space-x-1'>
                    <MdLocationOn className='h-4 w-4 text-green-600' />
                    <p className='font-semibold text-sm mb-[2px] text-gray-600 truncate'>{listing.address}</p>
                </div>
                <p className='font-semibold m-0 text-xl'>{listing.title}</p>
                <p className='text-[#457b9d] truncate mt-2 font-semibold'>${listing.offer
                    ? listing.discountedPrice
                        .toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    : listing.regularPrice
                        .toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    {listing.type === 'rent' && " / month"}
                </p>
                <div className="flex items-center mt-[10px] space-x-3">
                    {listing.property === 'land' ? (
                        <div className="flex items-center space-x-1">
                            <p className="font-bold text-xs">
                                {`${listing.utilSurface} mp`}
                            </p>
                        </div>
                    ) : (
                        <div className="flex items-center mt-[10px] space-x-3">
                            <div className="flex items-center space-x-1">
                                <p className="font-bold text-xs">
                                    {listing.bedrooms > 1 ? `${listing.rooms} camere` : "1 cameră"}
                                </p>
                            </div>
                            <div className="flex items-center space-x-1">
                                <p className="font-bold text-xs">
                                    {listing.bathrooms > 1
                                        ? `${listing.bathrooms} băi`
                                        : "1 baie"}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Link>
        {onDelete && (
            <FaTrash className='absolute bottom-2 right-2 h-[14px] cursor-pointer text-red-500'
                onClick={() => onDelete(listing.id)} />
        )}
        {onEdit && (
            <MdEdit className='absolute bottom-2 right-7 h-4 cursor-pointer'
                onClick={() => onEdit(listing.id)} />
        )}
        {loggedIn && !isAgent && (
            <div className='absolute bottom-2 right-2 h-[14px] cursor-pointer'>
                <AiOutlineHeart className={`h-5 w-5 cursor-pointer transition-colors ${isFavorite ? 'text-red-500' : 'text-gray-400'}`}
                    onClick={toggleFavorite}
                />
            </div>
        )}
    </li>
}