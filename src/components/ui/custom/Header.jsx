import React, { useEffect, useState } from 'react';
import { Button } from '../button';
import { FcGoogle } from "react-icons/fc";
import axios from "axios";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogClose, // Import the DialogClose component
} from "@/components/ui/dialog";
import { Moon, Sun } from "lucide-react";

function Header() {
  const user = JSON.parse(localStorage.getItem('user')); // Fetch user from localStorage
  const [openDialog, setOpenDialog] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    console.log(user); // Log user details
  }, []); // Add an empty dependency array to run only on mount

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const login = useGoogleLogin({
    redirect_uri: window.location.origin,
    onSuccess: (codeResp) => {
      console.log("Access Token Response:", codeResp);
      GetUserProfile(codeResp); // Fetch user profile
    },
    onError: (error) => console.log("Login Error:", error),
  });

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
        window.location.reload();
      });
  };

  const getUserInitials = () => {
    const name = user?.name || "";
    const parts = name.trim().split(" ");
    if (!parts.length) return "U";
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0).toUpperCase() + parts[parts.length - 1].charAt(0).toUpperCase()
    );
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="shadow-sm flex flex-wrap sm:flex-nowrap justify-between items-center gap-3 px-4 sm:px-5 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-gray-100 dark:border-slate-800 transition-colors duration-300">
      <a href="/" className="flex items-center gap-2 shrink-0">
        <img src="/logo.svg" alt="Logo" className="h-8" />
      </a>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 justify-end flex-1">
        <button
          type="button"
          onClick={toggleTheme}
          className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-gray-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          aria-label="Toggle color theme"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        {user ? (
          <div className='flex items-center gap-2 sm:gap-3'>
            {/* Main nav actions are hidden on very small screens to avoid wrapping */}
            <div className="hidden sm:flex items-center gap-2 sm:gap-3">
              <a href="/dashboard">
                <Button variant="outline" className="rounded-full text-sm px-4 hidden md:inline-flex">Dashboard</Button>
              </a>
              <a href="/my-trips">
                <Button variant="outline" className="rounded-full text-sm px-4">My Trips</Button>
              </a>
              <a href="/create-trip">
                <Button variant="outline" className="rounded-full text-sm px-4">+ Create Trips</Button>
              </a>
            </div>

            <Popover>
              <PopoverTrigger>
                <button className='flex items-center gap-2 rounded-full bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 px-2 py-1 transition-colors'>
                  {user?.picture && !avatarError ? (
                    <img
                      src={user.picture}
                      alt={user?.name || "User"}
                      className='h-8 w-8 rounded-full object-cover border border-gray-300'
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    <div className='h-8 w-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-medium border border-gray-700'>
                      {getUserInitials()}
                    </div>
                  )}
                  <span className='hidden sm:inline text-xs text-gray-700 dark:text-gray-200 max-w-[120px] truncate'>
                    {user?.name}
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className='w-52 text-sm bg-popover text-popover-foreground'>
                <div className='mb-3'>
                  <p className='font-medium truncate text-foreground'>{user?.name}</p>
                  <p className='text-xs text-gray-500 dark:text-gray-300 truncate'>{user?.email}</p>
                </div>
                <div className="mb-2 space-y-1">
                  <a
                    href="/dashboard"
                    className="block w-full rounded-md px-2 py-1 text-left hover:bg-accent hover:text-accent-foreground text-xs"
                  >
                    Dashboard
                  </a>
                  <a
                    href="/my-trips"
                    className="block w-full rounded-md px-2 py-1 text-left hover:bg-accent hover:text-accent-foreground text-xs"
                  >
                    My Trips
                  </a>
                  <a
                    href="/create-trip"
                    className="block w-full rounded-md px-2 py-1 text-left hover:bg-accent hover:text-accent-foreground text-xs"
                  >
                    + Create Trips
                  </a>
                </div>
                <button
                  className='w-full text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-md px-2 py-1'
                  onClick={() => {
                    googleLogout();
                    localStorage.clear();
                    // Always send user back to the main landing page after logout
                    window.location.href = "/";
                  }}
                >
                  Logout
                </button>
              </PopoverContent>
            </Popover>
          </div>
        ) : (
          <Button onClick={() => setOpenDialog(true)} className="rounded-full text-xs sm:text-sm px-4 sm:px-5 py-2">
            Sign In
          </Button>
        )}
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
          {/* DialogClose component to close the dialog */}
          
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Header;
