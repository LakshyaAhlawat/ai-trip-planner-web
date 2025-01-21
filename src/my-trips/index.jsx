import { db } from "@/service/firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router"; // Fixed import for navigation
import UserTripCardItem from "../my-trips/components/UserTripCardItem";

function MyTrips() {
  const navigate = useNavigate(); // Use navigate instead of useNavigation
  const [userTrips, setUserTrips] = useState([]);

  useEffect(() => {
    GetUserTrips();
  }, []);

  const GetUserTrips = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      navigate("/"); // Redirect to the home page if the user is not logged in
      return;
    }
    setUserTrips([]);
    const q = query(
      collection(db, "AI-Trips"),
      where("userEmail", "==", user?.email)
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      console.log(doc.id, " => ", doc.data());
      setUserTrips((prevVal) => [...prevVal, doc.data()]);
    });
  };

  return (
    <div className="sm:px-10 md:px-32 lg:px-56 xl:px-10 px-5 mt-10">
      <h2 className="font-bold text-3xl">My Trips</h2>

      <div className="grid mt-10 grid-cols-2 md:grid-cols-3 gap-5">
        {/* Ensure to return the JSX inside the map */}
        {userTrips.map((trip, index) => (
          <UserTripCardItem key={index} trip={trip}  />
        ))}
      </div>
    </div>
  );
}

export default MyTrips;
