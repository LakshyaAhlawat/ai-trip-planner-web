import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { GetPlaceDetails } from "@/service/GlobalApi";

const PHOTO_REF_URL =
  "https://places.googleapis.com/v1/{NAME}/media?maxHeightPx=1200&maxWidthPx=1200&key=" +
  import.meta.env.VITE_GOOGLE_PLACE_API_KEY;

function Hotels({ trip }) {
  const [hotelPhotos, setHotelPhotos] = useState({}); // To store photo URLs for each hotel

  useEffect(() => {
    if (trip?.tripData?.hotel_options) {
      fetchHotelPhotos();
    }
  }, [trip]);

  const fetchHotelPhotos = async () => {
    const updatedHotelPhotos = {};

    // Use Promise.all to fetch all photos concurrently
    const promises = trip.tripData.hotel_options.map(async (hotel) => {
      const data = { textQuery: hotel?.HotelName };
      try {
        const resp = await GetPlaceDetails(data);
        const photoName = resp?.data?.places[0]?.photos?.[0]?.name; // Fetch the first photo's name
        if (photoName) {
          const photoUrl = PHOTO_REF_URL.replace("{NAME}", photoName);
          updatedHotelPhotos[hotel.HotelName] = photoUrl; // Map photo URL to hotel name
        }
      } catch (error) {
        console.error(`Error fetching photo for ${hotel?.HotelName}:`, error);
        updatedHotelPhotos[hotel.HotelName] = "/placeholder.jpg"; // Fallback to placeholder
      }
    });

    await Promise.all(promises); // Wait for all API requests to resolve
    setHotelPhotos(updatedHotelPhotos); // Update state after all photos are fetched
  };

  return (
    <div>
      <h2 className="font-bold text-xl mt-5">Hotel Recommendation</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
        {trip?.tripData?.hotel_options?.map((hotel, index) => (
          <Link
            key={index}
            to={`https://www.google.com/maps?q=${encodeURIComponent(
              hotel?.HotelAddress
            )}`}
            target="_blank" // Opens in a new tab
            rel="noopener noreferrer" // Prevents security vulnerabilities
            className="hover:scale-105 transition-all cursor-pointer"
          >
            {/* Display hotel photo or placeholder */}
            <img
              src={hotelPhotos[hotel.HotelName] || "/placeholder.jpg"}
              className="rounded-xl h-[200px] w-full object-cover"
              alt={hotel?.HotelName || "Hotel"}
            />

            <div className="my-2 flex flex-col gap-2">
              <h2 className="font-medium">{hotel?.HotelName}</h2>
              <h2 className="text-xs text-gray-500">
                📍 {hotel?.HotelAddress}
              </h2>
              <h2 className="text-sm">💸 {hotel?.Price}</h2>
              <h2 className="text-sm">⭐ {hotel?.rating}</h2>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Hotels;
