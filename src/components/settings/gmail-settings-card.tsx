"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Mail, Unplug } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type GmailSettingsCardProps = {
  connected: boolean;
  email: string | null;
};

export function GmailSettingsCard({
  connected: initialConnected,
  email: initialEmail,
}: GmailSettingsCardProps) {
  const [connected, setConnected] = useState(initialConnected);
  const [email, setEmail] = useState(initialEmail);
  const [disconnecting, setDisconnecting] = useState(false);

  async function handleDisconnect() {
    setDisconnecting(true);
    try {
      const res = await fetch("/api/gmail/connection", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to disconnect");
      setConnected(false);
      setEmail(null);
      toast.success("Gmail disconnected");
    } catch {
      toast.error("Failed to disconnect Gmail");
    } finally {
      setDisconnecting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Gmail Connection
        </CardTitle>
        <CardDescription>
          Connect your Gmail account to automatically import job application
          emails.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {connected ? (
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-green-500">Connected</p>
              {email && (
                <p className="text-sm text-muted-foreground">{email}</p>
              )}
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDisconnect}
              disabled={disconnecting}
            >
              <Unplug className="mr-2 h-4 w-4" />
              {disconnecting ? "Disconnecting..." : "Disconnect"}
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Not connected</p>
            <Button onClick={() => signIn("google", { callbackUrl: "/settings" })}>
              <Mail className="mr-2 h-4 w-4" />
              Connect Gmail
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
