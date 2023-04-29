import React, { useEffect, useState } from 'react'
import { getAuth, updateProfile } from 'firebase/auth'
import { useNavigate } from 'react-router'
import { toast } from 'react-toastify'
import { updateDoc, doc, collection, getDocs, where, query } from 'firebase/firestore'
import { db } from '../firebase'
import ListingItem from '../components/ListingItem'
import { MdAccountCircle, MdMail } from 'react-icons/md'
import { AiFillPhone } from 'react-icons/ai'

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
  const [agents, setAgents] = useState([])
  useEffect(() => {
    const fetchAgents = async () => {
      const agentsRef = collection(db, 'users');
      const q = query(agentsRef, where("email", "==", auth.currentUser.email));
      const snapshot = await getDocs(q);
      const agentsData = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          phone: data.phone,
        };
      });
      setAgents(agentsData);
    };
    fetchAgents()
  }, [])
  const updateAgent = async (agent) => {
    const agentsRef = collection(db, 'users')
    const docRef = doc(agentsRef, agent.id)
    const q = query(agentsRef, where("email", "==", auth.currentUser.email));
    const snapshot = await getDocs(q);
    const agentsData = snapshot.docs.map((doc) => {
      const data = doc.data();
      if (doc.data().phone !== agent.phone) {
        try {
          updateDoc(docRef, {
            phone: agent.phone,
          })
          toast.success('Număr de telefon actualizat')
        } catch (err) {
          toast.error(err)
        }
      }
    });
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
        toast.success('Nume și prenume actualizat')
      }
    } catch (error) {
      toast.error(error)
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
  return (
    <>
      <section>
        <div className='mx-2 px-3 py-2'>
          <div className='flex flex-col md:flex-row'>
            <div className="w-full md:w-[60%] lg:w-[20%] mb-4 mr-3 md:mb-0 bg-slate-500 rounded-lg px-2 py-2 h-full " style={{ height: "395px" }}>
              <form>
                <div className='w-full px-5 py-2'>
                  <div className='flex justify-center'>
                    <h2 className='font-semibold mb-3 rounded text-center text-2xl px-1 py-0.5 bg-gray-300 text-black shadow-md'>Date personale</h2>
                  </div>
                  <div id='pentruEmail'>
                    <div className='relative mb-1' >
                      <MdMail className="absolute left-0 top-0 text-3xl" />
                      <h3 className='font-semibold text-lg text-gray-100 ml-8'>Email</h3>
                    </div>
                    <input type="email" id='email' value={email} disabled
                      className='w-full mb-3 px-4 py-2 text-xl bg-gray-100 border border-gray-300 rounded transition ease-in-out' />
                  </div>
                  <div id='pentruNumeSiPrenume'>
                    <div className='relative mb-1'>
                      <MdAccountCircle className="absolute left-0 top-0 text-3xl" />
                      <h3 className='font-semibold text-lg text-gray-100 ml-8'>Nume și prenume</h3>
                    </div>
                    <input type="text" id='name' value={name} disabled={!changeDetail} onChange={onChange}
                      className={'w-full mb-3 px-4 py-2 text-xl bg-gray-100 border border-gray-300 rounded transition ease-in-out focus:border-red-500 focus:ring-2 focus:ring-red-500'} />
                  </div>
                  <div id='pentruTelefon'>
                    <div className='relative mb-1'>
                      <AiFillPhone className="absolute left-0 top-0 text-3xl" />
                      <h3 className='font-semibold text-lg text-gray-100 ml-8'>Telefon</h3>
                    </div>
                    {agents.map(agent => (
                      <div key={agent.id}>
                        <input type="tel" value={agent.phone} disabled={!changeDetail}
                          className={'w-full mr-2 px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition ease-in-out focus:border-red-500 focus:ring-2 focus:ring-red-500 '}
                          onChange={e => {
                            const newAgents = [...agents]
                            const index = newAgents.findIndex(a => a.id === agent.id)
                            newAgents[index].phone = e.target.value
                            setAgents(newAgents)
                          }}
                        />
                        <div className='flex justify-between whitespace-nowrap font-medium text-md sm:text-md'>
                          <p className='mt-5 flex items-center '>
                            <span onClick={() => {
                              changeDetail && onSubmit()
                              setChangeDetail((prevState) => !prevState)
                              updateAgent(agent)
                            }} className='px-1 py-1 text-red-600 hover:text-red-800 transition ease-in-out duration-200 cursor-pointer bg-gray-300 rounded-md '>
                              {changeDetail ? "Actualizează date" : "Modifică date"}</span>
                          </p>
                          <p onClick={onLogout} className='px-1 rounded-md py-1 mt-5 text-blue-600 hover:text-blue-800 transition duration-200 ease-in-out cursor-pointer bg-gray-300'>Deloghează-te</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </form>
            </div>
            <div className='flex-grow' id='aicilistings'>
              <h2 className='text-2xl text-left  ml-2.5 font-semibold'>Anunțuri salvate</h2>
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