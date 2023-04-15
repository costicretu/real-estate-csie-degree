import React, { useEffect, useState } from 'react'
import { getAuth, updateProfile } from 'firebase/auth'
import { useNavigate } from 'react-router'
import { toast } from 'react-toastify'
import { updateDoc, doc, collection, getDocs, where, query} from 'firebase/firestore'
import { db } from '../firebase'
import ListingItem from '../components/ListingItem'

export default function Profile() {
  const auth = getAuth()
  const navigate = useNavigate()
  const [listingItems, setListingItems] = useState([])
  const [formData, setFormData] = useState({
    name: auth.currentUser.displayName,
    email: auth.currentUser.email
  })
  const { name, email } = formData
  function onLogout() {
    auth.signOut()
    navigate('/')
  }
  const [changeDetail, setChangeDetail] = useState(false)
  function onChange(e) {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }))
  }
  async function onSubmit() {
    try {
      if (auth.currentUser.displayName !== name) {
        //update the displayName in firebase auth
        await updateProfile(auth.currentUser, {
          displayName: name,
        })
        //update the name in the firestore
        const docRef = doc(db, 'users', auth.currentUser.uid)
        await updateDoc(docRef, {
          name: name,
        })
      }
      toast.success('Profile details updated')
    } catch (error) {
      toast.error('Could not update the profile details')
    }
  }
  useEffect(() => {
    async function fetchFavouriteListings() {
      const auth = getAuth();
      const q = query(collection(db, 'favouriteListings'), where('userRefs', 'array-contains', auth.currentUser.uid));
      const querySnapshot = await getDocs(q);
      const favouriteListings = querySnapshot.docs.map(doc => ({ id: doc.id, listing: doc.data().listing }));
      const listingItems = favouriteListings.map(({ id, listing }) => <ListingItem key={id} id={id} listing={listing} />);
      setListingItems(listingItems);
    }
    
    fetchFavouriteListings();
  }, []);
  
  return (
    <>
      <section className='max-w-6xl mx-auto flex justify-center items-center flex-col'>
        <h1 className='text-3xl text-center mt-6 font-bold'>My Profile</h1>
        <div className='w-full md:w-[50%] mt-6 px-3'>
          <form>
            <input type="text" id='name' value={name} disabled={!changeDetail} onChange={onChange}
              className={`mb-6 w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition ease-in-out 
            ${changeDetail && "bg-red-200 focus:bg-red-200"}`} />
            <input type="email" id='email' value={email} disabled
              className='mb-6 w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition ease-in-out' />
            <div className='flex justify-between whitespace-nowrap text-sm sm:text-lg'>
              <p className='flex items-center mb-6'>Do you want to change your name?
                <span onClick={() => {
                  changeDetail && onSubmit()
                  setChangeDetail((prevState) => !prevState)
                }} className='text-red-600 hover:text-red-700 transition ease-in-out duration-200 ml-1 cursor-pointer'>
                  {changeDetail ? "Apply change" : "Edit"}</span>
              </p>
              <p onClick={onLogout} className='text-blue-600 hover:text-blue-800 transition duration-200 ease-in-out cursor-pointer'>Sign out</p>
            </div>
          </form>
        </div>
      </section>
      <div className='max-w-6xl px-3 mt-6 mx-auto' id='aicilistings'>
        <h2 className='text-2xl text-center font-semibold mb-6'>Anunțurile mele favorite</h2>
        <ul className='sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl-grid-cols-5 mt-6 mb-6'>
          {listingItems}
        </ul>
      </div>
    </>
  )
}
