import { useParams as _useParams1 } from "next/navigation"
import { useParams as _useParams2 } from "react-router-dom"
import isArweave from "./isArweave"
export default () => (isArweave ? _useParams2() : _useParams1()) ?? {}
