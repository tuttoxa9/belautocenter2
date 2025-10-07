"use client"

import React from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer"
import { useIsMobile } from "@/hooks/use-mobile"
import { X } from "lucide-react"

interface UniversalDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export function UniversalDrawer({ open, onOpenChange, title, children, footer }: UniversalDrawerProps) {
  const isMobile = useIsMobile()

  const content = (
    <div className="flex flex-col bg-white h-full">
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {children}
      </div>
      {footer && (
        <div className="p-4 sm:p-6 border-t bg-white/80 backdrop-blur-sm sticky bottom-0">
          {footer}
        </div>
      )}
    </div>
  )

  if (!isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-[480px] sm:max-w-[540px] p-0 flex flex-col">
          <SheetHeader className="p-4 sm:p-6 border-b flex-row justify-between items-center">
            <SheetTitle>{title}</SheetTitle>
            <SheetClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </SheetClose>
          </SheetHeader>
          {content}
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh] flex flex-col">
        <DrawerHeader className="text-left">
          <DrawerTitle>{title}</DrawerTitle>
        </DrawerHeader>
        <div className="flex-1 overflow-hidden">
          {content}
        </div>
        {footer && (
          <DrawerFooter className="pt-2 border-t bg-white/80 backdrop-blur-sm">
            {footer}
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  )
}