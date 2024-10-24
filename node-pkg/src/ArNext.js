import React, { useEffect, useState } from "react"
import isArweave from "./isArweave"

export default function ArNext({ children }) {
  const [RouterComponent, setRouterComponent] = useState(null)
  const [ArweaveRoutes, setArweaveRoutes] = useState(null)
  useEffect(() => {
    if (isArweave) {
      import("react-router-dom").then(module => {
        setRouterComponent(() => module.BrowserRouter)
      })
      import("./ArweaveRoutes").then(module => {
        setArweaveRoutes(() => module.default)
      })
    }
  }, [isArweave])

  if (RouterComponent && ArweaveRoutes) {
    const getBasename = () => {
      const { pathname } = window.location
      const pathSegments = pathname.split("/").filter(segment => segment !== "")
      return pathSegments.length > 0 ? `/${pathSegments[0]}` : "/"
    }
    let basename = getBasename()
    if (!/^\/[A-Za-z0-9_-]{43}$/.test(basename)) basename = "/"
    let routes = []
    try {
      routes = JSON.parse(process.env.NEXT_PUBLIC_ROUTES)
    } catch (e) {}

    return (
      <RouterComponent basename={basename}>
        <ArweaveRoutes routes={routes} />
      </RouterComponent>
    )
  }
  return isArweave ? null : children
}
