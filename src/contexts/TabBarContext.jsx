"use client";
import { createContext, useContext, useState } from "react";

const TabBarContext = createContext();

export function TabBarProvider({ children }) {
  const [tabBarProps, setTabBarProps] = useState({
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
