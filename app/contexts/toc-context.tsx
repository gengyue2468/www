import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TocContextType {
  toc?: TocItem[];
  setToc: (toc?: TocItem[]) => void;
}

const TocContext = createContext<TocContextType>({ 
  toc: undefined,
  setToc: () => {}
});

export function TocProvider({ children }: { children: ReactNode }) {
  const [toc, setToc] = useState<TocItem[] | undefined>(undefined);

  return <TocContext.Provider value={{ toc, setToc }}>{children}</TocContext.Provider>;
}

export function useTocContext() {
  return useContext(TocContext);
}

export function useTocSetter() {
  const { setToc } = useContext(TocContext);
  return setToc;
}
