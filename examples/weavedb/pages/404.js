import Head from "next/head"
import { Link } from "arnext"
import { Flex, Box } from "@chakra-ui/react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"

export default function Home({}) {
  return (
    <>
      <Head>
        <title>404 | ArNext Preview</title>
        <meta name="description" content="NextJS on Vercel & Arweave" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="./favicon.ico" />
      </Head>
      <Header />
      <Box pt="60px" color="#212315">
        <Flex height="100%" justify="center" w="100%">
          <Box maxW="750px" w="100%">
            <Flex
              justify="center"
              align="center"
              h="calc(100vh - 200px)"
              fontSize="20px"
              color="#C4653C"
            >
              404 | The Page is Not Found
            </Flex>
            <Footer />
          </Box>
        </Flex>
      </Box>
    </>
  )
}
