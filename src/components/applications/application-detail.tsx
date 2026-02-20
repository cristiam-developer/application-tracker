"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowLeft,
  ExternalLink,
  Pencil,
  Trash2,
  MapPin,
  DollarSign,
  Briefcase,
  Calendar,
  Globe,
  User,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "./status-badge";
import { PlatformBadge } from "./platform-badge";
import { StatusTimeline } from "./status-timeline";
import { DeleteDialog } from "./delete-dialog";
import { PLATFORM_CONFIG, type Platform } from "@/types";

interface StatusChange {
  id: string;
  fromStatus: string;
  toStatus: string;
  changedAt: Date | string;
  notes: string | null;
}

interface Application {
  id: string;
  companyName: string;
  positionTitle: string;
  status: string;
  platform: string;
  applicationDate: Date | string;
  url: string | null;
  salary: string | null;
  location: string | null;
  jobType: string | null;
  notes: string | null;
  source: string;
  contactName: string | null;
  contactEmail: string | null;
  createdAt: Date | string;
  statusHistory: StatusChange[];
}

const JOB_TYPE_LABELS: Record<string, string> = {
  full_time: "Full Time",
  part_time: "Part Time",
  contract: "Contract",
  internship: "Internship",
};

function InfoItem({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | null | undefined;
  href?: string;
}) {
  if (!value) return null;

  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 text-muted-foreground shrink-0" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline inline-flex items-center gap-1"
          >
            {value}
            <ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          <p className="text-sm">{value}</p>
        )}
      </div>
    </div>
  );
}

export function ApplicationDetail({
  application,
}: {
  application: Application;
}) {
  const router = useRouter();
  const [showDelete, setShowDelete] = useState(false);

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/applications">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Applications
        </Link>
      </Button>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {application.companyName}
          </h1>
          <p className="text-lg text-muted-foreground">
            {application.positionTitle}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <StatusBadge status={application.status} />
            <PlatformBadge platform={application.platform} />
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              router.push(`/applications/${application.id}?edit=true`)
            }
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive"
            onClick={() => setShowDelete(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <InfoItem
                icon={Calendar}
                label="Date Applied"
                value={format(
                  new Date(application.applicationDate),
                  "MMMM d, yyyy"
                )}
              />
              <InfoItem
                icon={MapPin}
                label="Location"
                value={application.location}
              />
              <InfoItem
                icon={DollarSign}
                label="Salary"
                value={application.salary}
              />
              <InfoItem
                icon={Briefcase}
                label="Job Type"
                value={
                  application.jobType
                    ? JOB_TYPE_LABELS[application.jobType] ??
                      application.jobType
                    : null
                }
              />
              <InfoItem
                icon={Globe}
                label="Platform"
                value={
                  PLATFORM_CONFIG[application.platform as Platform]?.label ??
                  application.platform
                }
              />
              <InfoItem
                icon={ExternalLink}
                label="Job URL"
                value={application.url ? "View Listing" : null}
                href={application.url ?? undefined}
              />
            </CardContent>
          </Card>

          {/* Contact info */}
          {(application.contactName || application.contactEmail) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Contact</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <InfoItem
                  icon={User}
                  label="Contact Name"
                  value={application.contactName}
                />
                <InfoItem
                  icon={Mail}
                  label="Contact Email"
                  value={application.contactEmail}
                  href={
                    application.contactEmail
                      ? `mailto:${application.contactEmail}`
                      : undefined
                  }
                />
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {application.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">
                  {application.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Timeline sidebar */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status History</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusTimeline history={application.statusHistory} />
            </CardContent>
          </Card>
        </div>
      </div>

      <DeleteDialog
        applicationId={application.id}
        companyName={application.companyName}
        positionTitle={application.positionTitle}
        open={showDelete}
        onOpenChange={setShowDelete}
        onDeleted={() => router.push("/applications")}
      />
    </div>
  );
}
