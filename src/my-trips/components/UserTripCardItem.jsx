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
import { FiTrash2 } from "react-icons/fi";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";

const PHOTO_REF_URL =
  "https://places.googleapis.com/v1/{NAME}/media?maxHeightPx=600&maxWidthPx=600&key=" +
  import.meta.env.VITE_GOOGLE_PLACE_API_KEY;

function UserTripCardItem({ trip, onDelete, onToggleFavorite }) {
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

  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(trip);
    }
  };

  return (
    <Link to={`/view-trip/${trip?.id}`} className="block group">
      <div className="relative bg-card text-card-foreground dark:bg-slate-900 dark:text-slate-50 rounded-xl shadow-md hover:shadow-2xl border border-gray-100 dark:border-slate-800 p-4 hover:scale-[1.03] hover:-translate-y-1 transition-transform transition-shadow transition-colors duration-300 overflow-hidden">
        {/* Favorite toggle */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleFavorite && onToggleFavorite(trip);
          }}
          className="absolute top-3 left-3 z-10 inline-flex items-center justify-center rounded-full bg-white/90 dark:bg-slate-900/90 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950 border border-amber-100 dark:border-amber-300/60 p-1.5 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label={trip?.isFavorite ? "Unfavorite trip" : "Favorite trip"}
        >
          {trip?.isFavorite ? (
            <AiFillStar className="h-4 w-4" />
          ) : (
            <AiOutlineStar className="h-4 w-4" />
          )}
        </button>
        <button
          type="button"
          onClick={handleDeleteClick}
          className="absolute top-3 right-3 z-10 inline-flex items-center justify-center rounded-full bg-white/90 dark:bg-slate-900/90 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 border border-red-100 dark:border-red-300/60 p-1.5 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Delete trip"
        >
          <FiTrash2 className="h-4 w-4" />
        </button>

        <img
          src={photoUrl}
          alt={trip?.userSelection?.location?.label || "Trip Location"}
          className="object-cover rounded-lg w-full h-44"
        />
        <div className="mt-4">
          <h2 className="font-semibold text-base truncate">
            {trip?.userSelection?.location?.label}
          </h2>
          <h2 className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {trip?.userSelection?.noOfDays} days · {trip?.userSelection?.budget} budget
          </h2>
        </div>
      </div>
    </Link>
  );
}

export default UserTripCardItem;
