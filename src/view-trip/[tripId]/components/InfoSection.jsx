import { Button } from '@/components/ui/button'
import { GetPlaceDetails } from '@/service/GlobalApi';
import React, { useEffect, useState } from 'react'
import { IoIosSend } from "react-icons/io";
import { toast } from 'sonner';

const PHOTO_REF_URL = 'https://places.googleapis.com/v1/{NAME}/media?maxHeightPx=2400&maxWidthPx=2400&key=' + import.meta.env.VITE_GOOGLE_PLACE_API_KEY

function InfoSection({ trip }) {

  const [photoUrl, setPhotoUrl] = useState('/placeholder.jpg');

  useEffect(() => {
    if (trip?.userSelection?.location?.label) {
      GetPlacePhoto();
    }
  }, [trip]);

  const GetPlacePhoto = async () => {
    try {
      const data = {
        textQuery: trip?.userSelection?.location?.label,
      };
      const resp = await GetPlaceDetails(data);
      const photoName = resp?.data?.places?.[0]?.photos?.[0]?.name;

      if (photoName) {
        const photoUrlFromApi = PHOTO_REF_URL.replace('{NAME}', photoName);
        setPhotoUrl(photoUrlFromApi);
      } else {
        setPhotoUrl('/placeholder.jpg');
      }
    } catch (error) {
      console.error('Error fetching place photo', error);
      setPhotoUrl('/placeholder.jpg');
    }
  };

  const handleShareTrip = async () => {
    const shareUrl = window.location.href;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast("Trip link copied to clipboard!");
    } catch (error) {
      console.error('Failed to copy link', error);
      toast("Unable to copy link. You can share the URL manually.");
    }
  };

  return (
    <div>
      <img src={photoUrl} className='h-[340px] w-full object-cover rounded-xl' />
      <div className='flex justify-between items-center'>
        <div className='my-5 flex flex-col gap-2'>
          <h2 className='font-bold text-2xl'>{trip?.userSelection?.location?.label}</h2>

          <div className='flex flex-wrap gap-3'>
            <h2 className='p-1 px-3 bg-gray-200 rounded-full text-gray-500 text-xs md:text-md'>📅 {trip.userSelection?.noOfDays} Days</h2>

            <h2 className='p-1 px-3 bg-gray-200 rounded-full text-gray-500 text-xs md:text-md'>💰 {trip.userSelection?.budget} Budget</h2>

            <h2 className='p-1 px-3 bg-gray-200 rounded-full text-gray-500 text-xs md:text-md'>🥂 Travelers: {trip.userSelection?.people}</h2>

            {trip?.userSelection?.tripStyle && (
              <h2 className='p-1 px-3 bg-blue-100 rounded-full text-blue-600 text-xs md:text-md'>✨ Style: {trip.userSelection.tripStyle}</h2>
            )}
          </div>

          {trip?.userSelection?.interests && Array.isArray(trip.userSelection.interests) && trip.userSelection.interests.length > 0 && (
            <div className='mt-2 flex flex-wrap gap-2'>
              {trip.userSelection.interests.map((interest) => (
                <span
                  key={interest}
                  className='px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs'
                >
                  {interest}
                </span>
              ))}
            </div>
          )}
        </div>
        <Button onClick={handleShareTrip} title="Copy shareable link">
          <IoIosSend className="mr-1" /> Share
        </Button>
      </div>
    </div>
  )
}

export default InfoSection
