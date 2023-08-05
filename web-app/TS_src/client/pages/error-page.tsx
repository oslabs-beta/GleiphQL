import { ReactElement } from 'react';

export default function ErrorPage() : ReactElement {
  return (
    <main className='flex flex-col place-items-center'>
      <h1 className='text-8xl text-blue-950 m-24'>Oops!</h1>
      <p className='m-2'>Sorry, we're experiencing an unexpected error.</p>
    </main>
  )
}