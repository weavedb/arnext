import isArweave from "./isArweave"

export default fn => (isArweave ? null : fn)
