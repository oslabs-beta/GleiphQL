import { useRouteError } from "react-router-dom";

interface ErrorType {
  statusText?: string;
  message?: string;
}

export default function ErrorPage() {
  const error = useRouteError() as ErrorType;
  console.error(error);

  return (
    <div id='error-page'>
      <h1>Opps!</h1>
      <p>Sorry, we're experiencing an unexpected error.</p>
      <p>
        <i>{`This is current status: ${error.statusText}` || `This is current message: ${error.message}`}</i>
      </p>
    </div>
  )
}