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
  position?: 'left' | 'right' | 'bottom';
}

export function UniversalDrawer({ open, onOpenChange, title, children, footer, className, noPadding = false, position = 'right' }: UniversalDrawerProps) {
  const isMobile = useIsMobile();

  // Для десктопа используем Sheet
  if (!isMobile) {
    const side = position === 'bottom' ? 'right' : position;
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side={side} className={`w-[600px] sm:max-w-[800px] p-0 flex flex-col ${className}`}>
          <SheetHeader className="p-4 sm:p-6 border-b">
            <SheetTitle>{title}</SheetTitle>
          </SheetHeader>
          <div className={`flex-1 overflow-y-auto ${noPadding ? '' : 'p-4 sm:p-6'}`}>
            {children}
          </div>
          {footer && (
            <SheetFooter className="p-4 sm:p-6 border-t bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
              {footer}
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>
    );
  }

  // Для мобильных используем Drawer с направлением снизу вверх
  const direction = 'bottom';
  const maxHeight = 'max-h-[90vh]';

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction={direction}>
      <DrawerContent direction={direction} className={`${maxHeight} flex flex-col ${className}`}>
        <DrawerHeader className="text-left flex-shrink-0">
          <DrawerTitle>{title}</DrawerTitle>
        </DrawerHeader>
        <div className={`flex-1 overflow-y-auto ${noPadding ? '' : 'p-4'}`}>
          {children}
        </div>
        {footer && (
          <DrawerFooter className="flex-shrink-0 border-t mt-auto bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
            {footer}
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
}
