import { ArNext } from "arnext"
import { ChakraProvider } from "@chakra-ui/react"

export default function App(props) {
  return (
    <ChakraProvider>
      <ArNext {...props} />
    </ChakraProvider>
  )
}
