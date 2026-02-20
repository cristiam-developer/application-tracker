export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Application Detail
        </h1>
        <p className="text-muted-foreground">Viewing application: {id}</p>
      </div>
      <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
        Application detail view will be implemented in Phase 2.
      </div>
    </div>
  );
}
