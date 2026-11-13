"use client";

import React, { useState } from "react";
import { Tag, Users, ChevronDown, ChevronUp, Mail } from "lucide-react";
import type { InterestReportItem } from "../types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface InterestReportCardProps {
  item: InterestReportItem;
}

export function InterestReportCard({ item }: InterestReportCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <Card className="overflow-hidden transition-all">
      {/* Group Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 bg-surface border-b border-border-subtle">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Tag className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-semibold text-foreground tracking-tight truncate">
                {item.interest}
              </h3>
              <Badge variant="outline" className="text-[11px] font-medium py-0 px-2 shrink-0">
                <Users className="h-3 w-3 mr-1" />
                <span>
                  {item.totalUsers} {item.totalUsers === 1 ? "member" : "members"}
                </span>
              </Badge>
            </div>
            <p className="text-[11px] text-foreground-muted mt-0.5">
              Aggregated member cohort sharing this interest tag
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="self-end sm:self-center text-xs text-foreground-muted h-8 px-2.5"
          aria-expanded={isExpanded}
          aria-label={isExpanded ? `Collapse ${item.interest} members` : `Expand ${item.interest} members`}
        >
          <span className="mr-1">{isExpanded ? "Hide Members" : "Show Members"}</span>
          {isExpanded ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>

      {/* Group Members List / Table */}
      {isExpanded && (
        <div className="divide-y divide-border-subtle overflow-x-auto">
          {item.users.length === 0 ? (
            <div className="p-4 text-center text-xs text-foreground-muted">
              No individual member profiles linked to this interest.
            </div>
          ) : (
            <div className="min-w-[500px]">
              <div className="grid grid-cols-12 gap-3 px-5 py-2.5 text-[11px] font-medium text-foreground-subtle bg-surface-muted/30 select-none">
                <div className="col-span-5">MEMBER</div>
                <div className="col-span-5">EMAIL</div>
                <div className="col-span-2 text-right">ROLE</div>
              </div>

              {item.users.map((member) => {
                const initials = member.name
                  ? member.name
                      .split(" ")
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()
                  : "U";

                return (
                  <div
                    key={member.id}
                    className="grid grid-cols-12 gap-3 items-center px-5 py-3 hover:bg-surface-muted/20 transition-colors text-xs"
                  >
                    {/* Member Name with Avatar */}
                    <div className="col-span-5 flex items-center gap-2.5 min-w-0">
                      <div className="h-6 w-6 rounded-full bg-surface-muted border border-border flex items-center justify-center text-[10px] font-semibold text-foreground-muted shrink-0 select-none">
                        {initials}
                      </div>
                      <span className="font-medium text-foreground truncate">
                        {member.name}
                      </span>
                    </div>

                    {/* Member Email */}
                    <div className="col-span-5 flex items-center gap-1.5 min-w-0 text-foreground-muted">
                      <Mail className="h-3.5 w-3.5 shrink-0 text-foreground-subtle" />
                      <span className="truncate">{member.email}</span>
                    </div>

                    {/* Member Role */}
                    <div className="col-span-2 flex justify-end">
                      <Badge
                        variant={member.role === "admin" ? "admin" : "outline"}
                        className="text-[10px] py-0 px-2 font-normal capitalize"
                      >
                        {member.role}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

