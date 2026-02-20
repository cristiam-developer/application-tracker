"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { toast } from "sonner";
import {
  APPLICATION_STATUSES,
  STATUS_CONFIG,
  type ApplicationStatus,
  type BoardApplication,
} from "@/types";
import { BoardColumn } from "./board-column";
import { DeleteDialog } from "@/components/applications/delete-dialog";

interface KanbanBoardProps {
  applications: BoardApplication[];
}

export function KanbanBoard({
  applications: initialApplications,
}: KanbanBoardProps) {
  const router = useRouter();
  const [applications, setApplications] = useState(initialApplications);
  const [deleteTarget, setDeleteTarget] = useState<BoardApplication | null>(
    null
  );

  const columns = APPLICATION_STATUSES.map((status) => ({
    status,
    ...STATUS_CONFIG[status],
    cards: applications.filter((app) => app.status === status),
  }));

  const onDragEnd = useCallback(
    async (result: DropResult) => {
      const { source, destination, draggableId } = result;

      if (!destination) return;

      if (
        source.droppableId === destination.droppableId &&
        source.index === destination.index
      ) {
        return;
      }

      // Same column reorder (visual only, not persisted)
      if (source.droppableId === destination.droppableId) {
        setApplications((prev) => {
          const updated = [...prev];
          const columnCards = updated.filter(
            (a) => a.status === source.droppableId
          );
          const movedCard = columnCards[source.index];
          const cardIndex = updated.findIndex((a) => a.id === movedCard.id);
          const [removed] = updated.splice(cardIndex, 1);

          const destColumnCards = updated.filter(
            (a) => a.status === destination.droppableId
          );
          if (destination.index >= destColumnCards.length) {
            updated.push(removed);
          } else {
            const targetCard = destColumnCards[destination.index];
            const targetIndex = updated.findIndex(
              (a) => a.id === targetCard.id
            );
            updated.splice(targetIndex, 0, removed);
          }
          return updated;
        });
        return;
      }

      // Cross-column move — optimistic status change
      const newStatus = destination.droppableId;
      const card = applications.find((a) => a.id === draggableId);
      const previousStatus = card?.status;

      setApplications((prev) =>
        prev.map((app) =>
          app.id === draggableId ? { ...app, status: newStatus } : app
        )
      );

      try {
        const res = await fetch(`/api/applications/${draggableId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });

        if (!res.ok) throw new Error("Failed to update status");

        const statusLabel =
          STATUS_CONFIG[newStatus as ApplicationStatus]?.label ?? newStatus;
        toast.success(`Moved to ${statusLabel}`);
        router.refresh();
      } catch {
        // Rollback only this card
        setApplications((prev) =>
          prev.map((app) =>
            app.id === draggableId
              ? { ...app, status: previousStatus! }
              : app
          )
        );
        toast.error("Failed to update application status");
      }
    },
    [applications, router]
  );

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((column) => (
            <BoardColumn
              key={column.status}
              status={column.status}
              label={column.label}
              color={column.color}
              cards={column.cards}
              onDelete={(app) => setDeleteTarget(app)}
            />
          ))}
        </div>
      </DragDropContext>

      {deleteTarget && (
        <DeleteDialog
          applicationId={deleteTarget.id}
          companyName={deleteTarget.companyName}
          positionTitle={deleteTarget.positionTitle}
          open={!!deleteTarget}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
          onDeleted={() => {
            setApplications((prev) =>
              prev.filter((a) => a.id !== deleteTarget.id)
            );
            setDeleteTarget(null);
          }}
        />
      )}
    </>
  );
}
