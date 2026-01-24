import React, { useEffect, useRef, useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Toaster } from "../components/ui/sonner";

import {
  AI_PROMPT,
  SelectBudgetOptions,
  SelectTravelesList,
  TravelStyleOptions,
  InterestTags,
} from "../constants/options";
import { toast } from "sonner";
import { chatSession } from "@/service/AIModal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogClose,
  DialogTrigger,
} from "../components/ui/dialog";

import { FcGoogle } from "react-icons/fc";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { collection, doc, getDocs, query, setDoc, where } from "firebase/firestore";
import { db } from "../service/firebaseConfig";
import { useNavigate } from "react-router";

function CreateTrip() {
  const [formData, setFormData] = useState({
    interests: [],
  });
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const generatingRef = useRef(false);
  const generationTokenRef = useRef(null);
  const navigate = useNavigate();

  const handleInputChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const fetchPlaceSuggestions = async (query) => {
    try {
      setIsSearching(true);
      const response = await axios.post(
        "https://places.googleapis.com/v1/places:searchText",
        { textQuery: query },
        {
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": import.meta.env.VITE_GOOGLE_PLACE_API_KEY,
            "X-Goog-FieldMask":
              "places.displayName,places.formattedAddress,places.id",
          },
        }
      );

      const places = response?.data?.places || [];
      setSuggestions(
        places.map((p) => ({
          id: p.id,
          name: p.displayName?.text || "",
          address: p.formattedAddress || "",
        }))
      );
    } catch (error) {
      console.error("Error fetching place suggestions", error);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    const label = suggestion.address
      ? `${suggestion.name}, ${suggestion.address}`
      : suggestion.name;
    setSearchText(label);
    handleInputChange("location", { label, placeId: suggestion.id });
    setSuggestions([]);
  };

  const login = useGoogleLogin({
    redirect_uri: window.location.origin,
    onSuccess: (codeResp) => {
      console.log("Access Token Response:", codeResp);
      GetUserProfile(codeResp); // Fetch user profile
    },
    onError: (error) => console.log("Login Error:", error),
  });

  const OnGenerateTrip = async () => {
    // Synchronously guard against any duplicate generations
    if (generatingRef.current) return;

    const user = localStorage.getItem("user");

    if (!user) {
      setOpenDialog(true);
      return;
    }

    if (!formData?.location || !formData?.noOfDays || !formData?.budget || !formData.people) {
      toast("Please fill all the details");
      return;
    }
    // Create a unique token for this AI generation so we can detect
    // and ignore any accidental duplicate saves.
    const token = (typeof crypto !== "undefined" && crypto.randomUUID)
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`;
    generationTokenRef.current = token;

    generatingRef.current = true;
    setLoading(true);

    const FINAL_PROMPT = AI_PROMPT.replace(
      "{location}",
      formData?.location?.label
    )
      .replace("{totalDays}", formData?.noOfDays)
      .replace("{traveler}", formData?.people)
      .replace("{budget}", formData?.budget)
      .replace("{tripStyle}", formData?.tripStyle || "Mixed")
      .replace("{interests}",
        Array.isArray(formData?.interests) && formData.interests.length
          ? formData.interests.join(", ")
          : "General sightseeing"
      )
      .replace("{totalDays}", formData?.noOfDays);

    try {
      const result = await chatSession.sendMessage(FINAL_PROMPT);
      const text = result?.response?.text();
      console.log("AI Response --", text);
      await SaveAiTrip(text, token);
    } catch (error) {
      console.error("Error generating trip", error);
      toast("Something went wrong while generating your trip. Please try again.");
      setLoading(false);
      generatingRef.current = false;
    }
  };

  const SaveAiTrip = async (TripData, token) => {
    setLoading(true);
    const user = JSON.parse(localStorage.getItem("user"));
    const generationToken = token || generationTokenRef.current;

    try {
      // Check if we already saved a trip for this generation token.
      if (generationToken) {
        const dupQuery = query(
          collection(db, "AI-Trips"),
          where("generationToken", "==", generationToken)
        );
        const dupSnap = await getDocs(dupQuery);
        if (!dupSnap.empty) {
          console.log("Duplicate generation detected, skipping save.");
          return; // Exit without creating another document
        }
      }

      const docId = Date.now().toString();
      const parsedTrip = typeof TripData === "string" ? JSON.parse(TripData) : TripData;
      await setDoc(doc(db, "AI-Trips", docId), {
        userSelection: formData,
        tripData: parsedTrip,
        userEmail: user?.email,
        id: docId,
        isFavorite: false,
        generationToken: generationToken || null,
      });
      navigate("/view-trip/" + docId);
    } catch (error) {
      console.error("Failed to save AI trip", error);
      toast("Could not save trip. Please try again.");
    } finally {
      setLoading(false);
      generatingRef.current = false;
    }
  };

  const GetUserProfile = (tokenInfo) => {
    axios
      .get(
        `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${tokenInfo?.access_token}`,
        {
          headers: {
            Authorization: `Bearer ${tokenInfo?.access_token}`,
            Accept: "Application/json",
          },
        }
      )
      .then((resp) => {
        console.log(resp);
        localStorage.setItem("user", JSON.stringify(resp.data));
        setOpenDialog(false);
        OnGenerateTrip();
      });
  };

  useEffect(() => {
    console.log(formData);
  }, [formData]);

  useEffect(() => {
    if (!searchText || searchText.length < 3) {
      setSuggestions([]);
      return;
    }

    const handler = setTimeout(() => {
      fetchPlaceSuggestions(searchText);
    }, 400);

    return () => clearTimeout(handler);
  }, [searchText]);

  const toggleInterest = (interest) => {
    setFormData((prev) => {
      const current = Array.isArray(prev.interests) ? prev.interests : [];
      if (current.includes(interest)) {
        return { ...prev, interests: current.filter((i) => i !== interest) };
      }
      return { ...prev, interests: [...current, interest] };
    });
  };

  const completedFields = [
    formData?.location,
    formData?.noOfDays,
    formData?.budget,
    formData?.people,
  ].filter(Boolean).length;
  const progressPercent = (completedFields / 4) * 100;

  return (
    <div className="sm:px-10 md:px-32 lg:px-56 xl:px-10 px-5 mt-10 pb-16 bg-gray-50 dark:bg-slate-950 min-h-[80vh] transition-colors duration-300">
      <h2 className="font-bold text-3xl">Tell us your Travel preference</h2>
      <p className="mt-3 text-gray-500 text-xl">
        Just provide some basic information, and our trip planner will generate
        a customized itinerary based on your preference
      </p>

      {/* Progress Indicator */}
      <div className="mt-6">
        <div className="flex justify-between text-sm text-gray-500 mb-1">
          <span>Trip setup progress</span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-2 bg-blue-500 rounded-full transition-all"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      <div className="mt-10 flex flex-col gap-10">
        <div>
          <h2 className="text-xl my-3 font-medium">
            What is your destination of choice?
          </h2>
          <div className="relative">
            <Input
              placeholder={"Ex. London"}
              value={searchText}
              onChange={(e) => {
                const value = e.target.value;
                setSearchText(value);
                handleInputChange(
                  "location",
                  value ? { label: value, value } : null
                );
              }}
            />
            {isSearching && (
              <p className="absolute left-3 top-full mt-1 text-xs text-gray-400">
                Searching destinations...
              </p>
            )}
            {suggestions.length > 0 && (
              <div className="absolute z-20 mt-1 w-full max-h-60 overflow-auto rounded-md border bg-white shadow-lg text-sm">
                {suggestions.map((s) => (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => handleSelectSuggestion(s)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100"
                  >
                    <div className="font-medium text-gray-800">{s.name}</div>
                    {s.address && (
                      <div className="text-xs text-gray-500">{s.address}</div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl my-3 font-medium">
            How many Days are you planning your Trip
          </h2>
          <Input
            placeholder={"Ex.3"}
            type="number"
            onChange={(e) => handleInputChange("noOfDays", e.target.value)}
          />
        </div>
      </div>

      <div>
        <h2 className="text-xl my-3 font-medium">What is your Budget?</h2>
        <div className="grid grid-cols-3 gap-5 mt-5">
          {SelectBudgetOptions.map((item, index) => {
            return (
              <div
                key={index}
                onClick={() => handleInputChange("budget", item.title)}
                className={`p-4 cursor-pointer rounded-xl border transition-all duration-200
                  ${
                    formData?.budget === item.title
                      ? "border-blue-500 ring-2 ring-blue-400/70 bg-blue-500/5 dark:border-blue-300 dark:ring-blue-300/60 dark:bg-blue-500/10 shadow-lg"
                      : "border-slate-200 bg-white/5 hover:border-blue-400/60 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/40"
                  }`}
              >
                <h2 className="text-4xl">{item.icon}</h2>
                <h2 className="font-bold text-lg">{item.title}</h2>
                <h2 className="text-sm text-gray-500">{item.desc}</h2>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="text-xl my-3 font-medium">
          Who do you plan on traveling with on your next adventure?
        </h2>
        <div className="grid grid-cols-3 gap-5 mt-5">
          {SelectTravelesList.map((item, index) => {
            return (
              <div
                key={index}
                onClick={() => handleInputChange("people", item.people)}
                className={`p-4 cursor-pointer rounded-xl border transition-all duration-200
                  ${
                    formData?.people === item.people
                      ? "border-emerald-500 ring-2 ring-emerald-400/70 bg-emerald-500/5 dark:border-emerald-400 dark:ring-emerald-300/60 dark:bg-emerald-500/10 shadow-lg"
                      : "border-slate-200 bg-white/5 hover:border-emerald-400/60 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/40"
                  }`}
              >
                <h2 className="text-4xl">{item.icon}</h2>
                <h2 className="font-bold text-lg">{item.title}</h2>
                <h2 className="text-sm text-gray-500">{item.desc}</h2>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl my-3 font-medium">What is your travel style?</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
          {TravelStyleOptions.map((item) => (
            <div
              key={item.id}
              onClick={() => handleInputChange("tripStyle", item.title)}
              className={`p-4 cursor-pointer rounded-xl border text-sm transition-all duration-200
                ${
                  formData?.tripStyle === item.title
                    ? "border-purple-500 ring-2 ring-purple-400/70 bg-purple-500/5 dark:border-purple-400 dark:ring-purple-300/60 dark:bg-purple-500/10 shadow-lg"
                    : "border-slate-200 bg-white/5 hover:border-purple-400/60 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/40"
                }`}
            >
              <h2 className="font-bold">{item.title}</h2>
              <p className="text-gray-500 text-xs mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl my-3 font-medium">What are you most interested in?</h2>
        <p className="text-sm text-gray-500 mb-3">Select a few to help us fine-tune your itinerary.</p>
        <div className="flex flex-wrap gap-2">
          {InterestTags.map((interest) => {
            const isActive = Array.isArray(formData?.interests) && formData.interests.includes(interest);
            return (
              <button
                type="button"
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={`px-3 py-1 rounded-full text-xs border transition-all
                  ${isActive ? "bg-emerald-500 text-white border-emerald-500" : "bg-white text-gray-700 hover:bg-gray-100"}`}
              >
                {interest}
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Summary */}
      <div className="mt-10 border rounded-xl p-5 bg-gray-50">
        <h3 className="font-semibold mb-2">Your trip summary</h3>
        <p className="text-sm text-gray-600 mb-3">
          We&apos;ll use these details to generate a personalized itinerary.
        </p>
        <div className="text-sm text-gray-700 space-y-1">
          <p>
            <span className="font-medium">Destination:</span>{" "}
            {formData?.location?.label || "Not chosen yet"}
          </p>
          <p>
            <span className="font-medium">Duration:</span>{" "}
            {formData?.noOfDays ? `${formData.noOfDays} days` : "Not set"}
          </p>
          <p>
            <span className="font-medium">Budget:</span>{" "}
            {formData?.budget || "Not selected"}
          </p>
          <p>
            <span className="font-medium">Travelers:</span>{" "}
            {formData?.people || "Not selected"}
          </p>
          <p>
            <span className="font-medium">Style:</span>{" "}
            {formData?.tripStyle || "Mixed"}
          </p>
          <p>
            <span className="font-medium">Interests:</span>{" "}
            {Array.isArray(formData?.interests) && formData.interests.length
              ? formData.interests.join(", ")
              : "General sightseeing"}
          </p>
        </div>
      </div>

      <div className="my-10 justify-end flex">
        <Button disabled={loading} onClick={OnGenerateTrip}>
          {loading ? (
            <AiOutlineLoading3Quarters className="h-7 w-7 animate-spin" />
          ) : (
            "Generate Trip"
          )}
        </Button>
      </div>

      <Dialog open={openDialog} onOpenChange={(open) => setOpenDialog(open)}>
        <DialogContent className="bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-50 border border-gray-200 dark:border-slate-700">
          <DialogHeader>
            <DialogDescription>
              <img src="/logo.svg" />
              <h2 className="font-bold text-lg mt-7">Sign In With Google</h2>
              <p>Sign In to the App with Google authentication Securely</p>

              <Button
                onClick={login}
                className="w-full mt-5 flex gap-4 items-center"
              >
                <FcGoogle className="h-7 w-7" />
                Sign In with Google
              </Button>
            </DialogDescription>
          </DialogHeader>
          {/* This DialogClose should now close the dialog properly */}

        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CreateTrip;
