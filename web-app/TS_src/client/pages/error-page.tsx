import { useRouteError } from "react-router-dom";

interface ErrorType {
  statusText?: string;
  message?: string;
}

export default function ErrorPage() {
  const error = useRouteError() as ErrorType;
  console.error(error);

  return (
    <div className='flex flex-col place-items-center'>
      <h1 className='text-8xl text-blue-950 m-24'>Oops!</h1>
      <p className='m-2'>Sorry, we're experiencing an unexpected error.</p>
    </div>
  )
}