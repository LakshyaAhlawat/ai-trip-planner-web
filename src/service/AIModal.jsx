import Groq from "groq-sdk";

const apiKey = import.meta.env.VITE_GROQ_API_KEY;
const groq = new Groq({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true,
});

export const chatSession = {
  sendMessage: async (prompt) => {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a professional travel assistant. Generate a travel plan in JSON format. The response must be a single JSON object with 'hotel_options' (array of hotels) and 'itinerary' (object with 'day1', 'day2', etc.). Each hotel must have: HotelName, HotelAddress, Price, Hotel_Image_url, geo_coordinates (latitude, longitude), rating, and descriptions. Each itinerary day must have: theme, best_time_to_visit, and 'places' (array of places). Each place must have: placeName, placeDetails, Place_image_Url, geo_coordinates (latitude, longitude), ticket_pricing, and time_to_travel. Do not include any text outside the JSON object.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
      max_tokens: 8000,
    });
    return {
      response: {
        text: () => chatCompletion.choices[0].message.content,
      },
    };
  },
};
