"use client";
import { format, startOfWeek, addDays, parseISO } from "date-fns";
import { useScheduleStore, MAX_DOGS_PER_BLOCK, Dog } from "@/store/useScheduleStore";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import Link from 'next/link';
import React from 'react';
import { Settings, CalendarClock, CheckCircle2 } from 'lucide-react';

export default function ClientView() {
  const [mounted, setMounted] = useState(false);
  const { schedules, timeBlocks, dogs, bookings, requestBooking } = useScheduleStore();

  const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 5 }).map((_, i) => addDays(monday, i));

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{date: string, blockId: string} | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return <div className="min-h-screen bg-[#FDFDFD]"></div>;

  const handleDogSelect = (dogId: string) => {
    if (selectedSlot) {
      requestBooking(selectedSlot.date, selectedSlot.blockId, dogId);
      setIsDrawerOpen(false);
      setSelectedSlot(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans w-full">
      {/* Sleek Header */}
      <header className="flex justify-between items-center px-8 py-6 bg-white border-b border-zinc-300 sticky top-0 z-30 shadow-[0_1px_3px_rgba(0,0,0,0.02)] w-full">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-primary">
            Booking Schedule
          </h1>
          <p className="text-base font-semibold text-zinc-500 tracking-wide mt-1">{format(monday, "MMMM do")} - {format(weekDays[4], "do, yyyy")}</p>
        </div>
        <Link href="/admin" className="p-4 bg-zinc-50 hover:bg-zinc-100 rounded-2xl shadow-sm hover:shadow active:scale-95 transition-all text-zinc-600 border border-zinc-200">
           <Settings className="w-6 h-6" />
        </Link>
      </header>

      {/* Full Page Matrix Layout */}
      <div className="flex-1 w-full overflow-x-auto p-6 lg:p-12 xl:p-16 custom-scrollbar">
        <div className="min-w-[1000px] max-w-7xl mx-auto h-full grid grid-cols-[160px_repeat(5,1fr)] gap-x-6 gap-y-6">
          
          {/* Header Row (Days) */}
          <div className="empty-corner" />
          {weekDays.map(day => {
            const ds = format(day, "yyyy-MM-dd");
            const isToday = format(new Date(), "yyyy-MM-dd") === ds;
            return (
              <div key={ds} className={`pb-6 flex flex-col items-center justify-end ${isToday ? 'opacity-100' : 'opacity-80'}`}>
                 <h2 className={`text-sm font-bold uppercase tracking-widest ${isToday ? 'text-primary' : 'text-foreground/50'}`}>
                   {format(day, "EEEE")}
                 </h2>
                 <p className={`text-[32px] font-bold leading-none mt-2 ${isToday ? 'text-primary' : 'text-foreground'}`}>
                   {format(day, "d")}
                 </p>
                 {isToday && <div className="w-2 h-2 rounded-full bg-primary mt-3 shadow-md border border-primary" />}
              </div>
            )
          })}

          {/* Body Rows (Time Blocks) */}
          {timeBlocks.map(block => (
            <React.Fragment key={block.id}>
              {/* Y-Axis Label */}
              <div className="pr-8 py-8 flex flex-col justify-center items-end text-right border-r-2 border-zinc-300">
                 <h3 className="font-serif font-bold text-foreground text-xl leading-tight">{block.label}</h3>
                 <p className="text-sm font-bold text-zinc-400 mt-1.5 uppercase tracking-wider">{block.timeRange}</p>
              </div>

              {/* The 5 Cells For This Block */}
              {weekDays.map(day => {
                const ds = format(day, "yyyy-MM-dd");
                const schedule = schedules[ds] || { blocks: {} };
                const scheduledBlock = schedule.blocks[block.id];
                
                const assignedDogIds = scheduledBlock?.dogIds || [];
                const blockDogs = assignedDogIds.map(id => dogs.find(d => d.id === id)).filter(Boolean) as Dog[];
                
                const blockBookings = bookings.filter(b => b.date === ds && b.blockId === block.id);
                const pendingBookings = blockBookings.filter(b => b.status === "pending");
                
                const spotsTaken = assignedDogIds.length;
                const isFull = spotsTaken >= MAX_DOGS_PER_BLOCK;
                const ratio = spotsTaken / MAX_DOGS_PER_BLOCK;
                
                const isDisabled = scheduledBlock?.status === "Done" || scheduledBlock?.status === "In Progress";
                
                const blockColorMap: Record<string, string> = {
                  'morning': 'bg-orange-50/80 hover:bg-orange-100/80 border-orange-300 hover:border-orange-500 hover:shadow-[0_8px_30px_rgba(249,115,22,0.15)]',
                  'midday': 'bg-cyan-50/80 hover:bg-cyan-100/80 border-cyan-300 hover:border-cyan-500 hover:shadow-[0_8px_30px_rgba(6,182,212,0.15)]',
                  'afternoon': 'bg-violet-50/80 hover:bg-violet-100/80 border-violet-300 hover:border-violet-500 hover:shadow-[0_8px_30px_rgba(139,92,246,0.15)]',
                };
                const colorConfig = blockColorMap[block.id] || 'bg-white border-border hover:border-primary';
                
                return (
                  <button
                    disabled={isFull || isDisabled}
                    onClick={() => {
                        setSelectedSlot({ date: ds, blockId: block.id });
                        setIsDrawerOpen(true);
                    }}
                    key={`${ds}-${block.id}`}
                    className={`group relative flex flex-col border-2 rounded-[28px] p-6 text-left transition-all duration-300 min-h-[160px]
                      ${isDisabled ? 'opacity-50 grayscale bg-zinc-100 border-zinc-300 cursor-not-allowed' : 
                        isFull ? 'bg-red-50/50 border-red-300 cursor-not-allowed' : 
                        `${colorConfig} hover:-translate-y-1 cursor-pointer`
                      }`}
                  >
                    {/* Top Decorative Line */}
                    <div className={`absolute top-0 left-8 right-8 h-[4px] rounded-b-xl transition-colors ${isFull ? 'bg-red-400' : 'bg-transparent group-hover:bg-zinc-900/10'}`} />

                    <div className="flex justify-between items-center w-full mb-8">
                      {/* Condensed Capacity Bar */}
                      <div className="flex flex-col gap-2 w-full">
                         <div className="flex justify-between items-end w-full">
                            <span className="text-xs font-extrabold text-zinc-400 uppercase tracking-widest">Capacity</span>
                            <span className={`text-xs font-black ${isFull ? 'text-red-500' : 'text-zinc-600'}`}>{spotsTaken} / {MAX_DOGS_PER_BLOCK}</span>
                         </div>
                         <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-1000 ${isFull ? 'bg-destructive' : spotsTaken > 0 ? 'bg-primary' : 'bg-zinc-200'}`}
                              style={{ width: `${Math.max(ratio * 100, 5)}%` }}
                            />
                         </div>
                      </div>
                    </div>

                    {/* Dog Avatars */}
                    <div className="flex-1 flex flex-col justify-end w-full">
                       {(pendingBookings.length > 0 || blockDogs.length > 0) ? (
                         <div className="flex -space-x-3 items-center">
                           {blockDogs.map((dog, i) => dog && (
                             <div key={dog.id} className={`w-10 h-10 rounded-full border-[3px] border-white flex items-center justify-center text-white text-[12px] font-bold shadow-md z-[${10-i}] ${dog.avatarColor}`} title={`${dog.name} (Confirmed)`}>
                               {dog.name.charAt(0)}
                             </div>
                           ))}
                           {pendingBookings.map((booking, i) => {
                              const dog = dogs.find(d => d.id === booking.dogId);
                              if (!dog) return null;
                              return (
                                <div key={booking.id} className={`w-10 h-10 rounded-full border-[3px] border-amber-300 flex items-center justify-center text-white text-[12px] font-bold shadow-md opacity-80 backdrop-blur-sm z-[${10-(blockDogs.length+i)}] ${dog.avatarColor}`} title={`${dog.name} (Pending)`}>
                                  {dog.name.charAt(0)}
                                </div>
                              )
                           })}
                         </div>
                       ) : (
                         <span className="text-sm font-bold text-zinc-400 group-hover:text-primary transition-colors">Completely Open</span>
                       )}
                    </div>
                  </button>
                )
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Selection Drawer */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="max-h-[85vh] bg-white rounded-t-[32px]">
          <div className="max-w-md w-full mx-auto pb-4">
            <DrawerHeader className="pt-8 pb-6 px-6 relative">
              <div className="w-12 h-1.5 bg-zinc-200 rounded-full absolute top-3 left-1/2 -translate-x-1/2" />
              <DrawerTitle className="text-3xl font-serif font-bold tracking-tight text-primary mb-2">Book Walk</DrawerTitle>
              <DrawerDescription className="text-base text-zinc-500 font-medium">
                Request spot for <span className="font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-lg mx-1">{selectedSlot ? timeBlocks.find(b => b.id === selectedSlot.blockId)?.label : ''}</span> on <span className="font-bold text-foreground">{selectedSlot ? format(parseISO(selectedSlot.date), "EEEE") : ''}</span>. We'll let Mike know.
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-6 py-2 flex flex-col gap-3 overflow-y-auto max-h-[50vh] custom-scrollbar">
              {dogs.map(dog => {
                 if (!selectedSlot) return null;
                 const scheduleForSlot = schedules[selectedSlot.date] || { blocks: {} };
                 const isAlreadyAdded = scheduleForSlot.blocks[selectedSlot.blockId]?.dogIds.includes(dog.id);
                 
                 const dailyBookingsForSlot = bookings.filter(b => b.date === selectedSlot.date);
                 const isAlreadyPending = dailyBookingsForSlot.some(b => b.blockId === selectedSlot.blockId && b.dogId === dog.id && b.status === "pending");
                 
                 return (
                   <button 
                     key={dog.id} 
                     disabled={isAlreadyAdded || isAlreadyPending}
                     onClick={() => handleDogSelect(dog.id)}
                     className={`group relative flex items-center space-x-4 p-4 rounded-[24px] border-2 transition-all select-none text-left w-full overflow-hidden
                        ${isAlreadyAdded || isAlreadyPending ? 'border-zinc-100 bg-zinc-50 opacity-60 cursor-not-allowed' : 'border-zinc-200 hover:border-primary cursor-pointer active:scale-[0.98] shadow-sm hover:shadow-md bg-white'}`}
                   >
                     {!(isAlreadyAdded || isAlreadyPending) && (
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                     )}
                     
                     <div className="flex items-center gap-4 flex-1">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-extrabold text-xl shadow-md border-2 border-white/50 ${dog.avatarColor}`}>
                          {dog.name.charAt(0)}
                        </div>
                        <div className="flex flex-col flex-1">
                          <div className="flex items-center justify-between w-full">
                            <span className="font-black text-lg text-zinc-900">{dog.name}</span>
                            {isAlreadyAdded && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
                            {isAlreadyPending && <CalendarClock className="w-4 h-4 text-amber-500 shrink-0" />}
                          </div>
                          <span className="text-[13px] text-zinc-500 font-semibold mt-0.5">
                            {isAlreadyAdded ? "Already scheduled for this block" : isAlreadyPending ? "Awaiting confirmation from Mike" : `${dog.owner}'s dog`}
                          </span>
                        </div>
                     </div>
                   </button>
                 )
              })}
            </div>
            <DrawerFooter className="px-6 pt-6 pb-8">
              <DrawerClose asChild>
                <Button variant="ghost" className="h-14 font-bold text-zinc-500 rounded-2xl hover:bg-zinc-100 text-lg">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 0px;
          height: 0px;
          background: transparent;
        }
      `}} />
    </div>
  );
}
