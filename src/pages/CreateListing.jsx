import { useState } from "react";
import Spinner from "../components/Spinner";
import { toast } from "react-toastify";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { v4 as uuidv4 } from "uuid";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function CreateListing() {
    const navigate = useNavigate();
    const auth = getAuth();
    const [geolocationEnabled, setGeolocationEnabled] = useState(true);
    const [loading, setLoading] = useState(false);
    const [propertyType, setPropertyType] = useState('apartment');
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
    const { property, landtype, landClassification, utilSurface, landSurface, streetfront, type, title, rooms, bathrooms, partitioning, houseType, floor, constructionYear, parking, furnished, address, description, offer, regularPrice, discountedPrice, latitude, longitude, images } = formData
    function onChange(e) {
        let boolean = null;
        if (e.target.value === "true") {
            boolean = true;
        }
        if (e.target.value === "false") {
            boolean = false;
        }
        if (e.target.files) {
            setFormData((prevState) => ({
                ...prevState,
                images: e.target.files,
            }));
        }
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
            toast.error("Discounted price needs to be less than regular price");
            return;
        }
        if (images.length > 6) {
            setLoading(false);
            toast.error("maximum 6 images are allowed");
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
                toast.error("Te rog introdu o adresă existentă");
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
            toast.error("Imaginele nu au putut fi încărcate");
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
        } else if (propertyType === 'apartment') {
            delete formDataCopy.landClassification
            delete formDataCopy.landtype
            delete formDataCopy.landSurface
            delete formDataCopy.streetfront
            delete formDataCopy.houseType
            delete formDataCopy.floor
        } else if (propertyType === 'house') {
            delete formDataCopy.landClassification
            delete formDataCopy.landtype
            delete formDataCopy.landSurface
            delete formDataCopy.partitioning
        }
        delete formDataCopy.images;
        !formDataCopy.offer && delete formDataCopy.discountedPrice;
        delete formDataCopy.latitude;
        delete formDataCopy.longitude;
        const docRef = await addDoc(collection(db, "listings"), formDataCopy);
        setLoading(false);
        toast.success("Anunț creat");
        navigate(`/category/${formDataCopy.type}/${docRef.id}`);
    }
    if (loading) {
        return <Spinner />;
    }
    return (
        <main className='max-w-md px-2 mx-auto'>
            <h1 className='text-3xl text-center mt-6 font-bold'>Creează un anunț</h1>
            <form onSubmit={onSubmit}>
                <p className='text-lg mt-6 font-semibold'>Tip proprietate</p>
                <select value={property} onChange={onChange} className='w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600' id="property" name="property">
                    <option value="apartment">Apartament</option>
                    <option value="house">Casă</option>
                    <option value="land">Teren</option>
                </select>
                <div className='flex mt-6'>
                    <button type='button' id='type' value="sale" onClick={onChange}
                        className={`mr-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-out w-full 
                    ${type === "rent" ? "bg-white text-black" : "bg-slate-600 text-white"}`}>Spre vânzare</button>
                    <button type='button' id='type' value="rent" onClick={onChange}
                        className={`ml-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-out w-full 
                    ${type === "sale" ? "bg-white text-black" : "bg-slate-600 text-white"}`}>Spre închiriere</button>
                </div>
                {propertyType === 'apartment' && (
                    <div>
                        <p className='text-lg mt-6 font-semibold'>Compartimentare</p>
                        <select value={partitioning} onChange={onChange} className='w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600' id="partitioning" name="partitioning">
                            <option value="decomandat">Decomandat</option>
                            <option value="semidecomandat">Semidecomandat</option>
                            <option value="nedecomandat">Nedecomandat</option>
                            <option value="circular">Circular</option>
                            <option value="vagon">Vagon</option>
                        </select>
                        <p className='text-lg font-semibold mt-6' >Suprafața utilă(mp)</p>
                        <input type="number" id="utilSurface" value={utilSurface} onChange={onChange} required min='0'
                            className='w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:bg-white focus:text-gray-700 focus:border' />
                        <p className='text-lg mt-6 font-semibold'>Etaj</p>
                        <select value={floor} onChange={onChange} className='w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600' id="floor" name="floor">
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
                        <div className="flex space-x-6 mt-6 mb-6">
                            <div>
                                <p className='text-lg font-semibold'>Număr camere</p>
                                <input
                                    type='number'
                                    id='rooms'
                                    value={rooms}
                                    onChange={onChange}
                                    min='1'
                                    max='50'
                                    required
                                    className='w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 text-center'
                                />
                            </div>
                            <div>
                                {roomsNumber > 2 && (
                                    <div>
                                        <p className='text-lg font-semibold'>Număr băi</p>
                                        <input
                                            type='number'
                                            id='bathrooms'
                                            value={bathrooms}
                                            onChange={onChange}
                                            min='1'
                                            max='50'
                                            required
                                            className='w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 text-center'
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                        <p className='text-lg mt-6 font-semibold'>Loc de parcare</p>
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
                                <p className='text-lg mt-6 font-semibold'>Mobilat</p>
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
                        <p className='text-lg mt-6 font-semibold'>An clădire</p>
                        <select value={constructionYear} onChange={onChange} className='w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600' id="constructionYear" name="constructionYear">
                            <option value='Dupa 2000'>După 2000</option>
                            <option value='Intre 1990 si 2000'>Între 1990 și 2000</option>
                            <option value='Intre 1977 si 1990'>Între 1977 și 1990</option>
                            <option value='Inainte de 1977'>Înainte de 1977</option>
                        </select>
                    </div>
                )}
                {propertyType === 'house' && (
                    <div>
                        <p className='text-lg mt-6 font-semibold'>Tip locuință</p>
                        <select value={houseType} onChange={onChange} className='w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600' id="houseType" name="housetType">
                            <option value="individuala">Individuală</option>
                            <option value="duplex">Duplex</option>
                            <option value="triplex">Triplex</option>
                            <option value="insiruita">Înșiruită</option>
                            <option value="altele">Altele</option>
                        </select>
                        <p className='text-lg font-semibold mt-6' >Suprafața utilă(mp)</p>
                        <input type="number" id="utilSurface" value={utilSurface} onChange={onChange} required min='0'
                            className='w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:bg-white focus:text-gray-700 focus:border' />
                        <p className='text-lg font-semibold mt-6' >Suprafața teren(mp)</p>
                        <input type="number" id="landSurface" value={landSurface} onChange={onChange} required min='0'
                            className='w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:bg-white focus:text-gray-700 focus:border' />
                        <div className="flex space-x-6 mb-6 mt-6">
                            <div>
                                <p className='text-lg font-semibold'>Număr camere</p>
                                <input
                                    type='number'
                                    id='rooms'
                                    value={rooms}
                                    onChange={onChange}
                                    min='1'
                                    max='50'
                                    required
                                    className='w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 text-center'
                                />
                            </div>
                            <div>
                                {roomsNumber > 2 && (
                                    <div>
                                        <p className='text-lg font-semibold'>Număr băi</p>
                                        <input
                                            type='number'
                                            id='bathrooms'
                                            value={bathrooms}
                                            onChange={onChange}
                                            min='1'
                                            max='50'
                                            required
                                            className='w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 text-center'
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                        <p className='text-lg mt-6 font-semibold'>Loc de parcare</p>
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
                                <p className='text-lg mt-6 font-semibold'>Mobilat</p>
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
                        <p className='text-lg mt-6 font-semibold'>An clădire</p>
                        <select value={constructionYear} onChange={onChange} className='w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600' id="constructionYear" name="constructionYear">
                            <option value='Dupa 2000'>După 2000</option>
                            <option value='Intre 1990 si 2000'>Între 1990 și 2000</option>
                            <option value='Intre 1977 si 1990'>Între 1977 și 1990</option>
                            <option value='Inainte de 1977'>Înainte de 1977</option>
                        </select>

                    </div>
                )}
                {propertyType === 'land' && (
                    <div>
                        <p className='text-lg mt-6 font-semibold'>Tip teren</p>
                        <select value={landtype} onChange={onChange} className='w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600' id="landtype" name="landtype">
                            <option value="constructii">Constructii</option>
                            <option value="agricol">Agricol</option>
                            <option value="padure">Pădure</option>
                            <option value="livada">Livadă</option>
                        </select>
                        <p className='text-lg  font-semibold mt-6'>Clasificare teren</p>
                        <select value={landClassification} onChange={onChange} className='w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600' id="landClassification" name="landClassification">
                            <option value="intravilan">Intravilan</option>
                            <option value="extravilan">Extravilan</option>
                        </select>
                        <p className='text-lg font-semibold mt-6' >Suprafața teren(mp)</p>
                        <input type="number" id="landSurface" value={landSurface} onChange={onChange} required min='10'
                            className='w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:bg-white focus:text-gray-700 focus:border' />
                        <p className='text-lg font-semibold mt-6' >Front stradal(m)</p>
                        <input type="number" id="streetfront" value={streetfront} onChange={onChange} required min='5'
                            className='w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:bg-white focus:text-gray-700 focus:border  text-center' />
                    </div>
                )}

                <p className='text-lg mt-6 font-semibold'>Titlu anunț</p>
                <input type="text" id='title' value={title} onChange={onChange} placeholder="Titlu" maxLength="32" minLength="10" required
                    className='w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 mb-6' />
                <div className="mb-6">
                    <p className='text-lg font-semibold'>Imagini</p>
                    <p className='text-gray-600'>Prima imagine va fi cu titlu de prezentare (maxim 6)</p>
                    <input type="file" id='images' onChange={onChange} accept=".jpg,.png,.jpeg" multiple required
                        className='w-full px-3 py-1.5 text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:bg-white focus:border' />
                </div>
                <p className='text-lg mt-6 font-semibold'>Adresă</p>
                <textarea type="text" id='address' value={address} onChange={onChange} placeholder="Localizare" required
                    className='w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 mb-6' />
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
                <p className='text-lg font-semibold'>Descriere</p>
                <textarea type="text" id='description' value={description} onChange={onChange} placeholder="Detalii adiționale" required
                    className='w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 mb-6' />
                <p className='text-lg font-semibold'>Ofertă</p>
                <div className='flex mb-6'>
                    <button type='button' id='offer' value={true} onClick={onChange}
                        className={`mr-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-out w-full 
                    ${!offer ? "bg-white text-black" : "bg-slate-600 text-white"}`}>Da</button>
                    <button type='button' id='offer' value={false} onClick={onChange}
                        className={`ml-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-out w-full 
                    ${offer ? "bg-white text-black" : "bg-slate-600 text-white"}`}>Nu</button>
                </div>
                <div className='flex items-center mb-6'>
                    <div className=''>
                        <p className='text-lg font-semibold'>Preț fără discount</p>
                        <div className='flex w-full justify-center items-center space-x-6'>
                            <input type="number" id='regularPrice' value={regularPrice} onChange={onChange} min='50' max='4000000' required
                                className='w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 text-center' />
                            {type === "rent" && (
                                <div className=''>
                                    <p className='text-md w-full whitespace-nowrap'>€ / lună</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {offer && (
                    <div className='flex items-center mb-6'>
                        <div className=''>
                            <p className='text-lg font-semibold'>Preț cu discount</p>
                            <div className='flex w-full justify-center items-center space-x-6'>
                                <input type="number" id='discountedPrice' value={discountedPrice} onChange={onChange} min='50' max='4000000' required={offer}
                                    className='w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 text-center' />
                                {type === "rent" && (
                                    <div className=''>
                                        <p className='text-md w-full whitespace-nowrap'>€ / lună</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                <button type="submit" className='mb-6 w-full px-7 py-3 bg-blue-600 text-white font-medium text-sm uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out'>Creează anunț</button>
            </form>
        </main>
    );
}