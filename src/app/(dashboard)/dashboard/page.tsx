export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your job application pipeline.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {["Total Applications", "Active", "Interviews", "Offers"].map(
          (label) => (
            <div
              key={label}
              className="rounded-lg border border-border bg-card p-6"
            >
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="text-2xl font-bold">--</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
