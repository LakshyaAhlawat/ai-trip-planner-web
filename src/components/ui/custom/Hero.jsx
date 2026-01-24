import React from 'react'
import { Button } from '../button'
import { Link } from 'react-router'

function Hero() {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <div className='flex flex-col items-center px-6 md:px-10 lg:px-24 xl:px-40 gap-8 mt-12 text-center'>
      <h1 className='font-extrabold text-[32px] md:text-[44px] leading-tight'>
        <span className='text-[#f56551]'>Discover your next adventure with AI.</span>{' '}
        Plan smarter, not harder.
      </h1>

      <p className='text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl'>
        Your personal trip planner and travel curator, creating custom itineraries tailored to your
        interests, budget, and travel style  all in one beautiful dashboard.
      </p>

      <div className='flex flex-wrap justify-center gap-4'>
        <Link to={'/create-trip'}>
          <Button className='rounded-full px-8'>Get started, it&apos;s free</Button>
        </Link>
        {user && (
          <Link to={'/dashboard'}>
            <Button variant='outline' className='rounded-full px-8 border-gray-300 dark:border-slate-600'>
              View my travel dashboard
            </Button>
          </Link>
        )}
      </div>

      <img
        src="travel.jpg"
        className='mt-8 h-[260px] md:h-[360px] w-full max-w-3xl object-cover rounded-2xl shadow-lg'
      />
    </div>
  )
}

export default Hero

