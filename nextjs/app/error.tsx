'use client' // Error components must be Client Components
 
import { useEffect } from 'react'
 
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])
 
  return (
    <div>
      <h2>Something went wrong!</h2>
      <p>
        {error.digest
          ? `An error occurred while rendering this segment.`
          : `An error occurred while loading this segment.`}
      </p>
    <p>
        {error.digest
            ? `The error digest is ${error.digest}.`
            : null}
    </p>
    <p>
        <b>errore:</b> {error.message}
    </p>
    <p>
        [{JSON.stringify(error)}]
    </p>
      <button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Try again
      </button>
    </div>
  )
}