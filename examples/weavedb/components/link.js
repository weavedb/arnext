import Link1 from "next/link"
import { Link as Link2 } from "react-router-dom"

export default function Link(props) {
  const isArweave = process.env.NEXT_PUBLIC_DEPLOY_TARGET === "arweave"
  if (isArweave) props.to = props.href
  return isArweave ? <Link2 {...props} /> : <Link1 {...props} />
}
