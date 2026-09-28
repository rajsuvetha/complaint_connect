import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/Sidebar";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Mail } from "lucide-react";

export default function DemoMode() {
  type Email = { subject: string; to: string; timestamp: string | number };

  const { data: emailLog } = useQuery<Email[]>({
    queryKey: ["/api/email-log"],
  });

  return (
    <div className="min-h-screen bg-muted/30">
      <Sidebar />
      <main className="lg:pl-72 p-4 sm:p-8">
        <PageHeader 
          title="Demo Mode" 
          description="System status and email log for testing."
        />

        <div className="space-y-6">
          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Mode</p>
                <Badge variant="outline" className="bg-amber-50 dark:bg-amber-950 text-amber-900 dark:text-amber-100 border-amber-200 dark:border-amber-800">
                  Demo Mode Active
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Status</p>
                <p className="text-base text-foreground">Email notifications are being logged instead of sent.</p>
              </div>
            </CardContent>
          </Card>

          {/* Email Log */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Log ({emailLog?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {emailLog && emailLog.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {emailLog.map((email: any, idx: number) => (
                    <div key={idx} className="border rounded p-3 bg-muted/50">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{email.subject}</p>
                          <p className="text-xs text-muted-foreground">{email.to}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(email.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground py-8">
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-sm">No emails logged yet. Submit a complaint to generate emails.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">About Demo Mode</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Demo mode allows you to test the complaint and booking system without needing a real email provider.</p>
              <p>When you submit a complaint, the system logs what email would be sent instead of actually sending it.</p>
              <p>You can view all logged emails here in real-time.</p>
              <p className="pt-2">To enable real email delivery, configure GMAIL_USER and GMAIL_APP_PASSWORD in your secrets, or set up an external email service.</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
