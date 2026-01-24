export const SelectTravelesList=[
  {
    id:1,
    title:'Just Me',
    desc:'A sole traveles in exploration',
    icon:'✈️',
    people:'1'
  },
  {
    id:2,
    title:'A Couple',
    desc:'Two traveles in tandem',
    icon:'🥂',
    people:'2'
  },
  {
    id:3,
    title:'Family',
    desc:'A group of fun loving adventure',
    icon:'🏠',
    people:'3 to 5 people'
  },
  {
    id:4,
    title:'Friends',
    desc:'A bunch of thrill-seekes',
    icon:'🏠',
    people:'5 to 10 people'
  },
]

export const SelectBudgetOptions=[
  {
    id:1,
    title:'Cheap',
    desc:'Stay conscious of costs',
    icon:'💸',

  },
  {
    id:2,
    title:'Moderate',
    desc:'Keep cost on the average side',
    icon:'💰',
  },
  {
    id:3,
    title:'Luxury',
    desc:'Dont worry about costs',
    icon:'👜',
  }
]

export const TravelStyleOptions = [
  {
    id: 1,
    title: 'Relaxed',
    desc: 'Slow-paced days with plenty of downtime',
  },
  {
    id: 2,
    title: 'Adventure',
    desc: 'High-energy activities and exploration',
  },
  {
    id: 3,
    title: 'Culture',
    desc: 'Museums, history, and local experiences',
  },
  {
    id: 4,
    title: 'Nightlife',
    desc: 'Bars, clubs, and late-night fun',
  },
]

export const InterestTags = [
  'Food & Cafes',
  'Nature & Parks',
  'Museums & Art',
  'Shopping',
  'Beaches',
  'Hiking',
  'Photography',
  'Kids Friendly',
]

export const AI_PROMPT='Generate a detailed travel plan for location: {location}, for {totalDays} Days for {traveler} with a {budget} budget and a preferred travel style of {tripStyle}. Focus on the following interests: {interests}. Give me a hotels options list with HotelName, Hotel address, Price, hotel image url, geo coordinates, rating, descriptions and suggest an itinerary with placeName, placeDetails, Place Image Url, Geo coordinates, ticket pricing, time to travel to each of the locations for {totalDays} days with each day plan and best time to visit in JSON format.'