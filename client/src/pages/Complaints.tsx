import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { PageHeader } from "@/components/PageHeader";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertComplaintSchema } from "@shared/schema";
import { useCreateComplaint, useComplaints } from "@/hooks/use-complaints";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Send } from "lucide-react";
import { motion } from "framer-motion";

// Extend schema for frontend validation messages if needed, 
// though zod-drizzle is usually good.
const formSchema = insertComplaintSchema.extend({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Please provide more detail"),
  department: z.string().min(1, "Please select a department"),
});

type FormValues = z.infer<typeof formSchema>;

export default function Complaints() {
  const { mutate, isPending } = useCreateComplaint();
  const { data: complaints } = useComplaints();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      department: "",
    },
  });

  function onSubmit(data: FormValues) {
    mutate(data, {
      onSuccess: () => {
        toast({
          title: "Complaint Registered",
          description: "Your complaint has been forwarded to the department.",
        });
        form.reset();
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    });
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Sidebar />
      <main className="lg:pl-72 p-4 sm:p-8 pt-20 lg:pt-8">
        <PageHeader
          title="File a Complaint"
          description="Submit issues directly to the responsible department."
        />

        <div className="max-w-2xl mx-auto lg:mx-0 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="border-border/50 shadow-lg shadow-black/5">
              <CardContent className="p-6 md:p-8">
                {/* ... existing form code ... */}
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* ... form fields ... */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-semibold">Issue Title</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. WiFi not working in Room 101" className="bg-muted/30" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="department"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-semibold">Department</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-muted/30">
                                  <SelectValue placeholder="Select Department" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="electrical">Electrical</SelectItem>
                                <SelectItem value="plumbing">Plumbing</SelectItem>
                                <SelectItem value="network">Network</SelectItem>
                                <SelectItem value="software">Software</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe the issue in detail..."
                              className="min-h-[150px] bg-muted/30 resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end pt-4">
                      <Button
                        type="submit"
                        disabled={isPending}
                        className="w-full md:w-auto px-8 h-12 text-base font-semibold shadow-lg shadow-primary/25"
                      >
                        {isPending ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Submit Complaint
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold tracking-tight">My Complaint History</h2>
            {complaints && complaints.length > 0 ? (
              <div className="grid gap-4">
                {complaints.map((complaint) => (
                  <Card key={complaint.id} className="border-border/50">
                    <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <p className="font-semibold break-words">{complaint.title}</p>
                        <p className="text-sm text-muted-foreground">{new Date(complaint.createdAt || Date.now()).toLocaleDateString()} - <span className="capitalize">{complaint.department}</span></p>
                      </div>
                      <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border self-start sm:self-auto ${complaint.status === 'resolved'
                        ? 'bg-green-500/10 text-green-600 border-green-500/20'
                        : 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
                        }`}>
                        {complaint.status}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No complaints found.</p>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
