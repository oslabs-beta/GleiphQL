import React, { useState } from 'react';
import loginGif from '../public/images/loginGif.gif';
import teamModalsGif from '../public/images/teamModalsGif.gif';
import dashboardGif from '../public/images/dashboardGif.gif';
import testingGif from '../public/images/mrBean-Testing.gif';
import gleiphGif from '../public/images/gleiphQLGif.gif';
import { FcLandscape, FcMoneyTransfer, FcPaid, FcBullish } from 'react-icons/fc';


const FeaturesSection: React.FC<{}> = () => {
  // declare an array for all the gifs to display in this component:
  const featuresData = [
    // the first element in the array is the default gif that will render
    { gifUrl: gleiphGif, isVisible: true },
    // the subsequent elements represent the GIFs for each feature
    { gifUrl: loginGif, isVisible: false },
    { gifUrl: teamModalsGif, isVisible: false },
    { gifUrl: dashboardGif, isVisible: false },
    { gifUrl: testingGif, isVisible: false }
  ];

  // hook to manage features:
  const [features, setFeatures] = useState(featuresData);
  
  // function to toggle the visibility of a features's GIF:
  const toggleGifVisibility = (index: number) => {
    setFeatures((prevFeatures) => {
      const updatedFeatures = [...prevFeatures];

      // hide the default GIF by setting isVisible to false at index 0
      if (index !== 0) {
        updatedFeatures[0].isVisible = false;
      }

      updatedFeatures.forEach((feature, i) => {
        // set the current feature's visibility based on the provided index
        feature.isVisible = i === index;
      });
      return updatedFeatures;
    });
  };


  return (
    <>
      <div className='featuresSection-bg flex flex-col justify-center items-center px-5 py-10'>
        <h1>Features</h1>

        <section className='relative pt-16'>
          <div className='container mx-auto'>
            <div className='flex flex-wrap items-center'>

              {/* Start of the image container */}
              <div className='w-10/12 md:w-6/12 lg:w-4/12 px-12 md:px-4 mr-auto ml-auto -mt-78'>
                <div className='relative flex min-w-0 bg-white-200 w-full mb-6 shadow-lg rounded-lg'>
                  {/* Use conditional rendering to show the proper GIF*/}
                  
                  {features[0].isVisible ? (
                    // if the isVisible property of the default GIF (index 0) is true, render it
                    <img alt='...' src={features[0].gifUrl} className='w-full h-auto align-middle rounded-lg' />
                  ) : (
                    // if condition is false, render the other GIFs
                    <>
                      {features.map((feature, index) => {
                        // use the map function to iterate over all features (including the default value)
                        if (index !== 0 && feature.isVisible) {
                          // checkif the current feature is not the default one (index 0) and its isVisible property is true
                          // if both conditions are true, render the GIF for this feature
                          return (
                            <img key={index} alt='...' src={feature.gifUrl} className='w-full h-auto align-middle rounded-lg' />
                          );
                        }
                        // if none conditions are met, return nothing
                        return null;
                      })}
                    </>
                  )}
                </div>
              </div>

              {/* start of features content */}
              <div className='w-full md:w-6/12 px-4'>
                <div className='flex flex-wrap'>

                  {/* start of left features column */}
                  <div className='w-full md:w-6/12 px-4'>

                    {/* start of first feature's section */}
                    <div className='relative flex flex-col mt-4'>
                      <div className='px-4 py-5 flex-auto'>
                        <div className='p-3 text-center inline-flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-full bg-white'>
                          <FcLandscape size={48}/>
                        </div>
                        <h6 className='text-xl mb-1 font-semibold'>Complexity Analysis</h6>
                        <p className='mb-4'>
                          Accurate complexity scores to resource intensive each server request maybe. 
                        </p>
                        <button 
                          className='m-2 p-2 rounded-md bg-sky-900 shadow-lg shadow-sky-500/50 hover:shadow-sky-500/40 hover:bg-sky-600 text-white'
                          // asigning the button to toggle the GIF index at input number
                          onClick={() => toggleGifVisibility(1)}
                        >Let's see feature 1 in action</button>
                      </div>
                    </div>

                    {/* start of second feature 'Javascript components' */}
                    <div className='relative flex flex-col min-w-0'>
                      <div className='px-4 py-5 flex-auto'>
                        <div className='p-3 text-center inline-flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-full bg-white'>
                          <FcMoneyTransfer size={48}/>
                        </div>
                        <h6 className='text-xl mb-1 font-semibold'>
                          Rate Limiting
                        </h6>
                        <p className='mb-4'>
                          Ensure that your server side resources are protected from malicious queries.
                        </p>
                        <button 
                          className='m-2 p-2 rounded-md bg-sky-900 shadow-lg shadow-sky-500/50 hover:shadow-sky-500/40 hover:bg-sky-600 text-white'
                          // asigning the button to toggle the GIF index at input number
                          onClick={() => toggleGifVisibility(2)}
                        >Let's see feature 2 in action</button>
                      </div>
                    </div>
                    {/* end of second feature  */}

                  </div>

                  {/* start of far right column for 'pages' & 'Documentation' */}
                  <div className='w-full md:w-6/12 px-4'>
                    <div className='relative flex flex-col min-w-0 mt-4'>
                      <div className='px-4 py-5 flex-auto'>
                        <div className='p-3 text-center inline-flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-full bg-white'>
                          <FcPaid size={48}/>
                        </div>
                        <h6 className='text-xl mb-1 font-semibold'>Monitoring</h6>
                        <p className='mb-4'>
                          Instant updates when testing your graph QL queries.
                        </p>
                        <button 
                          className='m-2 p-2 rounded-md bg-sky-900 shadow-lg shadow-sky-500/50 hover:shadow-sky-500/40 hover:bg-sky-600 text-white'
                          // asigning the button to toggle the GIF index at input number
                          onClick={() => toggleGifVisibility(3)}
                        >Let's see feature 3 in action</button>
                      </div>
                    </div>
                    
                    {/* start of fourth feature */}
                    <div className='relative flex flex-col min-w-0'>
                      <div className='px-4 py-5 flex-auto'>
                        <div className='p-3 text-center inline-flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-full bg-white'>
                          <FcBullish size={48}/>
                        </div>
                        <h6 className='text-xl mb-1 font-semibold'>Documentation</h6>
                        <p className='mb-4'>
                          Built by developers for developers. You will love how easy
                          it is to work with Gleiph QL!
                        </p>
                        <button 
                          className='m-2 p-2 rounded-md bg-sky-900 shadow-lg shadow-sky-500/50 hover:shadow-sky-500/40 hover:bg-sky-600 text-white'
                          // asigning the button to toggle the GIF index at input number
                          onClick={() => toggleGifVisibility(4)}
                        >Let's see feature 4 in action</button>
                      </div>
                    </div>
                    {/* end of fourth feature */}

                  </div>
                </div>
              </div>
              {/* end of features icons content */}

            </div>
          </div>
        </section>

      </div>
    </>
  )
}

export default FeaturesSection;