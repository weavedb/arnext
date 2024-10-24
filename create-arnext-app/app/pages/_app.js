import { ArNext } from "arnext"

export default function App({ Component, pageProps }) {
  return (
    <ArNext>
      <Component {...pageProps} />
    </ArNext>
  )
}
