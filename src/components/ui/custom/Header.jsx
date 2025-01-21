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
import { useNavigation } from 'react-router';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogClose, // Import the DialogClose component
} from "@/components/ui/dialog";

function Header() {
  const user = JSON.parse(localStorage.getItem('user')); // Fetch user from localStorage
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    console.log(user); // Log user details
  }, []); // Add an empty dependency array to run only on mount

  const login = useGoogleLogin({
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

  return (
    <div className="shadow-sm flex justify-between items-center px-5 p-3">
      <img src="/logo.svg" alt="Logo" />
      <div>
        {user ? (
          <div className='flex items-center gap-3'>
            <a href="/my-trips">
              <Button variant="outline" className="rounded-full">My Trips</Button>
            </a>
            <a href="/create-trip">
              <Button variant="outline" className="rounded-full">+ Create Trips</Button>
            </a>

            <Popover>
              <PopoverTrigger>
                <img src={user?.picture} className='h-[35px] w-[35px] rounded-full' />
              </PopoverTrigger>
              <PopoverContent>
                <h2
                  className='cursor-pointer'
                  onClick={() => {
                    googleLogout();
                    localStorage.clear();
                    window.location.reload();
                  }}
                >
                  Logout
                </h2>
              </PopoverContent>
            </Popover>
          </div>
        ) : (
          <Button onClick={() => setOpenDialog(true)}>Sign In</Button>
        )}
      </div>

      <Dialog open={openDialog} onOpenChange={(open) => setOpenDialog(open)}>
        <DialogContent>
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
