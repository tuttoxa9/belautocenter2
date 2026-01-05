"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"

import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer"

// Define a context to share state between the wrapper and components
interface SelectContextValue {
  isMobile: boolean
  open: boolean
  setOpen: (open: boolean) => void
  value: string
  onValueChange: (value: string) => void
  itemsMap: Map<string, React.ReactNode>
}

const SelectContext = React.createContext<SelectContextValue>({
  isMobile: false,
  open: false,
  setOpen: () => {},
  value: "",
  onValueChange: () => {},
  itemsMap: new Map(),
})

const Select = ({ children, ...props }: SelectPrimitive.SelectProps) => {
  const isMobile = useIsMobile()
  const [open, setOpen] = React.useState(false)

  // Handle controlled/uncontrolled state
  const isControlled = props.value !== undefined
  const [internalValue, setInternalValue] = React.useState(props.defaultValue || "")
  const value = isControlled ? props.value : internalValue

  const onValueChange = (val: string) => {
    if (!isControlled) setInternalValue(val)
    props.onValueChange?.(val)
  }

  // Mobile: Traverse children to find items for label mapping
  // This is needed because Drawer content is separate from Trigger, so SelectValue
  // cannot automatically infer label from selected item like Radix does.
  const itemsMap = React.useMemo(() => {
    if (!isMobile) return new Map<string, React.ReactNode>()

    const map = new Map<string, React.ReactNode>()

    const traverse = (node: React.ReactNode) => {
      React.Children.forEach(node, (child) => {
        if (!React.isValidElement(child)) return

        // We look for children that have a 'value' prop.
        // This covers SelectItem components.
        if (child.props && 'value' in child.props) {
            // Store the children (label) mapped by value
            map.set(child.props.value, child.props.children)
        }

        // Recursively traverse children (e.g. inside SelectGroup or SelectContent)
        if (child.props && child.props.children) {
          traverse(child.props.children)
        }
      })
    }

    traverse(children)
    return map
  }, [children, isMobile])

  if (isMobile) {
    return (
      <SelectContext.Provider value={{
        isMobile: true,
        open: props.open ?? open,
        setOpen: (newOpen) => {
            if (props.onOpenChange) props.onOpenChange(newOpen)
            setOpen(newOpen)
        },
        value: value || "",
        onValueChange,
        itemsMap
      }}>
        <Drawer open={props.open ?? open} onOpenChange={(val) => {
             if (props.onOpenChange) props.onOpenChange(val)
             setOpen(val)
        }}>
          {children}
        </Drawer>
      </SelectContext.Provider>
    )
  }

  return <SelectPrimitive.Root {...props}>{children}</SelectPrimitive.Root>
}

const SelectGroup = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Group>
>(({ className, ...props }, ref) => {
  const context = React.useContext(SelectContext)
  if (context.isMobile) {
      return <div className={cn("", className)} {...props} />
  }
  return <SelectPrimitive.Group ref={ref} className={className} {...props} />
})
SelectGroup.displayName = SelectPrimitive.Group.displayName

const SelectValue = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Value>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Value>
>(({ className, children, placeholder, ...props }, ref) => {
  const context = React.useContext(SelectContext)

  if (context.isMobile) {
     const label = context.value ? context.itemsMap.get(context.value) : null
     return (
       <span className={cn("pointer-events-none block truncate", className)} ref={ref} {...props}>
         {label || children || placeholder || "\u00A0"}
       </span>
     )
  }

  return <SelectPrimitive.Value ref={ref} className={className} placeholder={placeholder} {...props}>{children}</SelectPrimitive.Value>
})
SelectValue.displayName = SelectPrimitive.Value.displayName

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => {
  const context = React.useContext(SelectContext)

  if (context.isMobile) {
    return (
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 font-normal",
            className
          )}
          ref={ref as any}
          {...props}
        >
          {children}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DrawerTrigger>
    )
  }

  return (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
})
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => {
  const context = React.useContext(SelectContext)

  if (context.isMobile) {
    return (
      <DrawerContent>
        <div className={cn("mt-4 border-t", className)}>
            <div className="p-4 flex flex-col gap-2 max-h-[50vh] overflow-y-auto">
                {children}
            </div>
        </div>
      </DrawerContent>
    )
  }

  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        className={cn(
          "relative z-50 max-h-[--radix-select-content-available-height] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-select-content-transform-origin]",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
})
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => {
  const context = React.useContext(SelectContext)

  if (context.isMobile) {
    const isSelected = context.value === props.value
    return (
        <Button
            ref={ref as any}
            variant={isSelected ? "secondary" : "ghost"}
            className={cn("w-full justify-start font-normal px-3", className)}
            onClick={() => {
                if (props.value) {
                    context.onValueChange(props.value)
                    context.setOpen(false)
                }
            }}
        >
            {children}
            {isSelected && <Check className="ml-auto h-4 w-4" />}
        </Button>
    )
  }

  return (
    <SelectPrimitive.Item
      ref={ref}
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="h-4 w-4" />
        </SelectPrimitive.ItemIndicator>
      </span>

      <SelectPrimitive.ItemText className="w-full">{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
})
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}
