import { Spinner, Flex, Box } from "@chakra-ui/react"
import { useState } from "react"
import { AO } from "aonote"
import { Link, useRouter } from "@/arnext"
const pid = process.env.NEXT_PUBLIC_PID

export default function Header({ addr, setAddr, setPost, post }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  return (
    <>
      {" "}
      <style global jsx>{`
        html,
        body,
        #__next {
          height: 100%;
        }
      `}</style>
      <Flex
        bg="white"
        justify="center"
        w="100%"
        style={{
          top: 0,
          left: 0,
          position: "fixed",
          height: "60px",
        }}
      >
        <Flex align="center" justify="flex-end" maxW="750px" w="100%">
          <Box fontWeight="bold" fontSize="20px" px="15px">
            <Link style={{ textDecoration: "none", color: "#C4653C" }} href="/">
              ArNext AO Demo
            </Link>
          </Box>
          <Box flex={1} />
          <Box px="15px">
            <Flex
              bg="#C4653C"
              color="white"
              px={4}
              w="150px"
              justify="center"
              h="30px"
              align="center"
              sx={{
                borderRadius: "3px",
                cursor: "pointer",
                ":hover": { opacity: 0.75 },
              }}
              onClick={async () => {
                if (typeof window?.arweaveWallet === "undefined") {
                  return alert("No Arweave Wallet Found")
                }
                if (addr) {
                  setAddr(null)
                } else {
                  setDeleting(true)
                  try {
                    await arweaveWallet.connect([
                      "ACCESS_ADDRESS",
                      "ACCESS_PUBLIC_KEY",
                      "SIGN_TRANSACTION",
                    ])
                    const addr = await arweaveWallet.getActiveAddress()
                    if (!setPost) {
                      if (addr !== post.addr) {
                        alert("You are not the owner of this post!")
                      } else {
                        if (confirm("Would you like to delete the post?")) {
                          const ao = await new AO().init(arweaveWallet)
                          const { err } = await ao.msg({
                            pid,
                            act: "Delete",
                            tags: { ID: post.id },
                            getData: "deleted!",
                          })
                          if (err) return alert("something went wrong!")
                          router.push("/")
                        }
                      }
                    } else {
                      setAddr(addr)
                      setPost(true)
                    }
                  } catch (e) {}
                  setDeleting(false)
                }
              }}
            >
              {deleting ? (
                <Spinner />
              ) : addr ? (
                addr.slice(0, 10)
              ) : setPost ? (
                "Post"
              ) : (
                "Delete"
              )}
            </Flex>
          </Box>
        </Flex>
      </Flex>
    </>
  )
}
