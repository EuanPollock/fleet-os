import StatCard from "./StatCard";

export default function DashboardStats() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      <StatCard
        title="Total Vehicles"
        value="48"
        subtitle="+2 this month"
      />

      <StatCard
        title="Drivers"
        value="52"
        subtitle="3 currently unavailable"
      />

      <StatCard
        title="Compliance Alerts"
        value="4"
        subtitle="Needs attention"
      />

      <StatCard
        title="Services Due"
        value="6"
        subtitle="Next 14 days"
      />

      <StatCard
        title="Fuel Spend"
        value="£18,420"
        subtitle="This month"
      />

      <StatCard
        title="Fleet Cost"
        value="£42,680"
        subtitle="This month"
      />
    </div>
  );
}
