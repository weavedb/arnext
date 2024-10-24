import { ArNext } from "arnext"
import { ChakraProvider } from "@chakra-ui/react"
export default function App({ Component, pageProps }) {
  return (
    <ArNext>
      <ChakraProvider>
        <Component {...pageProps} />
      </ChakraProvider>
    </ArNext>
  )
}
