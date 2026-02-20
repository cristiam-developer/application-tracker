"use client";

import { useState, useRef } from "react";
import { FileText, Upload, X } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type ResumeSettingsCardProps = {
  initialProfile: {
    fileName: string;
    skills: string[];
    jobTitles: string[];
    uploadedAt: string;
  } | null;
};

export function ResumeSettingsCard({
  initialProfile,
}: ResumeSettingsCardProps) {
  const [profile, setProfile] = useState(initialProfile);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | undefined>(undefined);

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/resume/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }

      const data = await res.json();
      setProfile({
        fileName: data.fileName,
        skills: data.skills,
        jobTitles: data.jobTitles,
        uploadedAt: data.uploadedAt,
      });
      toast.success(
        `Resume uploaded — ${data.skills.length} skills extracted`
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to upload resume"
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Resume Profile
        </CardTitle>
        <CardDescription>
          Upload your resume to extract skills and auto-populate job search
          queries.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            {profile ? (
              <>
                <p className="text-sm font-medium text-green-500">
                  {profile.fileName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {profile.skills.length} skills found &middot; Uploaded{" "}
                  {new Date(profile.uploadedAt).toLocaleDateString()}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                No resume uploaded
              </p>
            )}
          </div>
          <div>
            <input
              ref={fileInputRef as React.RefObject<HTMLInputElement>}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              variant={profile ? "outline" : "default"}
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="mr-2 h-4 w-4" />
              {uploading
                ? "Uploading..."
                : profile
                  ? "Replace Resume"
                  : "Upload PDF"}
            </Button>
          </div>
        </div>

        {profile && profile.skills.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Extracted Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {profile.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {profile && profile.jobTitles.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Detected Job Titles</p>
            <div className="flex flex-wrap gap-1.5">
              {profile.jobTitles.map((title) => (
                <Badge
                  key={title}
                  variant="outline"
                  className="text-xs"
                >
                  {title}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
