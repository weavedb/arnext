import { Link, useParams } from "arnext"
import { useEffect, useState } from "react"

export async function getStaticPaths() {
  return { paths: [], fallback: "blocking" }
}

const getID = async (id, pid) => `post-${pid ?? id}`

export async function getStaticProps({ params: { id } }) {
  return { props: { pid: await getID(id) } }
}

export default function Home({ _id = null }) {
  const { id } = useParams()
  const [pid, setPid] = useState(_id)

  useEffect(() => {
    ;(async () => _id ?? setPid(await getID(id, _id)))()
  }, [])

  return (
    <>
      <div>postt : {pid}</div>
      <div>
        <Link href="/">back</Link>
      </div>
    </>
  )
}
