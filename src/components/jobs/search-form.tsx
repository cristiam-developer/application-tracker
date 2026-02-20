"use client";

import { useState, useEffect } from "react";
import { Search, MapPin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SOURCE_CONFIG, JOB_SOURCES, type JobSource } from "@/types";

type SearchFormProps = {
  onSearch: (query: string, location: string, sources: JobSource[]) => void;
  searching: boolean;
  availableSources: { source: JobSource; available: boolean }[];
};

export function SearchForm({
  onSearch,
  searching,
  availableSources,
}: SearchFormProps) {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [selectedSources, setSelectedSources] = useState<JobSource[]>(() =>
    availableSources.filter((s) => s.available).map((s) => s.source)
  );
  const [resumeSkills, setResumeSkills] = useState<string[]>([]);

  useEffect(() => {
    // Fetch resume skills for the "Use Resume Skills" button
    fetch("/api/resume/skills")
      .then((res) => res.json())
      .then((data) => {
        if (data.skills?.length) setResumeSkills(data.skills);
      })
      .catch(() => {});
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    const sources =
      selectedSources.length > 0
        ? selectedSources
        : availableSources.filter((s) => s.available).map((s) => s.source);
    onSearch(query.trim(), location.trim(), sources);
  }

  function toggleSource(source: JobSource) {
    setSelectedSources((prev) =>
      prev.includes(source)
        ? prev.filter((s) => s !== source)
        : [...prev, source]
    );
  }

  function useResumeSkills() {
    // Pick the top 3-5 skills as a search query
    const topSkills = resumeSkills.slice(0, 5).join(", ");
    setQuery(topSkills);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Job title, skills, or keywords..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="relative sm:w-48">
          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button type="submit" disabled={searching || !query.trim()}>
          {searching ? "Searching..." : "Search"}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Sources:</span>
        {JOB_SOURCES.map((source) => {
          const info = availableSources.find((s) => s.source === source);
          const available = info?.available ?? false;
          const selected = selectedSources.includes(source);
          const config = SOURCE_CONFIG[source];

          return (
            <Badge
              key={source}
              variant={selected ? "default" : "outline"}
              className={`cursor-pointer text-xs transition-colors ${
                !available ? "opacity-40 cursor-not-allowed" : ""
              } ${selected ? config.bgColor + " " + config.color + " border-0" : ""}`}
              onClick={() => available && toggleSource(source)}
            >
              {config.label}
              {!available && " (no key)"}
            </Badge>
          );
        })}

        {resumeSkills.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 text-xs"
            onClick={useResumeSkills}
          >
            <Sparkles className="mr-1 h-3 w-3" />
            Use Resume Skills
          </Button>
        )}
      </div>
    </form>
  );
}
