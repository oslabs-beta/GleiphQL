import React from 'react';
import loginGif from '../public/images/loginGif.gif';
import teamModalsGif from '../public/images/teamModalsGif.gif';
import dashboardGif from '../public/images/dashboardGif.gif';
import { FcLandscape, FcMoneyTransfer, FcPaid, FcBullish } from 'react-icons/fc';


const FeaturesSection: React.FC<{}> = () => {
  return (
    <>
      <div className='featuresSection-bg flex flex-col justify-center items-center px-5 py-10'>
        <h1>Features</h1>

        <section className='p-4 lg:p-8 bg-gray-600 text-gray-100 rounded-md'>
          <div className='container mx-auto space-y-12'>
            <div className='flex flex-col overflow-hidden rounded-md shadow-sm lg:flex-row'>
              <img src={loginGif} alt='' className='h-[360px] w-[640] bg-gray-500 aspect-video' />
              <div className='flex flex-col justify-center flex-1 p-6 bg-gray-800'>
                <div className='flex justify-center'>
                  <FcLandscape className='h-12 w-12'/>
                </div>
                <h3 className='text-3xl font-bold'>Check out this sick login functionality!</h3>
                <p className='my-6 dark:text-gray-200'>Omgosh these components are custom made? No MUI you say? Super impressive!!! Custom components?? Say no more, you're hired!</p>
              </div>
            </div>
            <div className='flex flex-col overflow-hidden rounded-md shadow-sm lg:flex-row-reverse'>
              <img src={teamModalsGif} alt='' className='h-[360px] w-[640] bg-gray-500 aspect-video' />
              <div className='flex flex-col justify-center flex-1 p-6 bg-gray-800'>
                <div className='flex justify-center'>
                  <FcMoneyTransfer className='h-12 w-12'/>
                  <FcPaid className='h-12 w-12'/>
                </div>
                <h3 className='text-3xl font-bold'>The Fantastic Four behind this dev tool</h3>
                <p className='my-6 dark:text-gray-200'>We present to you the fearsome four that developed this incredible complexity analysis / rate limiting tool. True assets to any corporation or team in need of top tier software engineers. Pay. Up.</p>
              </div>
            </div>
            <div className='flex flex-col overflow-hidden rounded-md shadow-sm lg:flex-row'>
              <img src={dashboardGif} alt='' className='h-[360px] w-[640] bg-gray-500 aspect-video' />
              <div className='flex flex-col justify-center flex-1 p-6 bg-gray-800'>
                <div className='flex justify-center'>
                  <FcBullish className='h-12 w-12'/>
                </div>
                <h3 className='text-3xl font-bold'>Dashboard Functionality</h3>
                <p className='my-6 dark:text-gray-200'>Here, we can observe the awesomeness that is the complexity analysis, rate limiting & monitoring tool at work. Bask in its glory!!!</p>
              </div>
            </div>
          </div>
        </section>


      </div>
    </>
  )
}

export default FeaturesSection;