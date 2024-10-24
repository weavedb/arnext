import _Link from "@/components/link"
import { useParams as _useParams } from "@/components/params"
import { useRouter as _useRouter } from "@/components/router"

export const isArweave = process.env.NEXT_PUBLIC_DEPLOY_TARGET === "arweave"
export const Link = _Link
export const useParams = _useParams
export const useRouter = _useRouter
