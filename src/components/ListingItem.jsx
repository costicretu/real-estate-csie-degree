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
import { setDoc, doc, getDoc, updateDoc } from 'firebase/firestore'

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
                console.error('Eroare la preluarea documentului utilizatorului');
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
            console.error('Eroare la actualizarea documentului utilizatorului');
        }
    };
    return <li className='relative bg-white flex-col justify-between items-center shadow-md hover:shadow-xl rounded overflow-hidden transition-shadow duration-150 m-[10px]'>
        <Link className='contents' to={`/category/${listing.type}/${id}`}>
            <img className='h-[170px] w-full object-cover' loading='lazy' src={listing.imgUrls[0]} />
            <Moment className='absolute top-2 bg-[#3377cc] text-white uppercase text-xs font-semibold rounded-md px-2 py-1 shadow-lg left-2' fromNow>{listing.timestamp?.toDate()}</Moment>
            <div className='w-full p-[10px]'>
                <div className='flex items-center justify-between'>
                    <div className='bg-red-500 p-1 rounded-md text-gray-100'>
                        <p className='font-semibold'>€{listing.offer
                            ? listing.discountedPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            : listing.regularPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                            {listing.type === 'rent' && " / lună"}
                        </p>
                    </div>
                    <div className='flex items-center'>
                        <MdLocationOn className='h-4 w-4 text-green-600' />
                        <p className='font-semibold text-sm text-gray-600 truncate'>{listing.address}</p>
                    </div>
                </div>
                <p className='font-normal m-0 text-xl'>{listing.title}</p>
                <div className="flex items-center mt-[10px] space-x-3">
                    {listing.property === 'apartment' && (
                        <div className="flex items-center space-x-1">
                            <p className="font-semibold text-sm">{`${listing.utilSurface}`}<span className='font-bold'>mp</span></p>
                            <p className="font-semibold text-sm">{listing.rooms > 1 ? (<div>{listing.rooms}<span className='font-bold'> camere</span></div>) : (<div>1<span className='font-bold'>-cameră</span></div>)}</p>
                        </div>
                    )}
                    {listing.property === 'house' && (
                        <div className="flex items-center space-x-1">
                            <p className="font-semibold text-sm">{`${listing.utilSurface}`}<span className='font-bold'>mp</span></p>
                            <p className="font-semibold text-sm">teren: {`${listing.landSurface}`}<span className='font-bold'>mp</span></p>
                        </div>
                    )}
                    {listing.property === 'land' && (
                        <div className="flex items-center space-x-1">
                            <p className="font-semibold text-sm">{`${listing.landSurface}`}<span className='font-bold'>mp</span></p>
                            <p className="font-semibold text-sm">f.s: {`${listing.streetfront}`}<span className='font-bold'>mp</span></p>
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