import { Suspense } from "react";
import { getApplications } from "@/lib/queries/applications";
import { listApplicationsSchema } from "@/lib/validators";
import { DataTable } from "@/components/applications/data-table";
import { TableToolbar } from "@/components/applications/table-toolbar";
import { Skeleton } from "@/components/ui/skeleton";

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const rawParams = await searchParams;

  // Flatten array values to first string
  const params: Record<string, string> = {};
  for (const [key, value] of Object.entries(rawParams)) {
    if (typeof value === "string") params[key] = value;
    else if (Array.isArray(value) && value[0]) params[key] = value[0];
  }

  const parsed = listApplicationsSchema.safeParse(params);
  const validParams = parsed.success
    ? parsed.data
    : listApplicationsSchema.parse({});

  const { data, pagination } = await getApplications(validParams);

  // Serialize dates for client component
  const serializedData = data.map((app) => ({
    id: app.id,
    companyName: app.companyName,
    positionTitle: app.positionTitle,
    status: app.status,
    platform: app.platform,
    applicationDate: app.applicationDate.toISOString(),
    location: app.location,
    salary: app.salary,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
        <p className="text-muted-foreground">
          Manage and track all your job applications.
        </p>
      </div>
      <Suspense fallback={<Skeleton className="h-10 w-full" />}>
        <TableToolbar />
      </Suspense>
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <DataTable
          data={serializedData}
          pageCount={pagination.totalPages}
          currentPage={pagination.page}
          total={pagination.total}
        />
      </Suspense>
    </div>
  );
}
