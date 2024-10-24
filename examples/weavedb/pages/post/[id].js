import Head from "next/head"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { useEffect, useState } from "react"
import { Image, Spinner, Flex, Box } from "@chakra-ui/react"
import dayjs from "dayjs"
import WeaveDB from "weavedb-client"
import Node from "weavedb-node-client"
import { Link, useParams } from "arnext"
const pid =
  process.env.NEXT_PUBLIC_PID || "8ILQE2ZWywJXQBJLwJw5KJgj_c6cFL7UPeJb7Lnfcw0"
const rpc_node = process.env.NEXT_PUBLIC_RPC_NODE
const rpc = process.env.NEXT_PUBLIC_RPC

export async function getStaticPaths() {
  return { paths: [], fallback: "blocking" }
}

export async function getStaticProps({ params }) {
  const { id } = params
  const db = new Node({ contractTxId: pid, rpc: rpc_node })
  const _post = await db.get("posts", id)
  const props = { _post }
  return { props, revalidate: 1000 }
}

export default function Home({ _post = null }) {
  const { id } = useParams()
  const [addr, setAddr] = useState(null)
  const [post, setPost] = useState(_post)
  const [init, setInit] = useState(_post !== null)
  useEffect(() => {
    ;(async () => {
      if (!init) {
        const db = new WeaveDB({ contractTxId: pid, rpc })
        const out = await db.get("posts", id)
        setPost(out)
        setInit(true)
      }
    })()
  }, [_post])

  return (
    <>
      {!_post ? null : (
        <Head>
          <title>{_post.title}</title>
          <meta name="description" content={_post.description} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={`${_post.title}`} />
          <meta name="twitter:description" content={_post.description} />
          <meta
            name="twitter:image"
            content={`https://arweave.net/${_post.image}`}
          />
          <meta property="og:title" content={`${_post.title}`} />
          <meta name="og:description" content={_post.description} />
          <meta
            name="og:image"
            content={`https://arweave.net/${_post.image}`}
          />
          <link rel="icon" href="../favicon.ico" />
        </Head>
      )}
      <Header {...{ addr, setAddr, post }} />
      <Box pt="60px">
        {!post ? null : (
          <Flex height="100%" justify="center" w="100%">
            <Box maxW="600px" w="100%" mb={8}>
              {!post.image ? null : (
                <Flex justify="center">
                  <Image
                    my={4}
                    src={`https://arweave.net/${post.image}`}
                    w="100%"
                  />
                </Flex>
              )}
              <Box color="#C4653C" fontSize="24px" fontWeight="bold" mt={4}>
                {post.title}
              </Box>
              <Box mt={4}>{post.description}</Box>
              <Flex fontSize="12px" mt={4} color="#666">
                <Box>{post.addr}</Box>
                <Box flex={1} />
                <Box ml={12}>{dayjs(post.date).format("MM/DD HH:mm:ss")}</Box>
              </Flex>
            </Box>
          </Flex>
        )}
        <Flex height="100%" justify="center" w="100%">
          <Box maxW="750px" w="100%">
            {init ? null : (
              <Flex
                justify="center"
                align="center"
                h="calc(100vh - 200px)"
                fontSize="20px"
                color="#C4653C"
              >
                <Spinner />
              </Flex>
            )}
            <Footer />
          </Box>
        </Flex>
      </Box>
    </>
  )
}
