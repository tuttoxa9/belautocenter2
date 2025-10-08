"use client"

import * as React from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer"
import { useIsMobile } from "@/hooks/use-mobile"

interface UniversalDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function UniversalDrawer({ open, onOpenChange, title, children, footer, className, noPadding = false }: UniversalDrawerProps) {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className={`w-[600px] sm:max-w-[800px] p-0 flex flex-col ${className}`}>
          <SheetHeader className="p-4 sm:p-6 border-b">
            <SheetTitle>{title}</SheetTitle>
          </SheetHeader>
          <div className={`flex-1 overflow-y-auto ${noPadding ? '' : 'p-4 sm:p-6'}`}>
            {children}
          </div>
          {footer && (
            <SheetFooter className="p-4 sm:p-6 border-t bg-white/95 backdrop-blur-sm">
              {footer}
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className={`max-h-[90vh] flex flex-col ${className}`}>
        <DrawerHeader className="text-left flex-shrink-0">
          <DrawerTitle>{title}</DrawerTitle>
        </DrawerHeader>
        <div className={`flex-1 overflow-y-auto ${noPadding ? '' : 'p-4'}`}>
          {children}
        </div>
        {footer && (
          <DrawerFooter className="flex-shrink-0 border-t mt-auto bg-white/95 backdrop-blur-sm">
            {footer}
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
}
