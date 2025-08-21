import React, { createContext, useContext, useRef, useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

// 创建上下文
const SegmentContext = createContext();

// 滑块容器组件
export const SegmentContainer = ({ 
  children, 
  className,
  // 滑块自定义属性
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

  // 用useCallback稳定函数引用，避免每次渲染创建新函数
  const registerItem = useCallback((element) => {
    if (!element) return () => {};
    
    // 使用函数式更新确保获取最新状态
    setItems(prev => {
      // 避免重复添加
      if (!prev.includes(element)) {
        return [...prev, element];
      }
      return prev;
    });
    
    return () => {
      setItems(prev => prev.filter(item => item !== element));
    };
  }, []); // 空依赖数组，确保函数引用稳定

  // 处理鼠标进入项目
  const handleMouseEnter = useCallback((element) => {
  if (!sliderRef.current || !element) return;
  
  const container = containerRef.current;
  const containerRect = container.getBoundingClientRect();
  const targetRect = element.getBoundingClientRect();
  
  // 关键修正：加上容器的滚动距离（scrollTop），抵消滚动对位置计算的影响
  const top = (targetRect.top - containerRect.top) + container.scrollTop;
  const height = targetRect.height;

  sliderRef.current.style.top = `${top}px`;
  sliderRef.current.style.height = `${height}px`;
  sliderRef.current.style.opacity = activeOpacity;
}, [activeOpacity]);

  // 处理鼠标离开容器
  const handleMouseLeave = useCallback(() => {
    if (sliderRef.current) {
      sliderRef.current.style.opacity = initialOpacity;
    }
  }, [initialOpacity]);

  // 初始化滑块位置
  useEffect(() => {
    if (items.length > 0 && sliderRef.current && !isInitialized.current) {
      const firstItem = items[0];
      const containerRect = containerRef.current.getBoundingClientRect();
      const firstItemRect = firstItem.getBoundingClientRect();

      sliderRef.current.style.top = `${firstItemRect.top - containerRect.top}px`;
      sliderRef.current.style.height = `${firstItemRect.height}px`;
      sliderRef.current.style.opacity = initialOpacity;
      
      // 设置过渡属性
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
        {/* 滑块元素 */}
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

// 滑块项目组件
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
  }, [registerItem]); // 现在registerItem引用稳定，不会频繁触发

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

// 辅助组件：用于非数组列表场景
export const SegmentGroup = ({ children, className }) => {
  return (
    <div className={cn("flex flex-col space-y-0", className)}>
      {children}
    </div>
  );
};
