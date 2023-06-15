import React, { useEffect, useState } from 'react'
import { getAuth, updateProfile } from 'firebase/auth'
import { useNavigate } from 'react-router'
import { toast } from 'react-toastify'
import { updateDoc, doc, collection, query, where, orderBy, getDocs, getDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { AiOutlinePlus } from 'react-icons/ai'
import { Link } from 'react-router-dom'
import ListingItem from '../components/ListingItem'
import { MdAccountCircle, MdMail, MdQuestionAnswer } from 'react-icons/md'
import { AiFillPhone } from 'react-icons/ai'

export default function ProfileAgent() {
    const auth = getAuth()
    const navigate = useNavigate()
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
    const [listings, setListings] = useState(null)
    const [favouriteListings, setFavouriteListings] = useState(null)
    const [loading, setLoading] = useState(true)
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
                if (email.endsWith('@real-estate-csie-degree.com')) {
                    const docRef = doc(db, 'agents', auth.currentUser.uid)
                    await updateDoc(docRef, {
                        name: name,
                    })
                    toast.success('Numele și prenumele au fost actualizate')
                }
            }
        } catch (error) {
            toast.error(error)
        }
    }
    useEffect(() => {
        async function fetchUserListings() {
            const listingRef = collection(db, 'listings')
            const q = query(listingRef, where('userRef', '==', auth.currentUser.uid), orderBy('timestamp', 'desc'))
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
        fetchUserListings()
    }, [auth.currentUser.uid])
    async function onDelete(listingID) {
        if (window.confirm('Chiar vrei să ștergi acest anunț?')) {
            try {
                await deleteDoc(doc(db, 'listings', listingID))
                await deleteDoc(doc(db, 'favouriteListings', listingID))
                const updatedListings = listings.filter(listing => listing.id !== listingID)
                setListings(updatedListings)
                const updatedFavouriteListings = favouriteListings.filter(listing => listing.id !== listingID)
                setFavouriteListings(updatedFavouriteListings)
                toast.success('Ștergerea anunțului s-a efectuat cu succes')
            } catch (error) {

            }
        }
    }
    function onEdit(listingID) {
        navigate(`/edit-listing/${listingID}`)
    }
    const [agentCode, setAgentCode] = useState(null)
    const agentDocRef = doc(db, 'agents', auth.currentUser.uid)
    async function fetchAgentCode() {
        try {
            const agentDoc = await getDoc(agentDocRef)
            if (agentDoc.exists()) {
                const agentData = agentDoc.data()
                const agentCode = agentData.code
                setAgentCode(agentCode)
            }
        } catch (error) {
            console.log("Eroare cod:", error)
        }
    }
    fetchAgentCode()
    const [agents, setAgents] = useState([])
    useEffect(() => {
        const fetchAgents = async () => {
            const agentsRef = collection(db, 'agents');
            const q = query(agentsRef, where("emailAgent", "==", auth.currentUser.email));
            const snapshot = await getDocs(q);
            const agentsData = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    answer1: data.answer1,
                    answer2: data.answer2,
                    answer3: data.answer3,
                    question1: data.question1,
                    question2: data.question2,
                    question3: data.question3,
                    phone: data.phone,
                };
            });
            setAgents(agentsData);
        };
        fetchAgents()
    }, [])
    const updateAgent = async (agent) => {
        const agentsRef = collection(db, 'agents')
        const docRef = doc(agentsRef, agent.id)
        const q = query(agentsRef, where("emailAgent", "==", auth.currentUser.email));
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
            if (doc.data().answer1 !== agent.answer1) {
                try {
                    updateDoc(docRef, {
                        answer1: agent.answer1,
                    })
                    toast.success('Răspunsul din prima secțiune a fost actualizat')
                } catch (err) {
                    toast.error(err)
                }
            }
            if (doc.data().answer2 !== agent.answer2) {
                try {
                    updateDoc(docRef, {
                        answer2: agent.answer2,
                    })
                    toast.success('Răspunsul din a doua secțiune a fost actualizat')
                } catch (err) {
                    toast.error(err)
                }
            }
            if (doc.data().answer3 !== agent.answer3) {
                try {
                    updateDoc(docRef, {
                        answer3: agent.answer3,
                    })
                    toast.success('Răspunsul din a treia secțiune a fost actualizat')
                } catch (err) {
                    toast.error(err)
                }
            }
            if (doc.data().question1 !== agent.question1) {
                try {
                    updateDoc(docRef, {
                        question1: agent.question1,
                    })
                    toast.success('Întrebarea din prima secțiune a fost actualizată')
                } catch (err) {
                    toast.error(err)
                }
            }
            if (doc.data().question2 !== agent.question2) {
                try {
                    updateDoc(docRef, {
                        question2: agent.question2,
                    })
                    toast.success('Întrebarea din a doua secțiune a fost actualizată')
                } catch (err) {
                    toast.error(err)
                }
            }
            if (doc.data().question3 !== agent.question3) {
                try {
                    updateDoc(docRef, {
                        question3: agent.question3,
                    })
                    toast.success('Întrebarea din a treia secțiune a fost actualizată')
                } catch (err) {
                    toast.error(err)
                }
            }
        });
    }
    return (
        <>
            <section>
                <div className='mx-2 px-3 my-2 '>
                    <div className='flex flex-col md:flex-row'>
                        <div className=" w-auto max-w-md mb-4 mr-3 md:mb-0 bg-slate-500 rounded-lg px-2 py-2 h-full">
                            <form>
                                <div id='pentruCod'>
                                    <p id={`agentCode-${agentCode}`} className='text-sm font-medium text-gray-200 text-right'>
                                        COD AUTENTIFICARE: <strong>{agentCode}</strong>
                                    </p>
                                </div>
                                <div id='pentruEmail' className='px-4'>
                                    <div className='relative mb-1'>
                                        <MdMail className="absolute left-0 top-0 text-3xl" />
                                        <h3 className='font-semibold text-lg text-gray-100 ml-8'>Email</h3>
                                    </div>
                                    <input type="email" id='email' value={email} disabled
                                        className='w-full mb-3 px-2 py-1 text-xl bg-gray-100 border border-gray-300 rounded' />
                                </div>
                                <div id='pentruNumeSiPrenume' className='px-4'>
                                    <div className='relative mb-1'>
                                        <MdAccountCircle className="absolute left-0 top-0 text-3xl" />
                                        <h3 className='font-semibold text-lg text-gray-100 ml-8'>Nume și prenume</h3>
                                    </div>
                                    <input type="text" id='name' value={name} disabled={!changeDetail} onChange={onChange}
                                        className='w-full mb-3 px-2 py-1 text-xl bg-gray-100 border border-gray-300 rounded transition ease-in-out focus:border-red-500 focus:ring-2 focus:ring-red-500' />
                                </div>
                                <div id='pentruIntrebariSiRaspunsuri' className='px-4'>
                                    {agents.map(agent => (
                                        <div key={agent.id}>
                                            {email !== 'admineu@real-estate-csie-degree.com' && (
                                                <div id='pentruTelefon' >
                                                    <div className='relative mb-1'>
                                                        <AiFillPhone className="absolute left-0 top-0 text-3xl" />
                                                        <h3 className='font-semibold text-lg text-gray-100 ml-8'>Telefon</h3>
                                                    </div>
                                                    <input type="tel" value={agent.phone} disabled={!changeDetail}
                                                        className={'w-full mb-1 px-2 py-1 text-xl bg-gray-100 border border-gray-300 rounded transition ease-in-out focus:border-red-500 focus:ring-2 focus:ring-red-500'}
                                                        onChange={e => {
                                                            const newAgents = [...agents]
                                                            const index = newAgents.findIndex(a => a.id === agent.id)
                                                            newAgents[index].phone = e.target.value
                                                            setAgents(newAgents)
                                                        }}
                                                    />
                                                </div>
                                            )}
                                            <div id='pentruUnu' className="mt-3 bg-gray-700 px-0.5 py-2 mb-3 rounded-md ">
                                                <div className='relative mb-1 '>
                                                    <MdQuestionAnswer className="absolute left-0 top-0 text-3xl" />
                                                    <h3 className='font-semibold text-lg text-gray-100 ml-8'>Secțiunea 1</h3>
                                                </div>
                                                <div className='px-2 py-1'>
                                                    <select id='question1' value={agent.question1} disabled={!changeDetail} className='w-full rounded-md text-xl text-gray-700 bg-gray-100 border-gray-300  transition duration-150 ease-in-out focus:border-red-500 focus:ring-2 focus:ring-red-500'
                                                        onChange={e => {
                                                            const newAgents = [...agents]
                                                            const index = newAgents.findIndex(a => a.id === agent.id)
                                                            newAgents[index].question1 = e.target.value
                                                            setAgents(newAgents)
                                                        }}>
                                                        <option value="Ce nume are câinele tău ?">Ce nume are câinele tău?</option>
                                                        <option value="Ce nume are pisica ta ?">Ce nume are pisica ta ?</option>
                                                        <option value="Care este cel mai bun prieten al tău ?">Care este cel mai bun prieten al tău ?</option>
                                                    </select>
                                                    <input type="text" value={agent.answer1} disabled={!changeDetail} className='w-full mt-1 text-xl text-gray-700 bg-gray-100 border-gray-300 rounded transition ease-in-out focus:border-red-500 focus:ring-2 focus:ring-red-500'
                                                        onChange={e => {
                                                            const newAgents = [...agents]
                                                            const index = newAgents.findIndex(a => a.id === agent.id)
                                                            newAgents[index].answer1 = e.target.value
                                                            setAgents(newAgents)
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <div id='pentruDoi' className="mt-3 bg-gray-700 px-0.5 py-2 mb-3 rounded-md shadow-lg ">
                                                <div className='relative mb-1'>
                                                    <MdQuestionAnswer className="absolute left-0 top-0 text-3xl" />
                                                    <h3 className='font-semibold text-lg text-gray-100 ml-8'>Secțiunea 2</h3>
                                                </div>
                                                <div className='px-2 py-1'>
                                                    <select id='question2' value={agent.question2} disabled={!changeDetail} className='w-full rounded-md text-xl text-gray-700 bg-gray-100 border-gray-300  transition duration-150 ease-in-out focus:border-red-500 focus:ring-2 focus:ring-red-500'
                                                        onChange={e => {
                                                            const newAgents = [...agents]
                                                            const index = newAgents.findIndex(a => a.id === agent.id)
                                                            newAgents[index].question2 = e.target.value
                                                            setAgents(newAgents)
                                                        }}>
                                                        <option value="Unde locuiești ?">Unde locuiești ?</option>
                                                        <option value="Unde te-ai născut ?">Unde te-ai născut ?</option>
                                                        <option value="Ce culoare au ochii tăi ?">Ce culoare au ochii tăi ?</option>
                                                    </select>
                                                    <input type="text" value={agent.answer2} disabled={!changeDetail} className='w-full mt-1 text-xl text-gray-700 bg-gray-100 border-gray-300 rounded transition ease-in-out focus:border-red-500 focus:ring-2 focus:ring-red-500'
                                                        onChange={e => {
                                                            const newAgents = [...agents]
                                                            const index = newAgents.findIndex(a => a.id === agent.id)
                                                            newAgents[index].answer2 = e.target.value
                                                            setAgents(newAgents)
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <div id='pentruTrei' className="mt-3 bg-gray-700 px-0.5 py-2 mb-3 rounded-md shadow-lg ">
                                                <div className='relative mb-1'>
                                                    <MdQuestionAnswer className="absolute left-0 top-0 text-3xl" />
                                                    <h3 className='font-semibold text-lg text-gray-100 ml-8'>Secțiunea 3</h3>
                                                </div>
                                                <div className='px-2 py-1'>
                                                    <select id='question3' value={agent.question3} disabled={!changeDetail} className='w-full rounded-md text-xl text-gray-700 bg-gray-100 border-gray-300  transition duration-150 ease-in-out focus:border-red-500 focus:ring-2 focus:ring-red-500'
                                                        onChange={e => {
                                                            const newAgents = [...agents]
                                                            const index = newAgents.findIndex(a => a.id === agent.id)
                                                            newAgents[index].question3 = e.target.value
                                                            setAgents(newAgents)
                                                        }}>
                                                        <option value="Care este destinația ta de vacanță preferată ?">Care este destinația ta de vacanță preferată ?</option>
                                                        <option value="Care este culoarea ta preferată ?">Care este culoarea ta preferată ?</option>
                                                        <option value="Ce sport te pasionează ?">Ce sport te pasionează ?</option>
                                                    </select>
                                                    <input type="text" value={agent.answer3} disabled={!changeDetail} className='w-full mt-1 text-xl text-gray-700 bg-gray-100 border-gray-300 rounded transition ease-in-out focus:border-red-500 focus:ring-2 focus:ring-red-500'
                                                        onChange={e => {
                                                            const newAgents = [...agents]
                                                            const index = newAgents.findIndex(a => a.id === agent.id)
                                                            newAgents[index].answer3 = e.target.value
                                                            setAgents(newAgents)
                                                        }}
                                                    />
                                                </div>
                                            </div>
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
                            </form>
                        </div>
                        <div className='flex-grow'>
                            <div className='flex items-center justify-between'>
                                <h2 className='ml-2 text-2xl font-semibold'>Anunțurile mele</h2>
                                <button type="submit" className='bg-red-500 text-gray-100 uppercase px-7 py-3 text-sm font-medium rounded-lg shadow-md hover:bg-red-600 transition duration-150 ease-in-out hover:shadow-lg active:bg-red-700'>
                                    <Link to='/create-listing' className='flex items-center'>
                                        <AiOutlinePlus className='mr-2 text-3xl' />
                                        Adaugă anunț
                                    </Link>
                                </button>
                            </div>

                            <div className="flex items-center ml-2.5 my-4 before:border-t-4  before:flex-1 before:border-gray-300 after:border-t-4 after:flex-1 after:border-gray-300 " />
                            {!loading && listings.length > 0 && (
                                <>
                                    <ul className="sm:grid sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5">
                                        {listings.map((listing) => (
                                            <ListingItem
                                                key={listing.id}
                                                id={listing.id}
                                                listing={listing.data}
                                                onDelete={() => onDelete(listing.id)}
                                                onEdit={() => onEdit(listing.id)}
                                            />
                                        ))}
                                    </ul>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}