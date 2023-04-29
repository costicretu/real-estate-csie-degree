import { useState } from "react";
import Spinner from "../components/Spinner";
import { toast } from "react-toastify";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { v4 as uuidv4 } from "uuid";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { MdTitle, MdDescription, MdApartment } from 'react-icons/md'
import { BsFillImageFill, BsBuildingsFill, BsFillHouseDoorFill } from 'react-icons/bs'
import { FaLocationArrow } from 'react-icons/fa'
import { AiOutlineApartment } from 'react-icons/ai'
import { RiMapFill } from 'react-icons/ri'
import { TbBuildingWarehouse } from 'react-icons/tb'
import { GiPoland } from 'react-icons/gi'

export default function EditListing() {
  const navigate = useNavigate();
  const auth = getAuth();
  const [geolocationEnabled, setGeolocationEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [listing, setListing] = useState(null);
  const [propertyType, setPropertyType] = useState('');
  const [roomsNumber, setRoomsNumber] = useState(1);
  const [formData, setFormData] = useState({
    property: 'apartment',
    landtype: 'construction',
    landClassification: 'town',
    utilSurface: 0,
    landSurface: 0,
    streetfront: 0,
    type: "rent",
    title: "",
    rooms: 1,
    bathrooms: 1,
    partitioning: 'decomandat',
    houseType: 'individuala',
    floor: 'Etaj 1',
    constructionYear: 'Dupa 2000',
    parking: false,
    furnished: true,
    address: "",
    description: "",
    offer: false,
    regularPrice: 0,
    discountedPrice: 0,
    latitude: 0,
    longitude: 0,
    images: {}
  })
  const { landtype, landClassification, utilSurface, landSurface, streetfront, type, title, rooms, bathrooms, partitioning, houseType, floor, constructionYear, parking, furnished, address, description, offer, regularPrice, discountedPrice, latitude, longitude, images } = formData
  const params = useParams();

  useEffect(() => {
    if (listing && listing.userRef !== auth.currentUser.uid) {
      toast.error("Nu poți edita acest anunț");
      navigate("/");
    }
  }, [auth.currentUser.uid, listing, navigate]);

  useEffect(() => {
    setLoading(true);
    async function fetchListing() {
      const docRef = doc(db, "listings", params.listingId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setListing(docSnap.data());
        setFormData({ ...docSnap.data() });
        setPropertyType(docSnap.data().property); // Add this line
        setLoading(false);
      } else {
        navigate("/");
        toast.error("Acest anunț nu există");
      }
    }
    fetchListing();
  }, [navigate, params.listingId]);

  function onChange(e) {
    let boolean = null;
    if (e.target.value === "true") {
      boolean = true;
    }
    if (e.target.value === "false") {
      boolean = false;
    }
    // Files
    if (e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        images: e.target.files,
      }));
    }
    // Text/Boolean/Number
    if (!e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        [e.target.id]: boolean ?? e.target.value,
      }));
    }
    if (e.target.id === "property") {
      setPropertyType(e.target.value);
    }
    if (e.target.id === 'rooms') {
      setRoomsNumber(e.target.value)
    }
  }
  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    if (+discountedPrice >= +regularPrice) {
      setLoading(false);
      toast.error("Prețul redus trebuie să fie mai mic decât prețul obișnuit");
      return;
    }
    if (images.length > 6) {
      setLoading(false);
      toast.error("Sunt permise maxim 6 imagini");
      return;
    }
    let geolocation = {};
    let location;
    if (geolocationEnabled) {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.REACT_APP_GEOCODE_API_KEY}`
      );
      const data = await response.json();
      console.log(data);
      geolocation.lat = data.results[0]?.geometry.location.lat ?? 0;
      geolocation.lng = data.results[0]?.geometry.location.lng ?? 0;

      location = data.status === "ZERO_RESULTS" && undefined;

      if (location === undefined) {
        setLoading(false);
        toast.error("Te rog introdu o adresă corectă");
        return;
      }
    } else {
      geolocation.lat = latitude;
      geolocation.lng = longitude;
    }

    async function storeImage(image) {
      return new Promise((resolve, reject) => {
        const storage = getStorage();
        const filename = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`;
        const storageRef = ref(storage, filename);
        const uploadTask = uploadBytesResumable(storageRef, image);
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log("Încărcarea este " + progress + "% gata");
            switch (snapshot.state) {
              case "paused":
                console.log("Încărcarea s-a oprit");
                break;
              case "running":
                console.log("Încărcarea rulează");
                break;
            }
          },
          (error) => {
            reject(error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              resolve(downloadURL);
            });
          }
        );
      });
    }
    const imgUrls = await Promise.all(
      [...images].map((image) => storeImage(image))
    ).catch((error) => {
      setLoading(false);
      toast.error("Imaginile nu au putut fi încărcate");
      return;
    });
    const formDataCopy = {
      ...formData,
      imgUrls,
      geolocation,
      timestamp: serverTimestamp(),
      userRef: auth.currentUser.uid,
    };
    if (propertyType === 'land') {
      delete formDataCopy.bathrooms
      delete formDataCopy.rooms
      delete formDataCopy.furnished
      delete formDataCopy.parking
      delete formDataCopy.constructionYear
      delete formDataCopy.partitioning
      delete formDataCopy.houseType
      delete formDataCopy.floor
      delete formDataCopy.constructionYear
      delete formDataCopy.utilSurface
    } else if (propertyType === 'apartment') {
      delete formDataCopy.landClassification
      delete formDataCopy.landtype
      delete formDataCopy.landSurface
      delete formDataCopy.streetfront
      delete formDataCopy.houseType
    } else if (propertyType === 'house') {
      delete formDataCopy.landClassification
      delete formDataCopy.landtype
      delete formDataCopy.partitioning
      delete formDataCopy.streetfront
      delete formDataCopy.floor
    }
    delete formDataCopy.images;
    !formDataCopy.offer && delete formDataCopy.discountedPrice;
    delete formDataCopy.latitude;
    delete formDataCopy.longitude;
    const docRef = doc(db, "listings", params.listingId);
    await updateDoc(docRef, formDataCopy);
    setLoading(false);
    toast.success("Anunț editat");
    navigate(`/category/${formDataCopy.type}/${docRef.id}`);
  }

  if (loading) {
    return <Spinner />;
  }
  return (
    <>
      <section className="flex items-center justify-center">
        <div className='mx-2 w-[900px]'>
          <h2 className='py-1 px-3 text-2xl bg-slate-500 shadow-lg rounded-lg text-center mt-3 font-semibold text-gray-100'>Editează anunțul</h2>
          <div className='flex flex-col md:flex-row px-3 '>
            <div className="md:w-[55%] lg:w-[55%] mr-3 md:mb-0 rounded-lg w-full">
              <form onSubmit={onSubmit}>
                <div className="mb-6 mt-6">
                  <p className='text-lg font-semibold'>Titlu anunț</p>
                  <div className="relative">
                    <MdTitle className="absolute right-3 top-2 text-4xl" />
                    <input type="text" id='title' value={title} onChange={onChange} placeholder="Titlu" maxLength="32" minLength="10" required
                      className='w-full px-4 py-2 text-xl bg-white border-gray-300 rounded transition ease-in-out focus:border-red-500 focus:ring-2 focus:ring-red-500' />
                  </div>
                </div>
                <div className="flex">
                  <button type='button' id='type' value="sale" onClick={onChange}
                    className={`mr-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-out w-full 
                ${type === "rent" ? "bg-white text-black" : "bg-slate-600 text-white"}`}>Spre vânzare</button>
                  <button type='button' id='type' value="rent" onClick={onChange}
                    className={`ml-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-out w-full 
                ${type === "sale" ? "bg-white text-black" : "bg-slate-600 text-white"}`}>Spre închiriere</button>
                </div>
                <div className="mb-3 mt-3">
                  <p className='text-lg font-semibold'>Imagini</p>
                  <p className='text-gray-600'>Prima imagine va fi cu titlu de prezentare (maxim 6)</p>
                  <div className="relative">
                    <BsFillImageFill className="absolute right-3 top-2 text-3xl" />
                    <input type="file" id='images' onChange={onChange} accept=".jpg,.png,.jpeg" multiple required
                      className='w-full px-3 py-1.5 bg-white border-gray-300 rounded transition ease-in-out focus:border-red-500 focus:ring-2 focus:ring-red-500' />
                  </div>
                </div>
                <div className="mb-3 mt-3">
                  <p className='text-lg  font-semibold'>Adresă</p>
                  <div className="relative">
                    <FaLocationArrow className="absolute right-3 top-8 text-3xl" />
                    <textarea type="text" id='address' value={address} onChange={onChange} placeholder="Localizare" required
                      className='w-full px-4 py-1 text-xl  bg-white border-gray-300 rounded transition duration-150 ease-in-out focus:border-red-500 focus:ring-2 focus:ring-red-500' />
                    {!geolocationEnabled && (
                      <div className='flex space-x-6 justify-start mb-6'>
                        <div className=''>
                          <p className='text-lg font-semibold' >Latitude</p>
                          <input type="number" id="latitude" value={latitude} onChange={onChange} required min='-90' max='90'
                            className='w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:bg-white focus:text-gray-700 focus:border  text-center' />
                        </div>
                        <div className=''>
                          <p className='text-lg font-semibold' >Longitude</p>
                          <input type="number" id="longitude" value={longitude} onChange={onChange} required min='-180' max='180'
                            className='w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:bg-white focus:text-gray-700 focus:border text-center' />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mb-3 mt-3">
                  <p className='text-lg font-semibold'>Descriere</p>
                  <div className="relative">
                    <MdDescription className="absolute right-3 top-16 text-4xl" />
                    <textarea type="text" id='description' value={description} onChange={onChange} placeholder="Detalii adiționale" required
                      className='w-full h-[102px] px-4 py-2 text-xl  bg-white border-gray-300 rounded transition duration-150 ease-in-out focus:border-red-500 focus:ring-2 focus:ring-red-500' />
                  </div>
                </div>
                <p className='text-lg font-semibold'>Ofertă</p>
                <div className="flex mb-6">
                  <button type='button' id='offer' value={true} onClick={onChange}
                    className={`mr-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-out w-full 
                ${!offer ? "bg-white text-black" : "bg-slate-600 text-white"}`}>Da</button>
                  <button type='button' id='offer' value={false} onClick={onChange}
                    className={`ml-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-out w-full 
                ${offer ? "bg-white text-black" : "bg-slate-600 text-white"}`}>Nu</button>
                </div>
                <div className={`flex ${type === 'sale' ? 'space-x-24' : 'space-x-8'}`}>
                  <div>
                    <div className="flex items-center">
                      <div className="">
                        <p className='text-lg font-semibold'>Preț fără discount</p>
                        <div className='flex w-full justify-center items-center space-x-3'>
                          <input type="number" id='regularPrice' value={regularPrice} onChange={onChange} min='50' max='4000000' required
                            className='px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 text-center' />
                          {type === "rent" && (
                            <div className=''>
                              <p className='text-md  whitespace-nowrap'>€ / lună</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    {offer && (
                      <div className='flex items-center'>
                        <div className=''>
                          <p className='text-lg font-semibold'>Preț cu discount</p>
                          <div className='flex w-full justify-center items-center space-x-3'>
                            <input type="number" id='discountedPrice' value={discountedPrice} onChange={onChange} min='50' max='4000000' required={offer}
                              className=' px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 text-center' />
                            {type === "rent" && (
                              <div className=''>
                                <p className='text-md whitespace-nowrap'>€ / lună</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </div>
            <div className="flex-grow">
              <form onSubmit={onSubmit}>
                <div className="w-full">
                  <p className='text-lg mt-6 font-semibold'>Tip proprietate</p>
                  <div className="relative">
                    {propertyType === 'apartment' && (
                      <MdApartment className="absolute left-2 top-2 text-3xl" />
                    )}
                    {propertyType === 'house' && (
                      <BsFillHouseDoorFill className="absolute left-2 top-2 text-3xl" />
                    )}
                    {propertyType === 'land' && (
                      <GiPoland className="absolute left-2 top-2 text-3xl" />
                    )}
                    <select value={propertyType} disabled onChange={onChange} className='w-full px-10 rounded-md text-xl bg-white border-gray-300  transition duration-150 ease-in-out focus:border-red-500 focus:ring-2 focus:ring-red-500' id="property" name="property">
                      <option value="apartment">Apartament</option>
                      <option value="house">Casă</option>
                      <option value="land">Teren</option>
                    </select>
                  </div>
                </div>
                {(propertyType === 'apartment' || propertyType === 'house' || propertyType === 'land') && (
                  <div className="bg-slate-400 rounded-md px-4 py-2 mt-6">
                    {propertyType === 'apartment' && (
                      <div>
                        <p className='text-lg text-white  font-semibold'>Compartimentare</p>
                        <div className="relative">
                          <AiOutlineApartment className="absolute left-2 top-2 text-3xl" />
                          <select value={partitioning} onChange={onChange} className='w-full px-10 rounded-md text-xl bg-white border-gray-300  transition duration-150 ease-in-out focus:border-red-500 focus:ring-2 focus:ring-red-500' id="partitioning" name="partitioning">
                            <option value="decomandat">Decomandat</option>
                            <option value="semidecomandat">Semidecomandat</option>
                            <option value="nedecomandat">Nedecomandat</option>
                            <option value="circular">Circular</option>
                            <option value="vagon">Vagon</option>
                          </select>
                        </div>
                        <p className='text-lg text-white font-semibold mt-3' >Suprafața utilă(mp)</p>
                        <input type="number" id="utilSurface" value={utilSurface} onChange={onChange} required min='1'
                          className='w-full px-4 py-2 rounded-md text-xl bg-white border-gray-300  transition duration-150 ease-in-out focus:border-red-500 focus:ring-2 focus:ring-red-500' />
                        <p className='text-lg mt-3 font-semibold text-white'>Etaj</p>
                        <select value={floor} onChange={onChange} className='w-full px-4 py-2 rounded-md text-xl bg-white border-gray-300  transition duration-150 ease-in-out focus:border-red-500 focus:ring-2 focus:ring-red-500' id="floor" name="floor">
                          <option value='Demisol'>Demisol</option>
                          <option value='Parter'>Parter</option>
                          <option value='Etaj 1'>Etaj 1</option>
                          <option value='Etaj 2'>Etaj 2</option>
                          <option value='Etaj 3'>Etaj 3</option>
                          <option value='Etaj 4'>Etaj 4</option>
                          <option value='Etaj 5'>Etaj 5</option>
                          <option value='Etaj 6'>Etaj 6</option>
                          <option value='Etaj 7'>Etaj 7</option>
                          <option value='Etaj 8'>Etaj 8</option>
                          <option value='Etaj 9'>Etaj 9</option>
                          <option value='Etaj 10'>Etaj 10</option>
                          <option value='Peste 10'>Peste 10</option>
                          <option value='Mansarda'>Mansarda</option>
                        </select>
                        <div className="flex space-x-32 w-full mt-3 mb-3">
                          <div>
                            <p className='text-lg text-white font-semibold'>Camere</p>
                            <input
                              type='number'
                              id='rooms'
                              value={rooms}
                              onChange={onChange}
                              min='1'
                              max='50'
                              required
                              className='w-full px-4 py-2 rounded-md text-xl bg-white border-gray-300  transition duration-150 ease-in-out focus:border-red-500 focus:ring-2 focus:ring-red-500'
                            />
                          </div>
                          <div>
                            {roomsNumber > 2 && (
                              <div>
                                <p className='text-lg text-white font-semibold text-right'>Băi</p>
                                <input
                                  type='number'
                                  id='bathrooms'
                                  value={bathrooms}
                                  onChange={onChange}
                                  min='1'
                                  max='50'
                                  required
                                  className='w-full px-4 py-2 rounded-md text-xl bg-white border-gray-300  transition duration-150 ease-in-out focus:border-red-500 focus:ring-2 focus:ring-red-500'
                                />
                              </div>
                            )}
                          </div>
                        </div>
                        <p className='text-lg mt-3 text-white font-semibold'>An clădire</p>
                        <select value={constructionYear} onChange={onChange} className='w-full px-4 py-2 rounded-md text-xl bg-white border-gray-300  transition duration-150 ease-in-out focus:border-red-500 focus:ring-2 focus:ring-red-500' id="constructionYear" name="constructionYear">
                          <option value='Dupa 2000'>După 2000</option>
                          <option value='Intre 1990 si 2000'>Între 1990 și 2000</option>
                          <option value='Intre 1977 si 1990'>Între 1977 și 1990</option>
                          <option value='Inainte de 1977'>Înainte de 1977</option>
                        </select>
                        <p className='text-lg mt-3 text-white font-semibold'>Loc de parcare</p>
                        <div className='flex'>
                          <button type='button' id='parking' value={true} onClick={onChange}
                            className={`mr-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-out w-full 
                                                                ${!parking ? "bg-white text-black" : "bg-slate-600 text-white"}`}>Da</button>
                          <button type='button' id='parking' value={false} onClick={onChange}
                            className={`ml-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-out w-full 
                                                                ${parking ? "bg-white text-black" : "bg-slate-600 text-white"}`}>Nu</button>
                        </div>
                        {type === 'sale' && (
                          <div>
                            <p className='text-lg mt-3 text-white font-semibold'>Mobilat</p>
                            <div className='flex'>
                              <button type='button' id='furnished' value={true} onClick={onChange}
                                className={`mr-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-out w-full 
                                                ${!furnished ? "bg-white text-black" : "bg-slate-600 text-white"}`}>Da</button>
                              <button type='button' id='furnished' value={false} onClick={onChange}
                                className={`ml-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-out w-full 
                                                ${furnished ? "bg-white text-black" : "bg-slate-600 text-white"}`}>Nu</button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {propertyType === 'house' && (
                      <div>
                        <p className='text-lg text-white font-semibold'>Tip locuință</p>
                        <div className="relative">
                          <TbBuildingWarehouse className="absolute left-2 top-2 text-3xl" />
                          <select value={houseType} onChange={onChange} className='w-full px-10 rounded-md text-xl bg-white border-gray-300  transition duration-150 ease-in-out focus:border-red-500 focus:ring-2 focus:ring-red-500' id="houseType" name="housetType">
                            <option value="individuala">Individuală</option>
                            <option value="duplex">Duplex</option>
                            <option value="triplex">Triplex</option>
                            <option value="insiruita">Înșiruită</option>
                            <option value="altele">Altele</option>
                          </select>
                        </div>
                        <p className='text-lg text-white font-semibold mt-3' >Suprafața utilă(mp)</p>
                        <input type="number" id="utilSurface" value={utilSurface} onChange={onChange} required min='1'
                          className='w-full px-4 py-2 rounded-md text-xl bg-white border-gray-300  transition duration-150 ease-in-out focus:border-red-500 focus:ring-2 focus:ring-red-500' />
                        <p className='text-lg font-semibold mt-3 text-white' >Suprafața teren(mp)</p>
                        <input type="number" id="landSurface" value={landSurface} onChange={onChange} required min='10'
                          className='w-full px-4 py-2 rounded-md text-xl bg-white border-gray-300  transition duration-150 ease-in-out focus:border-red-500 focus:ring-2 focus:ring-red-500' />
                        <div className="flex space-x-32 w-full mt-3 mb-3">
                          <div>
                            <p className='text-lg text-white font-semibold'>Camere</p>
                            <input
                              type='number'
                              id='rooms'
                              value={rooms}
                              onChange={onChange}
                              min='1'
                              max='50'
                              required
                              className='w-full px-4 py-2 rounded-md text-xl bg-white border-gray-300  transition duration-150 ease-in-out focus:border-red-500 focus:ring-2 focus:ring-red-500'
                            />
                          </div>
                          <div>
                            {rooms > 2 && (
                              <div>
                                <p className='text-lg text-white font-semibold text-right'>Băi</p>
                                <input
                                  type='number'
                                  id='bathrooms'
                                  value={bathrooms}
                                  onChange={onChange}
                                  min='1'
                                  max='50'
                                  required
                                  className='w-full px-4 py-2 rounded-md text-xl bg-white border-gray-300  transition duration-150 ease-in-out focus:border-red-500 focus:ring-2 focus:ring-red-500'
                                />
                              </div>
                            )}
                          </div>
                        </div>
                        <p className='text-lg mt-3 text-white font-semibold'>An clădire</p>
                        <select value={constructionYear} onChange={onChange} className='w-full px-4 py-2 rounded-md text-xl bg-white border-gray-300  transition duration-150 ease-in-out focus:border-red-500 focus:ring-2 focus:ring-red-500' id="constructionYear" name="constructionYear">
                          <option value='Dupa 2000'>După 2000</option>
                          <option value='Intre 1990 si 2000'>Între 1990 și 2000</option>
                          <option value='Intre 1977 si 1990'>Între 1977 și 1990</option>
                          <option value='Inainte de 1977'>Înainte de 1977</option>
                        </select>
                        <p className='text-lg mt-3 text-white font-semibold'>Loc de parcare</p>
                        <div className='flex'>
                          <button type='button' id='parking' value={true} onClick={onChange}
                            className={`mr-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-out w-full 
                                                                ${!parking ? "bg-white text-black" : "bg-slate-600 text-white"}`}>Da</button>
                          <button type='button' id='parking' value={false} onClick={onChange}
                            className={`ml-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-out w-full 
                                                                ${parking ? "bg-white text-black" : "bg-slate-600 text-white"}`}>Nu</button>
                        </div>
                        {type === 'sale' && (
                          <div>
                            <p className='text-lg mt-3 text-white font-semibold'>Mobilat</p>
                            <div className='flex'>
                              <button type='button' id='furnished' value={true} onClick={onChange}
                                className={`mr-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-out w-full 
                                                ${!furnished ? "bg-white text-black" : "bg-slate-600 text-white"}`}>Da</button>
                              <button type='button' id='furnished' value={false} onClick={onChange}
                                className={`ml-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-out w-full 
                                                ${furnished ? "bg-white text-black" : "bg-slate-600 text-white"}`}>Nu</button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {propertyType === 'land' && (
                      <div>
                        <p className='text-lg text-white font-semibold'>Tip teren</p>
                        <div className="relative">
                          <RiMapFill className="absolute left-2 top-2 text-3xl" />
                          <select value={landtype} onChange={onChange} className='w-full px-10 rounded-md text-xl bg-white border-gray-300  transition duration-150 ease-in-out focus:border-red-500 focus:ring-2 focus:ring-red-500' id="landtype" name="landtype">
                            <option value="constructii">Constructii</option>
                            <option value="agricol">Agricol</option>
                            <option value="padure">Pădure</option>
                            <option value="livada">Livadă</option>
                          </select>
                        </div>
                        <p className='text-lg  font-semibold mt-3 text-white'>Clasificare teren</p>
                        <select value={landClassification} onChange={onChange} className='w-full rounded-md text-xl bg-white border-gray-300  transition duration-150 ease-in-out focus:border-red-500 focus:ring-2 focus:ring-red-500' id="landClassification" name="landClassification">
                          <option value="intravilan">Intravilan</option>
                          <option value="extravilan">Extravilan</option>
                        </select>
                        <p className='text-lg font-semibold mt-3 text-white' >Suprafața teren(mp)</p>
                        <input type="number" id="landSurface" value={landSurface} onChange={onChange} required min='10'
                          className='w-full px-4 py-2 rounded-md text-xl bg-white border-gray-300  transition duration-150 ease-in-out focus:border-red-500 focus:ring-2 focus:ring-red-500' />
                        <p className='text-lg font-semibold mt-3 text-white' >Front stradal(m)</p>
                        <input type="number" id="streetfront" value={streetfront} onChange={onChange} required min='5'
                          className='w-full px-4 py-2 rounded-md text-xl bg-white border-gray-300  transition duration-150 ease-in-out focus:border-red-500 focus:ring-2 focus:ring-red-500' />
                      </div>
                    )}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>
      <form onSubmit={onSubmit}>
        <div className="text-center">
          <button type="submit" className='mb-3 mt-5 px-7 py-3 bg-red-500 text-gray-100 font-medium text-sm uppercase rounded-lg w-[150px] shadow-md hover:bg-red-600 hover:shadow-lg focus:bg-red-700 focus:shadow-lg active:bg-red-800 active:shadow-lg transition duration-150 ease-in-out'>Editează</button>
        </div>
      </form>
    </>
  );
}