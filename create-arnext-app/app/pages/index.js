import { Link, ssr } from "arnext"
import { useEffect, useState } from "react"

const getDate = async date => date ?? Date.now()

export const getStaticProps = ssr(async ({}) => {
  return { props: { _date: Date.now() }, revalidate: 100 }
})

export default function Home({ _date = null }) {
  const [date, setDate] = useState(_date)
  useEffect(() => {
    ;(async () => _date ?? setDate(await getDate()))()
  }, [])

  return (
    <>
      home: {date} | <Link href="/post/a">post-a</Link> |{" "}
      <Link href="/abc">404</Link>
    </>
  )
}
