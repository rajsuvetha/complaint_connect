import { Sidebar } from "@/components/Sidebar";
import { PageHeader } from "@/components/PageHeader";
import { useRooms, useBookings, useCreateBooking } from "@/hooks/use-rooms";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Users, Clock, Search, MapPin, Building2, Layout } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { ConferenceRoom } from "@shared/schema";

const searchFormSchema = z.object({
  room: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
}).refine(data => {
  // Simple string comparison for time HH:mm works
  return data.endTime > data.startTime;
}, {
  message: "End time must be after start time",
  path: ["endTime"],
});

type SearchFormData = z.infer<typeof searchFormSchema>;

export default function Booking() {
  const { data: rooms } = useRooms();
  const { data: bookings } = useBookings();
  const { mutate: bookRoom, isPending } = useCreateBooking();
  const { toast } = useToast();

  const [searchResults, setSearchResults] = useState<ConferenceRoom[] | null>(null);

  const form = useForm<SearchFormData>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      room: "all",
      date: new Date().toISOString().split('T')[0],
      startTime: "",
      endTime: ""
    }
  });

  // Unique rooms list for dropdown
  const uniqueRooms = rooms || [];

  const handleCreateBooking = (room: ConferenceRoom) => {
    const formData = form.getValues();
    const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.date}T${formData.endTime}`);

    bookRoom({
      roomId: room.id,
      startTime: startDateTime,
      endTime: endDateTime,
    }, {
      onSuccess: () => {
        toast({ title: "Room Booked Successfully", description: `You have booked ${room.name}` });
        setSearchResults(prev => prev ? prev.map(r => r.id === room.id ? { ...r, isOccupied: true } : r) : null);
      },
      onError: (err) => {
        toast({ title: "Booking Failed", description: err.message, variant: "destructive" });
      }
    });
  };

  const onSubmit = (data: SearchFormData) => {
    if (!rooms) return;

    const startDateTime = new Date(`${data.date}T${data.startTime}`);
    const endDateTime = new Date(`${data.date}T${data.endTime}`);

    // Filter logic
    const results = rooms.filter(room => {
      // 1. Match Room (if specific one selected)
      if (data.room && data.room !== "all" && room.name !== data.room) return false;

      // 2. Check Availability (Client-side simple check against loaded bookings)
      // In a real app complexity, this might need a server search endpoint
      // Here we check if any existing booking overlaps
      const isBooked = bookings?.some(booking => {
        if (booking.roomId !== room.id) return false;

        const bookingStart = new Date(booking.startTime);
        const bookingEnd = new Date(booking.endTime);

        // Overlap check
        return (startDateTime < bookingEnd && endDateTime > bookingStart);
      });

      return !isBooked;
    });

    setSearchResults(results);
    if (results.length === 0) {
      toast({ description: "No rooms available for the selected criteria.", variant: "default" });
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Sidebar />
      <main className="lg:pl-72 p-4 sm:p-8 pt-20 lg:pt-8 space-y-8">
        <div className="flex justify-between items-center">
          <PageHeader
            title="Meeting Room Booking"
            description="Find and book available conference rooms."
          />
          <div className="hidden md:block">
            <img src="/assets/gnet-logo.png" alt="Logo" className="h-10 opacity-0" /> {/* Placeholder/Invisible for structure */}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[400px,1fr]">
          {/* Search Panel */}
          <div className="space-y-6">
            <Card className="border-orange-500/20 shadow-lg overflow-hidden">
              <div className="bg-orange-500 p-4 text-white font-semibold flex items-center gap-2">
                <Search className="w-5 h-5" />
                Find a Room
              </div>
              <CardContent className="p-6 bg-card">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                    <FormField
                      control={form.control}
                      name="room"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Room / Floor</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value || "all"}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="All Rooms" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="all">All Rooms</SelectItem>
                              {uniqueRooms.map(r => (
                                <SelectItem key={r.id} value={r.name}>{r.name} - {r.floor}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="startTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="endTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button type="submit" className="w-full bg-red-700 hover:bg-red-800 text-white mt-4">
                      Check Availability
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Results Panel */}
          <div className="space-y-6">
            <div className="bg-slate-900 text-white p-3 px-6 rounded-t-lg font-medium shadow-sm">
              My Search Results
            </div>

            {searchResults === null ? (
              <div className="flex flex-col items-center justify-center p-12 text-muted-foreground border-2 border-dashed rounded-b-lg bg-white/50">
                <Search className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-center">Select criteria and click "Check Availability" to see rooms.</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-b-lg shadow-sm">
                <p className="text-muted-foreground">No rooms found for the selected criteria.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {searchResults.map(room => (
                  <Card key={room.id} className="overflow-hidden border-l-4 border-l-green-500 shadow-md">
                    <CardContent className="p-0">
                      <div className="p-4 sm:p-6 pb-4">
                        <h3 className="text-lg sm:text-xl font-bold text-slate-800">{room.name}</h3>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Building2 className="w-4 h-4 shrink-0" />
                          <span>{room.building} - {room.floor} ({room.capacity})</span>
                        </div>
                      </div>

                      <div className="bg-amber-500/10 px-4 sm:px-6 py-3 border-y border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="text-sm font-medium text-amber-900 flex items-start sm:items-center gap-2">
                          <span className="font-bold shrink-0">Gadgets:</span>
                          <span className="break-words">{room.amenities?.join("- ") || "Standard Setup"}</span>
                        </div>
                      </div>

                      <div className="bg-green-600 px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="text-white font-medium flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 shrink-0" />
                          <span>{room.location} | {room.building}</span>
                        </div>
                        <Button
                          onClick={() => handleCreateBooking(room)}
                          disabled={isPending}
                          size="sm"
                          className="w-full sm:w-auto bg-red-700 hover:bg-red-800 text-white shadow-lg border border-red-800"
                        >
                          {isPending ? "Booking..." : "Book Room"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
