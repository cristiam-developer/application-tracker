import { Droppable, Draggable } from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { BoardApplication } from "@/types";
import { BoardCard } from "./board-card";

interface BoardColumnProps {
  status: string;
  label: string;
  color: string;
  cards: BoardApplication[];
  onDelete: (app: BoardApplication) => void;
}

export function BoardColumn({
  status,
  label,
  color,
  cards,
  onDelete,
}: BoardColumnProps) {
  return (
    <div className="flex w-[280px] shrink-0 flex-col rounded-lg bg-muted/50">
      <div className="flex items-center gap-2 p-3">
        <span className={cn("h-2.5 w-2.5 rounded-full", color)} />
        <h3 className="text-sm font-semibold">{label}</h3>
        <Badge variant="secondary" className="ml-auto text-xs">
          {cards.length}
        </Badge>
      </div>

      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "flex min-h-[120px] flex-1 flex-col gap-2 overflow-y-auto p-2 pt-0",
              "max-h-[calc(100vh-240px)]",
              snapshot.isDraggingOver && "rounded-b-lg bg-accent/50"
            )}
          >
            {cards.length === 0 && !snapshot.isDraggingOver && (
              <p className="py-8 text-center text-xs text-muted-foreground">
                No applications
              </p>
            )}
            {cards.map((card, index) => (
              <Draggable key={card.id} draggableId={card.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <BoardCard
                      application={card}
                      isDragging={snapshot.isDragging}
                      onDelete={() => onDelete(card)}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
