import { db } from '@/service/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'sonner';
import InfoSection from './components/InfoSection';
import Hotels from './components/Hotels';
import PlacesToVisit from './components/PlacesToVisit';
import Footer from './components/Footer';

function Viewtrip() {

  const {tripId}=useParams();
  const [trip, setTrip]=useState([]);
  const [notFound, setNotFound] = useState(false);
  const navigate = useNavigate();

  useEffect(()=>{
    const user = JSON.parse(localStorage.getItem('user'));

    // If the user is not logged in, send them back to the landing page
    if (!user) {
      navigate('/');
      return;
    }

    tripId && GetTripData();
  },[tripId, navigate]);


  const GetTripData=async()=>{
    const docRef=doc(db,'AI-Trips',tripId);
    const docSnap=await getDoc(docRef);

    if(docSnap.exists()){
      console.log("Document:", docSnap.data());
      setTrip(docSnap.data());
      setNotFound(false);
    }
    else{
      console.log("No such Document");
      toast("No trip found");
      setNotFound(true);
    }
  }
  
  if (notFound) {
    return (
      <div className='px-5 sm:px-8 md:px-20 lg:px-32 xl:px-56 py-10 flex flex-col items-center justify-center text-center min-h-[60vh] bg-gray-50 dark:bg-slate-950 transition-colors duration-300'>
        <h2 className='text-2xl font-semibold mb-2'>Trip not found</h2>
        <p className='text-gray-500 mb-6'>This trip may have been deleted or never existed.</p>
        <a
          href="/my-trips"
          className='inline-flex items-center px-4 py-2 rounded-full bg-black text-white text-sm hover:bg-gray-800'
        >
          Back to My Trips
        </a>
      </div>
    );
  }

  return (
    <div className='px-5 sm:px-8 md:px-20 lg:px-32 xl:px-56 py-10 bg-gray-50 dark:bg-slate-950 min-h-[80vh] transition-colors duration-300'>
      {/*Information Section*/}
      <InfoSection trip={trip}/>
      {/* Recommended Hotels */}
      <Hotels trip={trip}/>

      {/* Daily Plan */}
      <PlacesToVisit trip={trip}/>
      {/* Footer */}
      <Footer trip={trip}/>
    </div>
  )
}

export default Viewtrip


