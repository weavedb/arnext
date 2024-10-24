import { Routes, Route } from "react-router-dom"
import dynamic from "next/dynamic"
import React, { useState, useEffect } from "react"

const ArweaveRoutes = ({ routes = [] }) => {
  const [_routes, setRoutes] = useState([])
  useEffect(() => {
    let _routes = routes
    for (let v of routes) {
      v.component = dynamic(() => import(`../../../../pages/${v.page}`))
    }
    setRoutes(() => routes)
    return
  }, [])
  return (
    <Routes>
      {_routes.map(v => {
        const Component = v.component
        return <Route path={v.path} element={<Component />} />
      })}
    </Routes>
  )
}

export default ArweaveRoutes
