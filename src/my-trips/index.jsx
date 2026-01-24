import { db } from "@/service/firebaseConfig";
import { collection, deleteDoc, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router"; // Fixed import for navigation
import UserTripCardItem from "../my-trips/components/UserTripCardItem";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function MyTrips() {
  const navigate = useNavigate(); // Use navigate instead of useNavigation
  const [userTrips, setUserTrips] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [viewFilter, setViewFilter] = useState("all"); // all | favorites
  const [deleteTrip, setDeleteTrip] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  const handleDeleteRequest = (trip) => {
    if (!trip) return;
    setDeleteTrip(trip);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteTrip = async () => {
    if (!deleteTrip?.id) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "AI-Trips", deleteTrip.id));
      // Optimistically remove the deleted trip from local state so the UI updates instantly
      setUserTrips((prev) =>
        prev.filter((trip) => trip.id !== deleteTrip.id && trip !== deleteTrip)
      );
      setDeleteDialogOpen(false);
      setDeleteTrip(null);
    } catch (error) {
      console.error("Failed to delete trip", error);
      alert("Could not delete this trip. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const filteredTrips = useMemo(() => {
    let trips = [...userTrips];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      trips = trips.filter((trip) =>
        trip?.userSelection?.location?.label?.toLowerCase().includes(term)
      );
    }

    if (viewFilter === "favorites") {
      trips = trips.filter((trip) => trip?.isFavorite);
    }

    trips.sort((a, b) => {
      const aId = Number(a.id || 0);
      const bId = Number(b.id || 0);
      if (sortBy === "oldest") return aId - bId;
      return bId - aId; // newest first
    });

    return trips;
  }, [userTrips, searchTerm, sortBy, viewFilter]);

  const handleToggleFavorite = async (trip) => {
    if (!trip?.id) return;
    const newValue = !trip.isFavorite;

    // Optimistically update local state for instant UI feedback
    setUserTrips((prev) =>
      prev.map((t) => (t.id === trip.id ? { ...t, isFavorite: newValue } : t))
    );

    try {
      await updateDoc(doc(db, "AI-Trips", trip.id), { isFavorite: newValue });
    } catch (error) {
      console.error("Failed to update favorite status", error);
      // Revert if the update fails
      setUserTrips((prev) =>
        prev.map((t) => (t.id === trip.id ? { ...t, isFavorite: trip.isFavorite } : t))
      );
    }
  };

  return (
    <div className="px-5 sm:px-6 md:px-10 lg:px-20 xl:px-32 mt-10 pb-16 bg-gray-50 dark:bg-slate-950 min-h-[80vh] transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
      <h2 className="font-bold text-3xl">My Trips</h2>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-300 max-w-xl">
        Browse, search, favorite and manage all the trips you&apos;ve created with the planner.
      </p>
      <div className="mt-5 flex flex-col md:flex-row gap-3 md:items-center justify-between rounded-2xl border bg-white/70 dark:bg-slate-900/70 px-4 py-3 shadow-sm backdrop-blur-sm">
        <Input
          placeholder="Search by destination..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="md:w-1/2"
        />
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setViewFilter("all")}
            className={`text-xs md:text-sm px-3 py-1.5 rounded-full border transition-colors ${
              viewFilter === "all"
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-700 dark:bg-slate-900 dark:text-gray-200 border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800"
            }`}
          >
            All trips
          </button>
          <button
            type="button"
            onClick={() => setViewFilter("favorites")}
            className={`text-xs md:text-sm px-3 py-1.5 rounded-full border transition-colors ${
              viewFilter === "favorites"
                ? "bg-amber-500 text-white border-amber-500"
                : "bg-white text-gray-700 dark:bg-slate-900 dark:text-gray-200 border-gray-200 dark:border-slate-700 hover:bg-amber-50 dark:hover:bg-amber-900/40"
            }`}
          >
            Favorites
          </button>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border rounded-md px-3 py-2 text-xs md:text-sm bg-white dark:bg-slate-900 dark:text-gray-100 dark:border-slate-700"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>
      </div>

      {filteredTrips.length === 0 ? (
        <div className="mt-10 text-center text-gray-500 dark:text-gray-300">
          {userTrips.length === 0
            ? "No trips found yet. Start by creating your first trip from the home page."
            : "No trips match your current search or filters."}
        </div>
      ) : (
        <div className="grid mt-10 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredTrips.map((trip) => (
            <UserTripCardItem
              key={trip.id}
              trip={trip}
              onDelete={handleDeleteRequest}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md bg-background text-foreground border border-border">
          <DialogHeader>
            <DialogTitle>Delete this trip?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. We&apos;ll permanently remove this
              trip from your account.
            </DialogDescription>
          </DialogHeader>

          {deleteTrip && (
            <div className="mt-4 rounded-xl border bg-card text-card-foreground dark:bg-slate-900/70 p-4 text-sm text-gray-700 dark:text-gray-200 space-y-1">
              <p className="font-medium truncate">
                {deleteTrip?.userSelection?.location?.label || "Untitled trip"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {deleteTrip?.userSelection?.noOfDays || "-"} days ·{" "}
                {deleteTrip?.userSelection?.budget || "No budget set"}
              </p>
            </div>
          )}

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDeleteTrip}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Yes, delete it"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}

export default MyTrips;
