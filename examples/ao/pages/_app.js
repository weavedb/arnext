import { useEffect, useState } from "react"
import { ChakraProvider } from "@chakra-ui/react"
import { isArweave } from "@/arnext"
export default function App({ Component, pageProps }) {
  const [RouterComponent, setRouterComponent] = useState(null)
  const [ArweaveRoutes, setArweaveRoutes] = useState(null)
  useEffect(() => {
    if (isArweave) {
      import("react-router-dom").then(module => {
        setRouterComponent(() => module.BrowserRouter)
      })
      import("../components/ArweaveRoutes").then(module => {
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
    return (
      <ChakraProvider>
        <RouterComponent basename={basename}>
          <ArweaveRoutes />
        </RouterComponent>
      </ChakraProvider>
    )
  }
  return isArweave ? null : (
    <ChakraProvider>
      <Component {...pageProps} />
    </ChakraProvider>
  )
}
