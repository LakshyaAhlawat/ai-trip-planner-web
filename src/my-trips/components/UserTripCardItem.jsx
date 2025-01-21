// import React from 'react'

// function UserTripCardItem({trip}) {
//   return (
//     <div>
//       <img src="/placeholder.jpg"
//       className='object-cover rounded-xl' />
//       <div>
//         <h2 className='font-bold text-lg'>{trip?.userSelection?.location?.label}</h2>

//         <h2 className='text-sm text-gray-500'>{trip?.userSelection?.noOfDays}Days trip with {trip?.userSelection?.budget} Budget</h2>
//       </div> 
//     </div>
//   )
// }

// export default UserTripCardItem

import { GetPlaceDetails } from "@/service/GlobalApi";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const PHOTO_REF_URL =
  "https://places.googleapis.com/v1/{NAME}/media?maxHeightPx=600&maxWidthPx=600&key=" +
  import.meta.env.VITE_GOOGLE_PLACE_API_KEY;

function UserTripCardItem({ trip}) {
  const [photoUrl, setPhotoUrl] = useState("/placeholder.jpg"); // Placeholder as default

  useEffect(() => {
    if (trip) {
      fetchTripPhoto();
    }
  }, [trip]);

  const fetchTripPhoto = async () => {
    try {
      const data = {
        textQuery: trip?.userSelection?.location?.label, // Query based on the trip's location
      };

      const result = await GetPlaceDetails(data); // Assuming GetPlaceDetails is globally available
      const photoReference = result?.data?.places?.[0]?.photos?.[0]?.name;

      if (photoReference) {
        const generatedPhotoUrl = PHOTO_REF_URL.replace("{NAME}", photoReference);
        setPhotoUrl(generatedPhotoUrl); // Set the actual photo URL
      } else {
        setPhotoUrl("/placeholder.jpg"); // Use placeholder if no photo reference
      }
    } catch (err) {
      console.error("Error fetching trip photo:", err);
      setPhotoUrl("/placeholder.jpg"); // Use placeholder on error
    }
  };

  return (
    <Link to={`/view-trip/${trip?.id}`} className="block">
      <div className="bg-white rounded-xl shadow-lg p-4 hover:scale-105 transition-transform">
        <img
          src={photoUrl}
          alt={trip?.userSelection?.location?.label || "Trip Location"}
          className="object-cover rounded-xl w-full h-48"
        />
        <div className="mt-4">
          <h2 className="font-bold text-lg">
            {trip?.userSelection?.location?.label}
          </h2>
          <h2 className="text-sm text-gray-500">
            {trip?.userSelection?.noOfDays} Days trip with{" "}
            {trip?.userSelection?.budget} Budget
          </h2>
        </div>
      </div>
    </Link>
  );
}

export default UserTripCardItem;
