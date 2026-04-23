import TabBarTab from "@/components/TabBarTab";
import PeelsLogo from "@/components/PeelsLogo";

type PeelsTabProps = {
  size?: number;
};

function PeelsTab({ size }: PeelsTabProps) {
  return <TabBarTab icon={<PeelsLogo size={size} />} href="/" tone="brand" />;
}

export default PeelsTab;
