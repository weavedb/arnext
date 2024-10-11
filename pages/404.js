import Head from "next/head"
import Link from "@/components/link"
import { Image, Input, Textarea, Flex, Box, Spinner } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import dayjs from "dayjs"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { CloseIcon } from "@chakra-ui/icons"
const defaultImage = "EUDSYKInG5Px-SdwHXEjJp_Qjc_Qprk9mJl5dSeq7io"
import { AO } from "aonote"
const pid =
  process.env.NEXT_PUBLIC_PID || "8ILQE2ZWywJXQBJLwJw5KJgj_c6cFL7UPeJb7Lnfcw0"
import { concat } from "ramda"
const isArweave = process.env.NEXT_PUBLIC_DEPLOY_TARGET === "arweave"

async function _getStaticProps({}) {
  const ao = new AO()
  const { out: _posts } = await ao.dry({
    pid,
    act: "List",
    tags: { Limit: "10" },
    get: { data: true, json: true },
  })
  return { props: { _posts: _posts ?? [] }, revalidate: 100 }
}

export const getStaticProps = isArweave ? null : _getStaticProps

export default function Home({ _posts = [] }) {
  const [addr, setAddr] = useState(null)
  const [text, setText] = useState("")
  const [title, setTitle] = useState("")
  const [more, setMore] = useState(false)
  const [posts, setPosts] = useState([])
  const [image, setImage] = useState(defaultImage)
  const imageOk = image === "" || /^[A-Za-z0-9_-]{43}$/.test(image)
  const [post, setPost] = useState(false)
  const [posting, setPosting] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    ;(async () => {
      if (_posts.length <= 0) {
        const ao = new AO()
        const { out } = await ao.dry({
          pid,
          act: "List",
          tags: { Limit: "10" },
          get: { data: true, json: true },
        })
        setPosts(out)
        if (out.length <= 10) {
          setMore(true)
        }
      } else {
        setPosts(_posts)
        if (_posts.length <= 10) {
          setMore(true)
        }
      }
    })()
  }, [_posts])

  const ok =
    !posting &&
    title.length <= 100 &&
    text.length <= 280 &&
    !/^\s*$/.test(text) &&
    !/^\s*$/.test(title) &&
    imageOk &&
    addr

  return (
    <>
      <Head>
        <title>ArNext Preview</title>
        <meta name="description" content="NextJS on Vercel & Arweave" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="./favicon.ico" />
      </Head>
      <Header {...{ addr, setAddr, setPost }} />
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
