"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useScheduleStore, BookingRequest } from "@/store/useScheduleStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parseISO } from "date-fns";
import { CheckCircle2, XCircle, Loader2, LockKeyhole } from "lucide-react";

function ReviewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get("id");

  const { initializeListeners, bookings, dogs, timeBlocks, updateBookingStatus, isInitialized } = useScheduleStore();
  
  const [pin, setPin] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    initializeListeners();
  }, [initializeListeners]);

  if (!bookingId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-6">
        <Card className="max-w-md w-full p-6 text-center shadow-lg border-zinc-200">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-zinc-900 mb-2">Invalid Link</h2>
          <p className="text-zinc-500 mb-6">No booking ID was provided in the URL.</p>
          <Button onClick={() => router.push('/admin')} variant="outline">Go to Dashboard</Button>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-6">
        <Card className="max-w-md w-full shadow-xl border-zinc-200 rounded-[24px] overflow-hidden">
          <CardHeader className="bg-primary/5 border-b border-zinc-100 pb-6 pt-8 text-center">
             <div className="mx-auto w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-zinc-100 mb-4">
               <LockKeyhole className="w-6 h-6 text-primary" />
             </div>
             <CardTitle className="text-2xl font-serif font-bold text-primary">Admin Access</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="flex flex-col gap-4">
              <label className="text-sm font-bold text-zinc-700 text-center uppercase tracking-wider">Enter Security PIN</label>
              <input 
                type="password" 
                value={pin} 
                onChange={e => setPin(e.target.value)} 
                onKeyDown={e => { if (e.key === 'Enter' && pin === '1234') setIsAuthenticated(true); else if (e.key === 'Enter') alert('Incorrect PIN'); }}
                placeholder="****" 
                className="flex h-14 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-2 text-center text-2xl tracking-[0.5em] placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
              />
              <Button 
                onClick={() => { if (pin === '1234') setIsAuthenticated(true); else alert('Incorrect PIN'); }} 
                className="h-14 mt-4 text-lg font-bold rounded-xl bg-primary hover:bg-primary/90 shadow-md"
              >
                Unlock
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 p-6">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-zinc-500 font-medium">Loading booking data...</p>
      </div>
    );
  }

  const booking = bookings.find(b => b.id === bookingId);
  const dog = booking ? dogs.find(d => d.id === booking.dogId) : null;
  const block = booking ? timeBlocks.find(b => b.id === booking.blockId) : null;

  if (!booking || !dog || !block) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-6">
        <Card className="max-w-md w-full p-6 text-center shadow-lg border-zinc-200">
          <XCircle className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-zinc-900 mb-2">Booking Not Found</h2>
          <p className="text-zinc-500 mb-6">This booking may have been deleted or the ID is incorrect.</p>
          <Button onClick={() => router.push('/admin')} variant="outline">Go to Dashboard</Button>
        </Card>
      </div>
    );
  }

  const handleAction = async (status: 'confirmed' | 'rejected') => {
    setIsProcessing(true);
    try {
      await updateBookingStatus(bookingId, booking, status);
      // Let it process briefly before redirecting
      setTimeout(() => {
        router.push('/admin');
      }, 1000);
    } catch (error) {
      console.error(error);
      setIsProcessing(false);
      alert("Failed to update booking status.");
    }
  };

  if (booking.status !== 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-6">
        <Card className="max-w-md w-full p-8 text-center shadow-lg border-zinc-200 rounded-[24px]">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-2xl font-serif font-bold text-zinc-900 mb-2">Already Processed</h2>
          <p className="text-zinc-500 mb-8 font-medium">This booking request has already been marked as <strong className="uppercase">{booking.status}</strong>.</p>
          <Button onClick={() => router.push('/admin')} className="w-full h-12 font-bold rounded-xl" variant="outline">View Dashboard</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-6">
      <Card className="max-w-md w-full shadow-xl border-zinc-200 rounded-[32px] overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <div className="bg-primary/5 p-8 border-b border-zinc-100 flex flex-col items-center text-center relative">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white font-extrabold text-3xl shadow-md border-4 border-white mb-4 ${dog.avatarColor}`}>
            {dog.name.charAt(0)}
          </div>
          <h2 className="text-2xl font-serif font-bold text-zinc-900 mb-1">{dog.name}</h2>
          <p className="text-zinc-500 font-medium">{dog.owner}'s dog</p>
        </div>
        
        <CardContent className="p-8">
          <div className="space-y-6 mb-8">
            <div className="flex flex-col items-center bg-white border border-zinc-100 shadow-sm rounded-2xl p-4">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Requested Date</span>
              <span className="text-lg font-bold text-zinc-800">{format(parseISO(booking.date), 'EEEE, MMMM do')}</span>
            </div>
            <div className="flex flex-col items-center bg-white border border-zinc-100 shadow-sm rounded-2xl p-4">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Time Block</span>
              <span className="text-lg font-bold text-primary">{block.label}</span>
              <span className="text-sm font-semibold text-zinc-500 mt-0.5">{block.timeRange}</span>
            </div>
          </div>

          <div className="flex gap-4">
            <Button 
              variant="outline" 
              disabled={isProcessing}
              onClick={() => handleAction('rejected')}
              className="flex-1 h-14 rounded-2xl font-bold text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 text-lg shadow-sm"
            >
              Reject
            </Button>
            <Button 
              disabled={isProcessing}
              onClick={() => handleAction('confirmed')}
              className="flex-1 h-14 rounded-2xl font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-md text-lg"
            >
              {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : "Approve"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-50"></div>}>
      <ReviewContent />
    </Suspense>
  );
}
