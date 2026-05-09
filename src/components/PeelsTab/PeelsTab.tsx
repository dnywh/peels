import TabBarTab from "@/components/TabBarTab";
import PeelsLogo from "@/components/PeelsLogo";

type PeelsTabProps = {
  ariaLabel: string;
  size?: number;
};

function PeelsTab({ ariaLabel, size }: PeelsTabProps) {
  return (
    <TabBarTab
      icon={<PeelsLogo size={size} aria-hidden="true" />}
      href="/"
      tone="brand"
      ariaLabel={ariaLabel}
    />
  );
}

export default PeelsTab;
