import React, { useEffect, useState } from 'react'
import { getAuth, updateProfile } from 'firebase/auth'
import { useNavigate } from 'react-router'
import { toast } from 'react-toastify'
import { updateDoc, doc, collection, getDocs, where, query, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import ListingItem from '../components/ListingItem'
import { MdAccountCircle, MdMail } from 'react-icons/md'
import {AiFillPhone} from 'react-icons/ai'

export default function Profile() {
  const auth = getAuth()
  const navigate = useNavigate()
  const [listingItems, setListingItems] = useState([])
  const [formData, setFormData] = useState({
    name: auth.currentUser.displayName,
    email: auth.currentUser.email,
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
        await updateProfile(auth.currentUser, {
          displayName: name,
        })
        const docRef = doc(db, 'users', auth.currentUser.uid)
        await updateDoc(docRef, {
          name: name,
        })
      }
      if (phone !== '') {
        await updateDoc(phoneDocRef, {
          phone: phone,
        })
      }
      
      toast.success('Detalii profil actualizate')
    } catch (error) {
      toast.error('Nu s-au putut actualiza detaliile profilului')
    }
  }
  useEffect(() => {
    async function fetchFavouriteListings() {
      const auth = getAuth();
      const q = query(collection(db, 'favouriteListings'), where('userRefs', 'array-contains', auth.currentUser.uid));
      const querySnapshot = await getDocs(q);
      const favouriteListings = querySnapshot.docs.map(doc => ({ id: doc.id, listing: doc.data().listing }));
      const listingItems = favouriteListings.map(({ id, listing }) => <ListingItem key={id} id={id} listing={listing} setListingItems={setListingItems} />);
      setListingItems(listingItems);
    }

    fetchFavouriteListings();
  }, []);
  const [phone, setPhone] = useState('')
    const phoneDocRef = doc(db, 'users', auth.currentUser.uid)
    async function fetchPhone() {
        try {
            const phoneDoc = await getDoc(phoneDocRef)
            if (phoneDoc.exists()) {
                const phoneData = phoneDoc.data()
                const phoneCode = phoneData.phone
                setPhone(phoneCode)
            }
        } catch (error) {
            console.log("Eroare cod:", error)
        }
    }
    fetchPhone()
  return (
    <>
      <section>
        <h1 className='text-3xl text-center  ml-5 mr-5 py-1 text-gray-100 mt-6 font-semibold mb-6 bg-slate-500 rounded-lg shadow-lg'>Profilul meu</h1>
        <div className='mx-2 px-3'>
          <div className='flex flex-col md:flex-row'>
            <form className="w-full md:w-[60%] lg:w-[23%] mb-4 mr-3 md:mb-0 bg-slate-500 rounded-lg px-2 py-2 h-full overflow-y-auto" style={{ height: "500px" }}>
              <div className='w-full px-5 py-2'>
                <div className='flex justify-center'>
                  <h2 className='font-semibold mb-3 rounded text-center text-2xl px-1 py-0.5 bg-gray-300 text-red-600 shadow-md'>Date personale</h2>
                </div>
                <div>
                  <div className='relative mb-1'>
                    <MdAccountCircle className="absolute left-0 top-0 text-3xl" />
                    <h3 className='font-semibold text-lg text-gray-100 ml-8'>Nume și prenume</h3>
                  </div>
                  <input type="text" id='name' value={name} disabled={!changeDetail} onChange={onChange}
                    className={`w-full mb-3 px-4 py-2 text-xl bg-gray-100 border border-gray-300 rounded transition ease-in-out 
            ${changeDetail && "bg-red-200 focus:bg-red-200"}`} />
                </div>
                <div>
                  <div className='relative mb-1'>
                    <AiFillPhone className="absolute left-0 top-0 text-3xl" />
                    <h3 className='font-semibold text-lg text-gray-100 ml-8'>Telefon</h3>
                  </div>
                  <input type="tel" id='phone' value={phone} disabled={!changeDetail} className={`w-full mb-3 px-4 py-2 text-xl bg-gray-100 border border-gray-300 rounded transition ease-in-out 
                  ${changeDetail && "bg-red-200 focus:bg-red-200"}`} />
                </div>
                {/* placeholder="071-234-5678" */}
                <div>
                  <div className='relative mb-1'>
                    <MdMail className="absolute left-0 top-0 text-3xl" />
                    <h3 className='font-semibold text-lg text-gray-100 ml-8'>Email</h3>
                  </div>
                  <input type="email" id='email' value={email} disabled
                    className='w-full mb-3 px-4 py-2 text-xl bg-gray-100 border border-gray-300 rounded transition ease-in-out' />
                </div>
                <div className='flex justify-between whitespace-nowrap text-sm sm:text-sm'>
                  <p className='flex items-center '>
                    <span onClick={() => {
                      changeDetail && onSubmit()
                      setChangeDetail((prevState) => !prevState)
                    }} className='text-red-600 hover:text-red-700 transition ease-in-out duration-200 ml-1 cursor-pointer'>
                      {changeDetail ? "Aplică schimbare" : "Editează"}</span>
                  </p>
                  <p onClick={onLogout} className='text-blue-600 hover:text-blue-800 transition duration-200 ease-in-out cursor-pointer'>Deloghează-te</p>
                </div>
              </div>
            </form>
            <div className='flex-grow' id='aicilistings'>
              <h2 className='text-2xl text-left  ml-2.5 font-semibold'>Anunțuri favorite</h2>
              <div className="flex items-center ml-2.5 my-4 before:border-t-4  before:flex-1 before:border-gray-300 after:border-t-4 after:flex-1 after:border-gray-300 " />
              <ul className="sm:grid sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                {listingItems}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}