import { useRouter as _useRouter } from "next/router"
import { useParams as _useParams } from "react-router-dom"
const isArweave = process.env.NEXT_PUBLIC_DEPLOY_TARGET === "arweave"
export const useParams = () => (isArweave ? _useParams() : _useRouter().query)
