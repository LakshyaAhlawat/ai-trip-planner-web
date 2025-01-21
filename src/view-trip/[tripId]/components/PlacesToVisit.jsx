import React, { useEffect, useState } from 'react';
import { GetPlaceDetails } from '@/service/GlobalApi';

const PHOTO_REF_URL =
  'https://places.googleapis.com/v1/{NAME}/media?maxHeightPx=1000&maxWidthPx=1000&key=' +
  import.meta.env.VITE_GOOGLE_PLACE_API_KEY;

function PlacesToVisit({ trip }) {
  const [placePhotos, setPlacePhotos] = useState({}); // To store photo URLs for each place

  useEffect(() => {
    if (trip?.tripData?.itinerary) {
      fetchPlacePhotos();
    }
  }, [trip]);

  const fetchPlacePhotos = async () => {
    const updatedPlacePhotos = {};

    // Iterate over all places in the itinerary and fetch photos concurrently
    const promises = Object.entries(trip.tripData.itinerary).flatMap(([dayKey, day]) =>
      day.places?.map(async (place) => {
        const data = { textQuery: place?.placeName };
        try {
          const resp = await GetPlaceDetails(data);
          const photoName = resp?.data?.places[0]?.photos?.[0]?.name; // Fetch the first photo's name
          if (photoName) {
            const photoUrl = PHOTO_REF_URL.replace('{NAME}', photoName);
            updatedPlacePhotos[place.placeName] = photoUrl; // Map photo URL to place name
          }
        } catch (error) {
          console.error(`Error fetching photo for ${place?.placeName}:`, error);
          updatedPlacePhotos[place.placeName] = '/placeholder.jpg'; // Fallback to placeholder
        }
      })
    );

    await Promise.all(promises); // Wait for all API requests to resolve
    setPlacePhotos(updatedPlacePhotos); // Update state after all photos are fetched
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4">
      <h2 className="font-bold text-3xl text-center text-blue-600 mb-6">Places to Visit</h2>

      <div className="space-y-8">
        {trip?.tripData?.itinerary &&
          Object.entries(trip.tripData.itinerary).map(([dayKey, day]) => {
            return (
              <div key={dayKey} className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-2xl font-semibold text-indigo-700 mb-4">{dayKey.toUpperCase()}</h3>
                <div className="text-lg text-gray-700 mb-4">
                  <strong>Best Time to Visit:</strong>{' '}
                  <span className="font-medium text-green-600">{day.best_time_to_visit}</span>
                </div>
                <div>
                  <strong className="block text-lg text-gray-700">Places:</strong>
                  <div className="grid grid-cols-1 cursor-pointer transition-all hover:scale-105 md:grid-cols-2 gap-8 mt-4">
                    {day.places?.map((place, index) => (
                      <div
                        key={index}
                        className="bg-blue-50 p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
                      >
                        <div className="text-lg text-gray-800 font-semibold mb-2">{place.placeName || 'Not available'}</div>

                        <div className="text-gray-600 mb-2">
                          <strong>Ticket Pricing: </strong>
                          <span className="text-blue-500">{place.ticket_pricing || 'Not available'}</span>
                        </div>

                        <div className="text-gray-600 mb-4">
                          <strong>Details: </strong>
                          <p className="text-sm">{place.placeDetails || 'Not available'}</p>
                        </div>

                        {/* Display Place Photo */}
                        {place.placeName && (
                          <div className="mb-4">
                            <img
                              src={placePhotos[place.placeName] || '/placeholder.jpg'}
                              alt={place.placeName}
                              className="w-full h-48 object-cover rounded-lg shadow-xl"
                            />
                          </div>
                        )}

                        <div className="text-gray-500 text-sm">
                          <strong>Geo Coordinates:</strong>{' '}
                          {place.geo_coordinates ? (
                            <span>
                              Latitude: <span className="text-blue-600">{place.geo_coordinates.latitude}</span>, Longitude:{' '}
                              <span className="text-blue-600">{place.geo_coordinates.longitude}</span>
                            </span>
                          ) : (
                            'Not available'
                          )}
                        </div>

                        {/* Google Maps Link */}
                        {place.geo_coordinates && (
                          <div className="mt-4">
                            <a
                              href={`https://www.google.com/maps?q=${place.geo_coordinates.latitude},${place.geo_coordinates.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              View on Google Maps
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default PlacesToVisit;
