import React from "react"
import { Link } from "gatsby"

const NotFoundPage: React.FC = () => {
  return (
    <main>
      <h1>Page not found</h1>
      <p>
        Sorry 😔, we couldn't find what you were looking for.
        <br />
        <br />
        <Link to="/">Go home</Link>.
      </p>
    </main>
  )
}

export default NotFoundPage