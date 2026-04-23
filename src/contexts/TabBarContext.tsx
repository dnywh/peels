"use client";

import { createContext, useContext, useState } from "react";
import type { Dispatch, PropsWithChildren, SetStateAction } from "react";

type TabBarProps = {
  visible: boolean;
  position: "inline" | "dynamic" | "fixed";
};

type TabBarContextValue = {
  tabBarProps: TabBarProps;
  setTabBarProps: Dispatch<SetStateAction<TabBarProps>>;
};

const TabBarContext = createContext<TabBarContextValue | undefined>(undefined);

export function TabBarProvider({ children }: PropsWithChildren) {
  const [tabBarProps, setTabBarProps] = useState<TabBarProps>({
    visible: true,
    position: "inline",
  });

  return (
    <TabBarContext.Provider value={{ tabBarProps, setTabBarProps }}>
      {children}
    </TabBarContext.Provider>
  );
}

export function useTabBar() {
  const context = useContext(TabBarContext);

  if (!context) {
    throw new Error("useTabBar must be used within a TabBarProvider");
  }

  return context;
}
