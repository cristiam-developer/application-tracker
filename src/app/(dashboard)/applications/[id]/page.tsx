import { notFound } from "next/navigation";
import { getApplicationById } from "@/lib/queries/applications";
import { ApplicationDetail } from "@/components/applications/application-detail";
import { ApplicationForm } from "@/components/applications/application-form";
import type { CreateApplicationInput } from "@/lib/validators";

export default async function ApplicationDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const isEditing = query.edit === "true";

  const application = await getApplicationById(id);

  if (!application) {
    notFound();
  }

  if (isEditing) {
    const initialData: Partial<CreateApplicationInput> = {
      companyName: application.companyName,
      positionTitle: application.positionTitle,
      status: application.status as CreateApplicationInput["status"],
      platform: application.platform as CreateApplicationInput["platform"],
      applicationDate: application.applicationDate,
      url: application.url,
      salary: application.salary,
      location: application.location,
      jobType: application.jobType as CreateApplicationInput["jobType"],
      notes: application.notes,
      contactName: application.contactName,
      contactEmail: application.contactEmail,
    };

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Edit Application
          </h1>
          <p className="text-muted-foreground">
            {application.companyName} &mdash; {application.positionTitle}
          </p>
        </div>
        <div className="max-w-3xl">
          <ApplicationForm
            applicationId={application.id}
            initialData={initialData}
          />
        </div>
      </div>
    );
  }

  // Serialize dates for client component
  const serialized = {
    ...application,
    applicationDate: application.applicationDate.toISOString(),
    lastUpdated: application.lastUpdated.toISOString(),
    createdAt: application.createdAt.toISOString(),
    statusHistory: application.statusHistory.map((sh) => ({
      ...sh,
      changedAt: sh.changedAt.toISOString(),
    })),
  };

  return <ApplicationDetail application={serialized} />;
}
