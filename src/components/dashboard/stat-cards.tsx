import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, TrendingUp, MessageSquare, Gift } from "lucide-react";

type StatCardsProps = {
  total: number;
  active: number;
  interviews: number;
  offers: number;
  responseRate: number;
};

const cards = [
  { key: "total" as const, label: "Total Applications", icon: FileText },
  { key: "active" as const, label: "Active", icon: TrendingUp },
  { key: "interviews" as const, label: "Interviews", icon: MessageSquare },
  { key: "offers" as const, label: "Offers", icon: Gift },
];

export function StatCards(props: StatCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map(({ key, label, icon: Icon }) => (
        <Card key={key}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {label}
            </CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{props[key]}</div>
            {key === "total" && (
              <p className="text-xs text-muted-foreground">
                {props.responseRate}% response rate
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
