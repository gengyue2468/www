import React, { createContext, useContext, useRef, useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

const SegmentContext = createContext();

export const SegmentContainer = ({ 
  children, 
  className,
  sliderClassName = "",
  sliderStyle = {},
  initialOpacity = 0,
  activeOpacity = 1,
  transitionDuration = 300,
}) => {
  const containerRef = useRef(null);
  const sliderRef = useRef(null);
  const [items, setItems] = useState([]);
  const isInitialized = useRef(false);

  const registerItem = useCallback((element) => {
    if (!element) return () => {};
    setItems(prev => {
      if (!prev.includes(element)) {
        return [...prev, element];
      }
      return prev;
    });
    
    return () => {
      setItems(prev => prev.filter(item => item !== element));
    };
  }, []);

  const handleMouseEnter = useCallback((element) => {
  if (!sliderRef.current || !element) return;
  
  const container = containerRef.current;
  const containerRect = container.getBoundingClientRect();
  const targetRect = element.getBoundingClientRect();
  
  const top = (targetRect.top - containerRect.top) + container.scrollTop;
  const height = targetRect.height;

  sliderRef.current.style.top = `${top}px`;
  sliderRef.current.style.height = `${height}px`;
  sliderRef.current.style.opacity = activeOpacity;
}, [activeOpacity]);

  const handleMouseLeave = useCallback(() => {
    if (sliderRef.current) {
      sliderRef.current.style.opacity = initialOpacity;
    }
  }, [initialOpacity]);

  useEffect(() => {
    if (items.length > 0 && sliderRef.current && !isInitialized.current) {
      const firstItem = items[0];
      const containerRect = containerRef.current.getBoundingClientRect();
      const firstItemRect = firstItem.getBoundingClientRect();

      sliderRef.current.style.top = `${firstItemRect.top - containerRect.top}px`;
      sliderRef.current.style.height = `${firstItemRect.height}px`;
      sliderRef.current.style.opacity = initialOpacity;
      
      sliderRef.current.style.transition = `
        top ${transitionDuration}ms ease-out, 
        height ${transitionDuration}ms ease-out, 
        opacity ${transitionDuration}ms ease-out
      `;
      
      isInitialized.current = true;
    }
  }, [items, initialOpacity, transitionDuration]);

  return (
    <SegmentContext.Provider value={{ registerItem, handleMouseEnter }}>
      <div
        ref={containerRef}
        className={cn("group relative inline-flex flex-col", className)}
        onMouseLeave={handleMouseLeave}
      >
        <div
          ref={sliderRef}
          className={cn(
            "absolute left-0 right-0 rounded-xl bg-neutral-100 dark:bg-neutral-900 z-[-1]",
            sliderClassName
          )}
          style={{ 
            opacity: initialOpacity,
            transition: `all ${transitionDuration}ms ease-out`,
            ...sliderStyle 
          }}
        />
        {children}
      </div>
    </SegmentContext.Provider>
  );
};

export const SegmentItem = ({ 
  children, 
  className,
  as: Component = "div",
  ...props
}) => {
  const { registerItem, handleMouseEnter } = useContext(SegmentContext);
  const itemRef = useRef(null);

  useEffect(() => {
    if (itemRef.current) {
      const unregister = registerItem(itemRef.current);
      return unregister;
    }
  }, [registerItem]);

  return (
    <Component
      ref={itemRef}
      className={cn(
        "transition-all duration-300 group-hover:[&:not(:hover)]:opacity-50 hover:opacity-100",
        className
      )}
      onMouseEnter={() => handleMouseEnter(itemRef.current)}
      {...props}
    >
      {children}
    </Component>
  );
};

export const SegmentGroup = ({ children, className }) => {
  return (
    <div className={cn("flex flex-col space-y-0", className)}>
      {children}
    </div>
  );
};
