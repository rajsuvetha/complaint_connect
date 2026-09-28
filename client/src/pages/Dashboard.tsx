import React from 'react';
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { useComplaintStats, useComplaints } from "@/hooks/use-complaints";
import { Sidebar } from "@/components/Sidebar";
import { PageHeader } from "@/components/PageHeader";
import { StatsCard } from "@/components/StatsCard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import {
  CheckCircle2,
  Clock,
  Files,
  PieChart as PieChartIcon,
  CalendarDays
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
const DEPARTMENTS = ["electrical", "plumbing", "network", "software"];

export default function Dashboard() {
  const { user } = useAuth();
  const { data: stats } = useComplaintStats();
  const { data: recentComplaints } = useComplaints();
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [resolutionComment, setResolutionComment] = useState("");
  const [assignmentComment, setAssignmentComment] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const resolveMutation = useMutation({
    mutationFn: async ({ id, comment }: { id: string; comment: string }) => {
      const res = await fetch(`/api/complaints/${id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment }),
      });
      if (!res.ok) throw new Error("Failed to resolve complaint");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/complaints/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/complaints"] }); // Assuming key is this
      toast({
        title: "Complaint Resolved",
        description: "The user has been notified via email.",
      });
      setResolvingId(null);
      setResolutionComment("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to resolve complaint. Please try again.",
        variant: "destructive",
      });
    },

  });

  const assignMutation = useMutation({
    mutationFn: async ({ id, comment }: { id: string; comment: string }) => {
      const res = await fetch(`/api/complaints/${id}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment }),
      });
      if (!res.ok) throw new Error("Failed to assign complaint");
    },
    onSuccess: () => {
      toast({
        title: "Complaint Assigned",
        description: "The department head has been notified via email.",
      });
      setAssigningId(null);
      setAssignmentComment("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to assign complaint. Please try again.",
        variant: "destructive",
      });
    },
  });

  const isAdmin = user?.email === "suvethavenkatesan@gmail.com";

  // Transform data for charts
  const pieData = stats ? Object.entries(stats.byDepartment).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  })) : [];

  const barData = stats ? [
    { name: 'Resolved', value: stats.resolved, fill: '#10b981' },
    { name: 'Pending', value: stats.pending, fill: '#f59e0b' },
  ] : [];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (!stats) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Sidebar />
      <main className="lg:pl-72 p-4 sm:p-8 pt-20 lg:pt-8">
        <PageHeader
          title={isAdmin ? "Dashboard Overview" : "Welcome Home"}
          description={isAdmin
            ? "Real-time insights into facility operations and status."
            : `Hello ${user?.firstName}, here are your quick actions.`
          }
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          {isAdmin ? (
            /* ADMIN VIEW */
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div variants={itemVariants}>
                  <StatsCard
                    title="Total Complaints"
                    value={stats?.total || 0}
                    icon={Files}
                    color="text-blue-500"
                  />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <StatsCard
                    title="Resolved"
                    value={stats?.resolved || 0}
                    icon={CheckCircle2}
                    color="text-emerald-500"
                  />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <StatsCard
                    title="Pending"
                    value={stats?.pending || 0}
                    icon={Clock}
                    color="text-amber-500"
                  />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <StatsCard
                    title="Departments"
                    value={DEPARTMENTS.length}
                    icon={PieChartIcon}
                    color="text-purple-500"
                  />
                </motion.div>
              </div>

              {/* Charts Row */}
              <div className="grid lg:grid-cols-2 gap-8">
                <motion.div variants={itemVariants}>
                  <Card className="shadow-lg shadow-black/5 border-border/50 h-[400px]">
                    <CardHeader>
                      <CardTitle className="text-lg font-display">Complaints by Department</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[320px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                          />
                          <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Card className="shadow-lg shadow-black/5 border-border/50 h-[400px]">
                    <CardHeader>
                      <CardTitle className="text-lg font-display">Resolution Status</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[320px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData} layout="vertical" margin={{ left: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                          <XAxis type="number" />
                          <YAxis type="category" dataKey="name" width={80} />
                          <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                          />
                          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                            {barData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Recent List */}
              <motion.div variants={itemVariants}>
                <Card className="shadow-lg shadow-black/5 border-border/50 overflow-hidden">
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-lg font-display">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 sm:p-6">
                    <div className="divide-y divide-border/50 sm:space-y-4 sm:divide-y-0">
                      {recentComplaints?.slice(0, 5).map((complaint) => (
                        <div
                          key={complaint.id}
                          className="flex flex-col sm:flex-row items-start justify-between gap-4 p-4 sm:rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors border-transparent hover:border-border/50"
                        >
                          <div className="space-y-1">
                            <p className="font-semibold text-foreground">{complaint.title}</p>
                            <p className="text-sm text-muted-foreground">{complaint.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs px-2 py-0.5 rounded-full bg-background border font-medium uppercase tracking-wider">
                                {complaint.department}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(complaint.createdAt!).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className={`
                            px-3 py-1 rounded-full text-xs font-semibold self-start sm:self-center
                            ${complaint.status === 'resolved'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                            }
                          `}>
                            {complaint.status}
                          </div>
                          {isAdmin && complaint.status !== 'resolved' && (
                            <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0 sm:ml-4">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setResolvingId(complaint.id)}
                              >
                                Resolve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setAssigningId(complaint.id)}
                              >
                                Assigned to
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                      {!recentComplaints?.length && (
                        <div className="text-center py-8 text-muted-foreground">
                          No complaints registered yet.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>


              <Dialog open={!!resolvingId} onOpenChange={(open) => !open && setResolvingId(null)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Resolve Complaint</DialogTitle>
                    <DialogDescription>
                      Add a comment explaining the resolution. This will be sent to the user via email.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Textarea
                      placeholder="Resolution details..."
                      value={resolutionComment}
                      onChange={(e) => setResolutionComment(e.target.value)}
                      rows={4}
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setResolvingId(null)}>Cancel</Button>
                    <Button
                      onClick={() => resolvingId && resolveMutation.mutate({ id: resolvingId, comment: resolutionComment })}
                      disabled={!resolutionComment.trim() || resolveMutation.isPending}
                    >
                      {resolveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Confirm Resolution
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={!!assigningId} onOpenChange={(open) => !open && setAssigningId(null)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Assign Complaint</DialogTitle>
                    <DialogDescription>
                      Add a note for the department head. This will be sent via email.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Textarea
                      placeholder="Assignment details..."
                      value={assignmentComment}
                      onChange={(e) => setAssignmentComment(e.target.value)}
                      rows={4}
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setAssigningId(null)}>Cancel</Button>
                    <Button
                      onClick={() => assigningId && assignMutation.mutate({ id: assigningId, comment: assignmentComment })}
                      disabled={!assignmentComment.trim() || assignMutation.isPending}
                    >
                      {assignMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Confirm Assignment
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          ) : (
            /* USER VIEW */
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Link href="/complaints">
                <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full hover:shadow-lg">
                  <CardHeader>
                    <div className="p-3 w-fit rounded-lg bg-primary/10 mb-4">
                      <Files className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Register Complaint</CardTitle>
                    <CardDescription>Track and manage your filed complaints</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">Click to view status of your requests</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/booking">
                <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full hover:shadow-lg">
                  <CardHeader>
                    <div className="p-3 w-fit rounded-lg bg-primary/10 mb-4">
                      <CalendarDays className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Book a  Conference Room</CardTitle>
                    <CardDescription>Reserve conference rooms</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">Check availability and schedule meetings</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          )}
        </motion.div>
      </main>
    </div >
  );
}
