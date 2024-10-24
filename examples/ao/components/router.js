import { useRouter as _useRouter } from "next/router"
import { useNavigate as _useNavigate } from "react-router-dom"
import { isArweave } from "@/arnext"

class Router {
  constructor() {
    this.router = isArweave ? _useNavigate() : _useRouter()
  }
  push(...params) {
    if (isArweave) {
      this.router(...params)
    } else {
      this.router.push(...params)
    }
  }
}

export const useRouter = () => new Router()
