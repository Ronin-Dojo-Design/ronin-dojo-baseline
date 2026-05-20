import { mergeProps } from "@base-ui/react"
import { cloneElement, isValidElement, type ReactElement, type ReactNode } from "react"

export function slot(element: ReactNode, props: Record<string, any>): ReactNode {
  if (!isValidElement(element)) return element
  const el = element as ReactElement<any>
  return cloneElement(el, mergeProps(props, el.props))
}
