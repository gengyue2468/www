import type { Canteen, kaifanStatus } from "@/types/canteen";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import TabItem from "./tab-item";
import TabContent from "./tab-content";

interface TabItem {
  name: string;
  value: number;
}

interface TabProps {
  openedCanteen: Canteen[];
  kaifanStatus: kaifanStatus[];
}

const TABS: TabItem[] = [
  {
    name: "有什么吃的",
    value: 0,
  },
  {
    name: "开饭了吗",
    value: 1,
  },
];

export default function Tab({ openedCanteen, kaifanStatus }: TabProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedTab, setSelectedTab] = useState(() => {
    const tabParam = searchParams.get("tab");
    return tabParam ? Number(tabParam) : 0;
  });

  const handleTabSelect = (value: number) => {
    setSelectedTab(value);
    setSearchParams({ tab: String(value) });
  };

  return (
    <>
      <div className="flex flex-row items-center gap-4 mt-6">
        {TABS.map((tab) => (
          <TabItem
            value={tab.value}
            name={tab.name}
            key={tab.value}
            isSelected={selectedTab === tab.value}
            onSelect={() => handleTabSelect(tab.value)}
          />
        ))}
      </div>
      <div className="mt-4">
        {selectedTab === 0 ? (
          <TabContent type="opened" data={openedCanteen} />
        ) : (
          <TabContent type="status" data={kaifanStatus} />
        )}
      </div>
    </>
  );
}
