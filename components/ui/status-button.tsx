import * as React from "react"
import { Loader2, Check, X } from "lucide-react"
import { Button, ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ButtonState } from "@/hooks/use-button-state"

interface StatusButtonProps extends Omit<ButtonProps, 'onClick'> {
  state: ButtonState
  onClick?: () => Promise<void> | void
  successText?: string
  errorText?: string
  loadingText?: string
}

const StatusButton = React.forwardRef<HTMLButtonElement, StatusButtonProps>(
  ({
    className,
    children,
    state,
    onClick,
    successText,
    errorText,
    loadingText,
    disabled,
    ...props
  }, ref) => {
    const getButtonContent = () => {
      switch (state) {
        case 'loading':
          return (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {loadingText || children}
            </>
          )
        case 'success':
          return (
            <>
              <Check className="mr-2 h-4 w-4" />
              {successText || children}
            </>
          )
        case 'error':
          return (
            <>
              <X className="mr-2 h-4 w-4" />
              {errorText || children}
            </>
          )
        default:
          return children
      }
    }

    const getButtonVariant = () => {
      switch (state) {
        case 'success':
          return 'default'
        case 'error':
          return 'destructive'
        default:
          return props.variant || 'default'
      }
    }

    const getButtonClassName = () => {
      const baseClasses = cn(className)
      switch (state) {
        case 'success':
          return cn(baseClasses, 'bg-green-600 hover:bg-green-700 border-green-600')
        case 'error':
          return cn(baseClasses, 'bg-red-600 hover:bg-red-700 border-red-600')
        default:
          return baseClasses
      }
    }

    return (
      <Button
        className={getButtonClassName()}
        variant={getButtonVariant()}
        disabled={disabled || state === 'loading'}
        onClick={onClick}
        ref={ref}
        {...props}
      >
        {getButtonContent()}
      </Button>
    )
  }
)

StatusButton.displayName = "StatusButton"

export { StatusButton }
