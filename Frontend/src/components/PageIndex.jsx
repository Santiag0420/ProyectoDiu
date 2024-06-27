import React from 'react'
import { Link } from 'react-router-dom'
function PageIndex() {
  return (
    <>
    Pagina principal
      <Link to={"/login"}>Login</Link>
    </>
  )
}

export default PageIndex