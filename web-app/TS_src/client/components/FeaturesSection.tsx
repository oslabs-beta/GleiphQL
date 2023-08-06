import { ReactElement, FC, useState } from 'react';
import loginGif from '../public/images/loginGif.gif';
import teamModalsGif from '../public/images/teamModalsGif.gif';
import dashboardGif from '../public/images/dashboardGif.gif';
import testingGif from '../public/images/mrBean-Testing.gif';
import gleiphGif from '../public/images/gleiphQLGif.gif';
import { FcLandscape, FcMoneyTransfer, FcPaid, FcBullish } from 'react-icons/fc';
import { Element } from 'react-scroll';

interface Feature {
  gifUrl: string;
  isVisible: boolean;
}

const FeaturesSection: FC = () : ReactElement => {
  // declare an array for all the gifs to display in this component:
  const featuresData : Feature[] = [
    // the first element in the array is the default gif that will render
    { gifUrl: gleiphGif, isVisible: true },
    // the subsequent elements represent the GIFs for each feature
    { gifUrl: loginGif, isVisible: false },
    { gifUrl: teamModalsGif, isVisible: false },
    { gifUrl: dashboardGif, isVisible: false },
    { gifUrl: testingGif, isVisible: false }
  ];


  const [features, setFeatures] = useState<Feature[]>(featuresData);
  
  // function to toggle the visibility of a features's GIF:
  const toggleGifVisibility = (index: number) : void => {
    setFeatures((prevFeatures: Feature[]) : Feature[] => {
      const updatedFeatures: Feature[] = [...prevFeatures];

      // hide the default GIF 
      if (index !== 0) {
        updatedFeatures[0].isVisible = false;
      }

      updatedFeatures.forEach((feature: Feature, i: number) => {
        // set the current feature's visibility based on the provided index
        feature.isVisible = i === index;
      });
      return updatedFeatures;
    });
  };


  return (
    <>
      <Element name='features'>
        <section id='features'>
          <div className='featuresSection-bg min-h-screen flex flex-col justify-center items-center px-5 py-10'>
            <h2
              data-cy='features-title'
              className='text-5xl font-extrabold'
              >
                Features
            </h2>
          <div>

            <div className='container mx-auto'>
              <div className='flex flex-wrap items-center'>

                  {/* Start of the image container */}
                  <section className='w-10/12 md:w-6/12 lg:w-12/12 px-12 md:px-4 mr-auto ml-auto'>
                    <div className='flex min-w-0 bg-white-200 w-full mb-6 shadow-lg rounded-lg'>
                      {/* Use conditional rendering to show the proper GIF*/}
                      {features[0].isVisible ? (
                        <img
                          data-cy='gif-display'
                          alt='...' 
                          src={features[0].gifUrl} 
                          className='w-full h-auto align-middle rounded-lg' />
                      ) : (
                        <>
                          {features.slice(1).map((feature, index) => {
                            // use the map function to iterate over all features (including the default value)
                            if (feature.isVisible) {
                              // checkif the current feature is not the default one (index 0) and its isVisible property is true
                              // if both conditions are true, render the GIF for this feature
                              return (
                                <img
                                  data-cy='gif-display'
                                  key={index} 
                                  alt='...' 
                                  src={feature.gifUrl} className='w-full h-auto align-middle rounded-lg' />
                              );
                            }
                            // if no conditions are met
                            return null;
                          })}
                        </>
                      )}
                    </div>
                  </section>

                  {/* start of features content */}
                  <section className='w-full md:w-6/12 px-4'>
                    <ul className='flex flex-wrap'>

                      {/* start of left features column */}
                      <div className='w-full md:w-6/12'>

                        {/* start of first feature's section */}
                        <li className='h-1/2 flex flex-col mt-4'>
                          <div className='px-4 py-5 flex-auto'>
                            <div className='p-3 text-center inline-flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-full bg-white'>
                              <FcLandscape size={48}/>
                            </div>
                            <h3
                              data-cy='feat-1-title'
                              className='text-xl mb-1 font-semibold'
                              >
                                Complexity Analysis
                            </h3>
                            <p
                              data-cy='feat-1-body'
                              className='mb-4'>
                            Dynamically calculate the resource requirements of each query, providing you with invaluable insights into its impact on your system.
                            </p>
                            <button
                              data-cy='feat-1-btn'
                              className='m-2 p-2 rounded-md bg-sky-900 shadow-lg shadow-sky-500/50 hover:shadow-sky-500/40 hover:bg-sky-600 text-white'
                              // asigning the button to toggle the GIF index at input number
                              onClick={() : void => toggleGifVisibility(1)}
                            >Let's see feature 1 in action</button>
                          </div>
                        </li>

                        {/* start of second feature 'Javascript components' */}
                        <li className='h-1/2 flex flex-col min-w-0'>
                          <div className='px-4 py-5 flex-auto'>
                            <div className='p-3 text-center inline-flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-full bg-white'>
                              <FcMoneyTransfer size={48}/>
                            </div>
                            <h3
                              data-cy='feat-2-title'
                              className='text-xl mb-1 font-semibold'>
                              Rate Limiting
                            </h3>
                            <p
                              data-cy='feat-2-body'
                              className='mb-4'>
                              Control and regulate incoming requests, ensuring fair and efficient resource allocation while safeguarding against abusive usage patterns.
                            </p>
                            <button
                              data-cy='feat-2-btn'
                              className='m-2 p-2 rounded-md bg-sky-900 shadow-lg shadow-sky-500/50 hover:shadow-sky-500/40 hover:bg-sky-600 text-white'
                              // asigning the button to toggle the GIF index at input number
                              onClick={() => toggleGifVisibility(2)}
                            >Let's see feature 2 in action</button>
                          </div>
                        </li>
                        {/* end of second feature  */}

                      </div>

                      {/* start of far right column for 'pages' & 'Documentation' */}
                      <div className='w-full md:w-6/12'>
                        <li className='h-1/2 flex flex-col min-w-0 mt-4'>
                          <div className='px-4 py-5 flex-auto'>
                            <div className='p-3 text-center inline-flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-full bg-white'>
                              <FcPaid size={48}/>
                            </div>
                            <h3
                              data-cy='feat-3-title'
                              className='text-xl mb-1 font-semibold'>
                                Monitoring
                            </h3>
                            <p
                              data-cy='feat-3-body'
                              className='mb-4'>
                              Gain deep visibility into your API's usage patterns, track response times, monitor error rates, and optimize your system's performance.
                            </p>
                            <button
                              data-cy='feat-3-btn'
                              className='m-2 p-2 rounded-md bg-sky-900 shadow-lg shadow-sky-500/50 hover:shadow-sky-500/40 hover:bg-sky-600 text-white'
                              // asigning the button to toggle the GIF index at input number
                              onClick={() : void => toggleGifVisibility(3)}
                            >Let's see feature 3 in action</button>
                          </div>
                        </li>
                        
                        {/* start of fourth feature */}
                        <li className='h-1/2 flex flex-col min-w-0'>
                          <div className='px-4 py-5 flex-auto'>
                            <div className='p-3 text-center inline-flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-full bg-white'>
                              <FcBullish size={48}/>
                            </div>
                            <h3
                              data-cy='feat-4-title'
                              className='text-xl mb-1 font-semibold'>
                                Documentation
                            </h3>
                            <p
                              data-cy='feat-4-body'
                              className='mb-4'>
                              Built by developers for developers. Our comprehensive documentation makes it easy
                              to work with GleiphQL!
                            </p>
                            <button
                              data-cy='feat-4-btn'
                              className='m-2 p-2 rounded-md bg-sky-900 shadow-lg shadow-sky-500/50 hover:shadow-sky-500/40 hover:bg-sky-600 text-white'
                              // asigning the button to toggle the GIF index at input number
                              onClick={() : void => toggleGifVisibility(4)}
                            >Let's see feature 4 in action</button>
                          </div>
                        </li>
                        {/* end of fourth feature */}

                      </div>
                    </ul>
                  </section>
                  {/* end of features icons content */}

                </div>
              </div>
            </div>

          </div>
        </section>
      </Element>
    </>
  )
}

export default FeaturesSection;