import { cn } from "@/lib/utils"
import { RiLoaderLine, type RemixiconComponentType } from "@remixicon/react"

type SpinnerProps = React.ComponentProps<RemixiconComponentType>

function Spinner({ className, ...props }: SpinnerProps) {
  return (
    <RiLoaderLine data-slot="spinner" role="status" aria-label="Loading" className={cn("size-4 animate-spin", className)} {...props} />
  )
}

export { Spinner }
