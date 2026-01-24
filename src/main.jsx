import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router'
import Header from './components/ui/custom/Header'
import CreateTrip from './create-trip/index';
import { Toaster } from './components/ui/sonner'
import { GoogleOAuthProvider } from '@react-oauth/google'
import Viewtrip from './view-trip/[tripId]'
import MyTrips from './my-trips'
import Dashboard from './dashboard'


const router=createBrowserRouter([{
  path:'/',
  element:<App/>
},{
  path:'/dashboard',
  element:<Dashboard/>
},{
  path:'/create-trip',
  element:<CreateTrip/>
},
{
  path:'/view-trip/:tripId',
  element:<Viewtrip/>
},{
  path:'/my-trips',
  element:<MyTrips/>
}])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID}>
      <Header/>
      <Toaster/>
      <RouterProvider router={router}/>
    </GoogleOAuthProvider>
  </StrictMode>,
)
