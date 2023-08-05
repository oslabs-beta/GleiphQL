import { FC, ReactElement, FormEvent, useEffect, useState, useRef } from 'react';
import useStore from '../store';
import ConfirmationModal from './ConfirmationModal';
import axios from 'axios';
import {
  Sidenav,
  Ripple,
  initTE,
} from 'tw-elements';

import { Endpoint, SetEndpointRequests, SetNumAndStrFx, UserInfo } from '../../types';

interface PartialStore {
  setCurrEndpoint: SetNumAndStrFx;
  currEndpoint: Endpoint;
  currUser: UserInfo;
  setEndpointRequests: SetEndpointRequests;
}

// retrieve all saved endpoints for user
const queryEndPoints = async (userId: number): Promise<Endpoint[]> => {
  const response: Endpoint[] = (await axios.get(`/api/endpoint/${userId}`)).data;
  return response;
}

const Sidebar: FC = () : ReactElement => {
  const [ endpointArray, setEndpointArray ] = useState<Endpoint[]>([]);
  const { 
    setCurrEndpoint, 
    currEndpoint,
    currUser,  
    setEndpointRequests,
  }: PartialStore = useStore();

  const [open, setOpen] = useState<boolean>(false);
  const [addedDescription, setAddedDescription] = useState<string>('');
  const [addedURL, setAddedURL] = useState<string>('');
  const [menuCollapsed, setMenuCollapsed] = useState<boolean>(false);


  const cancelButtonRef = useRef(null);

  // set selected endpoint to current endpoint to view data
  const toggleEndPoint = (id: number, url: string) : void => {
    setCurrEndpoint(id, url);
    setEndpointRequests([]);
  }

  // adding information about a new endpoint
  const handleEndpointChange = (input: FormEvent<HTMLInputElement>) : void => {
    const targetId: string = input.currentTarget.id;
    const targetVal: string = input.currentTarget.value;
    if (targetId === 'added-description') {
      setAddedDescription(targetVal);
    }
    else if(targetId === 'added-url') {
      setAddedURL(targetVal);
    }
  }

  // saving the new endpoint
  const saveEndpoint = async () : Promise<void> => {
    const queryArr: Endpoint[] = (await axios.post(`/api/endpoint/${currUser.userId}`, { url: addedURL, description: addedDescription})).data;
    setEndpointArray(queryArr);
    if(!currEndpoint.endpoint_id) setCurrEndpoint(queryArr[0].endpoint_id, queryArr[0].url);
    setAddedDescription('');
    setAddedURL('');
  }

  // upon initial render, obtain all the endpoints of the user
  useEffect(() : void => {
    initTE({ Sidenav, Ripple });
    const fetchData = async () : Promise<void> => {
      try {
        const queryArr: Endpoint[] = await queryEndPoints(currUser.userId);
        if(queryArr.length) {
          setEndpointArray(queryArr);
          // set current endpoint to the first one found in the response array
          setCurrEndpoint(queryArr[0].endpoint_id, queryArr[0].url);
        }
      } catch(err: unknown) {
        if(err instanceof Error) console.log(err.message);
        else console.log('an error in obtaining the endpoints');
      }
    };
    fetchData();
  }, []);

  return (
      <nav
        id='sidenav-8'
        className={ (menuCollapsed? 'opacity-30 sm:opacity-100' : 'opacity-100') + 'left-0 z-[1035] h-full w-60 -translate-x-full overflow-hidden bg-white shadow-[0_4px_12px_0_rgba(0,0,0,0.07),_0_2px_4px_rgba(0,0,0,0.05)] data-[te-sidenav-hidden="false"]:translate-x-0 dark:bg-zinc-800'}
        data-te-sidenav-init
        data-te-sidenav-hidden='false'
        data-te-sidenav-mode='side'
        data-te-sidenav-content='#content'
      >
        <ul
          className='relative m-0 list-none px-[0.2rem] pb-12 mt-2'
          data-te-sidenav-menu-ref
        >
          <li className='relative pt-2'>
            <a
              className='flex cursor-pointer items-center truncate rounded-[5px] px-5 py-[0.45rem] text-[0.85rem] text-gray-600 outline-none transition duration-300 ease-linear hover:bg-slate-50 hover:text-inherit hover:outline-none focus:bg-slate-50 focus:text-inherit focus:outline-none active:bg-slate-50 active:text-inherit active:outline-none data-[te-sidenav-state-active]:text-inherit data-[te-sidenav-state-focus]:outline-none motion-reduce:transition-none dark:text-gray-300 dark:hover:bg-white/10 dark:focus:bg-white/10 dark:active:bg-white/10'
              data-te-sidenav-link-ref
              href='/'>
              <span
                className='mr-4 [&>svg]:h-5 [&>svg]:w-5 [&>svg]:text-gray-400 dark:[&>svg]:text-gray-300'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  fill='currentColor'
                  className='h-3.5 w-3.5'>
                  <path
                    d='M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z' />
                  <path
                    d='M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z' />
                </svg>
              </span>
              {
                menuCollapsed? 
                  null :
                  <span>Home</span>
              }
            </a>
          </li>
          <li 
            className='relative pt-2'
            onClick={() : void => {
              if (menuCollapsed) {
                setMenuCollapsed(false);
              }
            }}  
          >
            {
              menuCollapsed? 
                null : 
                <span className='px-6 py-4 text-[0.6rem] font-bold uppercase text-gray-600 dark:text-gray-400'>
                  Create
                </span>
            }
            <a
              className='flex cursor-pointer items-center truncate rounded-[5px] px-5 py-[0.45rem] text-[0.875rem] text-gray-600 outline-none transition duration-300 ease-linear hover:bg-slate-50 hover:text-inherit hover:outline-none focus:bg-slate-50 focus:text-inherit focus:outline-none active:bg-slate-50 active:text-inherit active:outline-none data-[te-sidenav-state-active]:text-inherit data-[te-sidenav-state-focus]:outline-none motion-reduce:transition-none dark:text-gray-300 dark:hover:bg-white/10 dark:focus:bg-white/10 dark:active:bg-white/10'
              data-te-sidenav-link-ref>
              <span
                className='mr-4 [&>svg]:h-5 [&>svg]:w-5 [&>svg]:text-gray-400 dark:[&>svg]:text-gray-300'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth='1.5'
                  stroke='currentColor'
                  className='h-5 w-5'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M12 4.5v15m7.5-7.5h-15' />
                </svg>
              </span>
              {
                menuCollapsed?
                  null: 
                  <span>Add Endpoint</span>
              }
              <span
                className='absolute right-0 ml-auto mr-[0.8rem] transition-transform duration-300 ease-linear motion-reduce:transition-none [&>svg]:text-gray-600 dark:[&>svg]:text-gray-300'
                data-te-sidenav-rotate-icon-ref>
              </span>
            </a>
            <ul
              className='!visible relative m-0 hidden list-none p-0 data-[te-collapse-show]:block'
              data-te-sidenav-collapse-ref
              >
              <li className='relative'>
                <input type='text'
                  className='w-full border border-gray-300 flex h-6 items-center truncate rounded-[5px] py-4 pl-3 text-left pr-3 text-[0.78rem] text-gray-600 outline-none transition duration-300 ease-linear hover:bg-slate-50 hover:text-inherit hover:outline-none focus:bg-slate-50 focus:text-inherit focus:outline-none active:bg-slate-50 active:text-inherit active:outline-none data-[te-sidenav-state-active]:text-inherit data-[te-sidenav-state-focus]:outline-none motion-reduce:transition-none dark:text-gray-300 dark:hover:bg-white/10 dark:focus:bg-white/10 dark:active:bg-white/10'
                  data-te-sidenav-link-ref
                  placeholder='Endpoint URL'
                  id='added-url'
                  value={addedURL}
                  onChange={(e: FormEvent<HTMLInputElement>) : void => handleEndpointChange(e)}
                />
              </li>
              <li className='relative'>
                <input type='text'
                  className='mt-1 w-full border border-gray-300 flex h-6 items-center truncate rounded-[5px] py-4 pl-3 text-left pr-3 text-[0.78rem] text-gray-600 outline-none transition duration-300 ease-linear hover:bg-slate-50 hover:text-inherit hover:outline-none focus:bg-slate-50 focus:text-inherit focus:outline-none active:bg-slate-50 active:text-inherit active:outline-none data-[te-sidenav-state-active]:text-inherit data-[te-sidenav-state-focus]:outline-none motion-reduce:transition-none dark:text-gray-300 dark:hover:bg-white/10 dark:focus:bg-white/10 dark:active:bg-white/10'
                  data-te-sidenav-link-ref
                  placeholder='Endpoint Description'
                  id='added-description'
                  value={addedDescription}
                  onChange={(e: FormEvent<HTMLInputElement>) : void => handleEndpointChange(e)}
                />
              </li>
              <li className='relative flex content-center'>
                <button
                  className='mt-2 ml-3 inline-block rounded bg-primary px-2 py-1.5 text-xs uppercase leading-tight text-white shadow-md transition duration-150 ease-in-out hover:bg-primary-700 hover:shadow-lg focus:bg-primary-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-primary-800 active:shadow-lg'
                  aria-haspopup='true'
                  onClick={saveEndpoint}
                >
                  Save
                </button>
              </li>
            </ul>
          </li>
          <li 
            className='relative pt-2'
            onClick={()=>{
              if (menuCollapsed) {
                setMenuCollapsed(false);
              }
            }}  
          >
          {
            menuCollapsed ? (
              null
            ) : (
              <span className='px-6 py-4 text-[0.6rem] font-bold uppercase text-gray-600 dark:text-gray-400'>
                Manage
              </span>
            )
          }
            <a
              className='flex cursor-pointer items-center truncate rounded-[5px] px-5 py-[0.45rem] text-[0.875rem] text-gray-600 outline-none transition duration-300 ease-linear hover:bg-slate-50 hover:text-inherit hover:outline-none focus:bg-slate-50 focus:text-inherit focus:outline-none active:bg-slate-50 active:text-inherit active:outline-none data-[te-sidenav-state-active]:text-inherit data-[te-sidenav-state-focus]:outline-none motion-reduce:transition-none dark:text-gray-300 dark:hover:bg-white/10 dark:focus:bg-white/10 dark:active:bg-white/10'
              data-te-sidenav-link-ref
            >
              <span
                className='mr-4 [&>svg]:h-5 [&>svg]:w-5 [&>svg]:text-gray-400 dark:[&>svg]:text-gray-300'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  fill='currentColor'
                  className='h-3.5 w-3.5'>
                  <path
                    d='M12.378 1.602a.75.75 0 00-.756 0L3 6.632l9 5.25 9-5.25-8.622-5.03zM21.75 7.93l-9 5.25v9l8.628-5.032a.75.75 0 00.372-.648V7.93zM11.25 22.18v-9l-9-5.25v8.57a.75.75 0 00.372.648l8.628 5.033z' />
                </svg>
              </span>
              {
                menuCollapsed ? (
                  null
                ) : (
                  <span className='mr-3'>My Endpoints</span>
                )
              }
              <span
                className='absolute right-0 ml-auto mr-[0.8rem] transition-transform duration-300 ease-linear motion-reduce:transition-none [&>svg]:text-gray-600 dark:[&>svg]:text-gray-300'
                data-te-sidenav-rotate-icon-ref
              >
                {
                  menuCollapsed ? (
                    null
                  ) : (
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      viewBox='0 0 20 20'
                      fill='currentColor'
                      className='h-5 w-5'>
                      <path
                        fillRule='evenodd'
                        d='M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z'
                        clipRule='evenodd' />
                    </svg>
                  )
                }
              </span>
            </a>
            <ul
              className='!visible relative m-0 hidden list-none p-0 data-[te-collapse-show]:block '
              data-te-sidenav-collapse-ref
              data-te-collapse-show
            >
              {
                endpointArray?.map((endpointData: Endpoint, i: number) : ReactElement => {
                  return (
                    <li 
                      className='relative'
                      key={i}
                    >
                      <a
                        className='flex h-6 cursor-pointer items-center truncate rounded-[5px] py-2 pl-[0.7rem] pr-6 text-[0.78rem] text-gray-600 outline-none transition duration-300 ease-linear hover:bg-slate-50 hover:text-inherit hover:outline-none focus:bg-slate-50 focus:text-inherit focus:outline-none active:bg-slate-50 active:text-inherit active:outline-none data-[te-sidenav-state-active]:text-inherit data-[te-sidenav-state-focus]:outline-none motion-reduce:transition-none dark:text-gray-300 dark:hover:bg-white/10 dark:focus:bg-white/10 dark:active:bg-white/10'
                        onClick={() : void => toggleEndPoint(endpointData.endpoint_id, endpointData.url)}
                      >{endpointData.url}</a>
                      {
                        currEndpoint.endpoint_id === endpointData.endpoint_id? 
                          <div 
                            className='mb- mt-1 flex content-center'
                          >
                            <button
                              className='ml-3 inline-block rounded bg-red-700 px-1.5 py-1 text-xs uppercase leading-tight text-white shadow-md transition duration-150 ease-in-out hover:bg-red-800 hover:shadow-lg focus:bg-red-800 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-red-900 active:shadow-lg'
                              aria-haspopup='true'
                              onClick={()=>setOpen(true)}
                              data-modal-target='defaultModal'
                              data-modal-toggle='defaultModal'
                            >
                              Delete
                            </button>
                            <ConfirmationModal open={open} setOpen={setOpen} cancelButtonRef={cancelButtonRef} setEndpointArray={setEndpointArray} />
                          </div> 
                        : null
                      }
                    </li>
                  )
                })
              }
            </ul>
          </li>
          <li 
            className='relative pt-2'

          >
            {
              menuCollapsed? 
                null :
                <span className='px-6 py-4 text-[0.6rem] font-bold uppercase text-gray-600 dark:text-gray-400'>
                  Menu
                </span>
            }
            <a
              className='flex cursor-pointer items-center truncate rounded-[5px] px-5 py-[0.45rem] text-[0.85rem] text-gray-600 outline-none transition duration-300 ease-linear hover:bg-slate-50 hover:text-inherit hover:outline-none focus:bg-slate-50 focus:text-inherit focus:outline-none active:bg-slate-50 active:text-inherit active:outline-none data-[te-sidenav-state-active]:text-inherit data-[te-sidenav-state-focus]:outline-none motion-reduce:transition-none dark:text-gray-300 dark:hover:bg-white/10 dark:focus:bg-white/10 dark:active:bg-white/10'
              data-te-sidenav-link-ref
              onClick={() : void => {
                const instance = Sidenav.getInstance(
                  document.getElementById('sidenav-8')
                );
                instance.toggleSlim();
                setMenuCollapsed(!menuCollapsed);
              }}
            >
              <span
                className='mr-4 [&>svg]:h-5 [&>svg]:w-5 [&>svg]:text-gray-400 dark:[&>svg]:text-gray-300'>
                {
                  menuCollapsed?
                    <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='w-6 h-6'>
                      <path strokeLinecap='round' strokeLinejoin='round' d='M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9' />
                    </svg> : 
                    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor' className='w-6 h-6'>
                      <path fillRule='evenodd' d='M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5V15a.75.75 0 011.5 0v3.75a3 3 0 01-3 3h-6a3 3 0 01-3-3V5.25a3 3 0 013-3h6a3 3 0 013 3V9A.75.75 0 0115 9V5.25a1.5 1.5 0 00-1.5-1.5h-6zm5.03 4.72a.75.75 0 010 1.06l-1.72 1.72h10.94a.75.75 0 010 1.5H10.81l1.72 1.72a.75.75 0 11-1.06 1.06l-3-3a.75.75 0 010-1.06l3-3a.75.75 0 011.06 0z' clipRule='evenodd' />
                    </svg>
                }
              </span>
              {
                menuCollapsed?
                null :
                <span>Collapse</span>
              }
            </a>
          </li>
        </ul>
      </nav>
  )
}

export default Sidebar;