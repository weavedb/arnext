import Head from "next/head"
import { Image, Input, Textarea, Flex, Box, Spinner } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import dayjs from "dayjs"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { CloseIcon } from "@chakra-ui/icons"
import { AO } from "aonote"
import WeaveDB from "weavedb-client"
import Node from "weavedb-node-client"

const pid =
  process.env.NEXT_PUBLIC_PID || "8ILQE2ZWywJXQBJLwJw5KJgj_c6cFL7UPeJb7Lnfcw0"
const rpc_node = process.env.NEXT_PUBLIC_RPC_NODE
const rpc = process.env.NEXT_PUBLIC_RPC
import { concat } from "ramda"
import { isArweave, Link } from "@/arnext"

async function _getStaticProps({}) {
  const db = new Node({ contractTxId: pid, rpc: rpc_node })
  const _posts = await db.cget("posts", ["date", "desc"], 10)
  return { props: { _posts: _posts ?? [] }, revalidate: 3 }
}

export const getStaticProps = isArweave ? null : _getStaticProps

export default function Home({ _posts = [] }) {
  const [addr, setAddr] = useState(null)
  const [text, setText] = useState("")
  const [title, setTitle] = useState("")
  const [posts, setPosts] = useState(_posts)
  const [more, setMore] = useState(_posts.length >= 10)
  const [image, setImage] = useState("")
  const imageOk = image === "" || /^[A-Za-z0-9_-]{43}$/.test(image)
  const [post, setPost] = useState(false)
  const [posting, setPosting] = useState(false)
  const [loading, setLoading] = useState(false)
  const [init, setInit] = useState(_posts.length !== 0)
  useEffect(() => {
    ;(async () => {
      if (!init) {
        if (posts.length === 0) {
          const db = new WeaveDB({ contractTxId: pid, rpc })
          const out = await db.cget("posts", ["date", "desc"], 10)
          setPosts(out)
          setInit(true)
          if (out.length <= 10) {
            setMore(true)
          }
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
  const meta = {
    title: "ArNext + WeaveDB on AO Demo",
    description: "NextJS on Vercel & Arweave",
    image: "n-bveg-XihRf3khKbUIEfBLp7yOZrVs6g1D3_vUdMjQ",
  }
  return (
    <>
      <Head>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${meta.title}`} />
        <meta name="twitter:description" content={meta.description} />
        <meta
          name="twitter:image"
          content={`https://arweave.net/${meta.image}`}
        />
        <meta property="og:title" content={`${meta.title}`} />
        <meta name="og:description" content={meta.description} />
        <meta name="og:image" content={`https://arweave.net/${meta.image}`} />
        <link rel="icon" href="./favicon.ico" />
      </Head>
      <Header {...{ addr, setAddr, setPost }} />
      {!post ? null : (
        <Flex
          p={4}
          bg="rgba(0,0,0,.5)"
          sx={{
            zIndex: 100,
            position: "absolute",
            top: 0,
            left: 0,
            w: "100%",
          }}
          h="100%"
          align="center"
          justify="center"
        >
          <Box
            maxW="750px"
            p={4}
            bg="white"
            w="100%"
            sx={{ borderRadius: "5px" }}
          >
            <Box px="15px">
              <Flex fontSize="12px" mb={1} justify="flex-end" mt={2}>
                <CloseIcon
                  onClick={() => {
                    setPost(false)
                    setAddr(null)
                  }}
                  sx={{ cursor: "pointer", ":hover": { opacity: 0.75 } }}
                />
              </Flex>
              <Flex fontSize="12px" mb={1}>
                Title
              </Flex>
              <Flex>
                <Input
                  placeholder="title..."
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </Flex>
              <Flex fontSize="12px" mb={1} mt={4}>
                Image
              </Flex>
              <Flex>
                <Input
                  color={imageOk ? "" : "crimson"}
                  placeholder="image arweave txid..."
                  value={image}
                  onChange={e => setImage(e.target.value)}
                />
              </Flex>
              <Flex fontSize="12px" mb={1} mt={4}>
                Description
              </Flex>
              <Flex>
                <Textarea
                  placeholder="description..."
                  p={4}
                  value={text}
                  w="100%"
                  rows="2"
                  onChange={e => setText(e.target.value)}
                />
              </Flex>
              <Flex justify="flex-end" align="center" mt={4}>
                <Flex
                  align="center"
                  mr={4}
                  fontSize="14px"
                  fontWeight="bold"
                  color={text.length > 280 ? "crimson" : ""}
                >
                  {text.length}
                </Flex>
                <Flex
                  bg={!ok ? "#ccc" : "#C4653C"}
                  color="white"
                  px={8}
                  w="100px"
                  justify="center"
                  h="30px"
                  align="center"
                  sx={{
                    borderRadius: "3px",
                    cursor: !ok ? "default" : "pointer",
                    ":hover": { opacity: 0.75 },
                  }}
                  onClick={async () => {
                    if (posting) return
                    setPosting(true)
                    try {
                      if (!addr) {
                        setPosting(false)
                        return alert("Connect Arweave wallet!")
                      }
                      if (!imageOk) {
                        setPosting(false)
                        return alert("Enter a valid Arewave txid for image!")
                      }
                      if (/^\s*$/.test(text)) {
                        setPosting(false)
                        return alert("Enter description!")
                      }
                      if (text.length > 280) {
                        setPosting(false)
                        return alert("Text should be 280 letters or less!")
                      }
                      if (/^\s*$/.test(title)) {
                        setPosting(false)
                        return alert("Enter title!")
                      }
                      if (title.length > 100) {
                        setPosting(false)
                        return alert("Title should be 100 letters or less!")
                      }
                      const date = Date.now()
                      let _post = { title, description: text }
                      if (image != "") _post.image = image
                      const db = new WeaveDB({ contractTxId: pid, rpc })
                      const res = await db.query("add:post", _post, "posts", {
                        ar2: arweaveWallet,
                      })
                      if (!res.success) {
                        setPosting(false)
                        return alert("something went wrong!")
                      }
                      _post = res.doc
                      posts.unshift({ data: _post })
                      setText("")
                      setTitle("")
                      setImage("")
                      setPosts(posts)
                      setPost(false)
                      setAddr(null)
                    } catch (e) {
                      console.log(e)
                    }
                    setPosting(false)
                  }}
                >
                  {posting ? <Spinner /> : "Post"}
                </Flex>
              </Flex>
            </Box>
          </Box>
        </Flex>
      )}
      <Box pt="60px" color="#212315">
        <Flex height="100%" justify="center" w="100%">
          <Box maxW="750px" w="100%">
            {!init ? (
              <Flex
                justify="center"
                align="center"
                h="calc(100vh - 200px)"
                fontSize="20px"
                color="#C4653C"
              >
                <Spinner />
              </Flex>
            ) : (
              <>
                {posts.map(_v => {
                  const v = _v.data
                  return (
                    <Link href={`/post/${v.id}`} key={v.id}>
                      <Box
                        mx="15px"
                        my="20px"
                        p={4}
                        sx={{
                          borderRadius: "5px",
                          border: "1px solid rgb(226, 232, 240)",
                          ":hover": { opacity: 0.75 },
                        }}
                      >
                        <Flex>
                          <Flex direction="column" flex={1}>
                            <Box
                              fontWeight="bold"
                              fontSize="20px"
                              color="#C4653C"
                            >
                              {v.title}
                            </Box>
                            <Box flex={1} mt={2}>
                              {v.description}
                            </Box>
                            <Flex fontSize="12px" mt={2} color="#666">
                              <Box>{v.addr.slice(0, 10)}</Box>
                              <Box flex={1} />
                              <Box ml={12}>
                                {dayjs(v.date).format("MM/DD HH:mm:ss")}
                              </Box>
                            </Flex>
                          </Flex>
                          {!v.image && v.image !== "" ? null : (
                            <Box
                              ml={4}
                              sx={{
                                backgroundImage: `url(https://arweave.net/${v.image})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                              }}
                              h="136px"
                              w="200px"
                            />
                          )}
                        </Flex>
                      </Box>
                    </Link>
                  )
                })}
                {!more ? null : (
                  <Box px={4} pb={4}>
                    <Flex
                      w="100%"
                      bg="#C4653C"
                      p={1}
                      align="center"
                      justify="center"
                      color="white"
                      sx={{
                        borderRadius: "3px",
                        cursor: "pointer",
                        ":hover": { opacity: 0.75 },
                      }}
                      onClick={async () => {
                        if (loading) return
                        setLoading(true)
                        try {
                          const start = posts[posts.length - 1]
                          const db = new WeaveDB({ contractTxId: pid, rpc })
                          const out = await db.cget(
                            "posts",
                            ["date", "desc"],
                            ["startAfter", start],
                          )
                          setPosts(concat(posts, out))
                          if (out.length < 10) setMore(false)
                        } catch (e) {}
                        setLoading(false)
                      }}
                    >
                      {loading ? <Spinner /> : "Load More"}
                    </Flex>
                  </Box>
                )}
              </>
            )}
            <Footer />
          </Box>
        </Flex>
      </Box>
    </>
  )
}
