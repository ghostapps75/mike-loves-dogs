"use client";
import { format, startOfWeek, addDays } from "date-fns";
import { useScheduleStore, BlockStatus, Dog, MAX_DOGS_PER_BLOCK } from "@/store/useScheduleStore";
import { Card, CardContent } from "@/components/ui/card";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useState } from "react";
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, CircleDashed, Orbit, AlertCircle, X, Check, LogOut, Info, Users, Trash2, BookUser } from 'lucide-react';
import { useAuth } from "@/context/AuthContext";

export default function AdminView() {
  const [mounted, setMounted] = useState(false);
  const { signOut } = useAuth();
  const { schedules, timeBlocks, dogs, bookings, updateBookingStatus, assignDogToBlock, removeDogFromBlock, updateBlockStatus, deleteDog } = useScheduleStore();
  
  const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 5 }).map((_, i) => addDays(monday, i));
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isAddDogOpen, setIsAddDogOpen] = useState(false);
  const [newDogName, setNewDogName] = useState("");
  const [newDogOwner, setNewDogOwner] = useState("");
  const [newDogPhone, setNewDogPhone] = useState("");

  const handleAddNewDog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDogName || !newDogOwner) return;
    const colors = ['bg-blue-500', 'bg-rose-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-cyan-500', 'bg-fuchsia-500', 'bg-indigo-500'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    await useScheduleStore.getState().addDog({
      name: newDogName,
      owner: newDogOwner,
      phone: newDogPhone,
      avatarColor: color
    });
    
    setNewDogName("");
    setNewDogOwner("");
    setNewDogPhone("");
    setIsAddDogOpen(false);
  };

  const handleImportContact = async () => {
    if (!('contacts' in navigator && 'ContactsManager' in window)) {
      alert("Device not supported. The Native Contacts API is typically only available on mobile iOS/Android PWAs.");
      return;
    }
    try {
      const props = ['name', 'tel'];
      const opts = { multiple: false };
      // @ts-ignore
      const contacts = await navigator.contacts.select(props, opts);
      if (contacts && contacts.length > 0) {
        const contact = contacts[0];
        if (contact.name && contact.name.length > 0) {
          setNewDogOwner(contact.name[0]);
        }
        if (contact.tel && contact.tel.length > 0) {
          let phone = contact.tel[0];
          setNewDogPhone(phone);
        }
      }
    } catch (ex) {
      console.error(ex);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return <div className="min-h-screen bg-muted/20"></div>;

  const pendingBookings = bookings.filter(b => b.status === 'pending');

  const handleDogToggle = async (dogId: string, isAssigned: boolean) => {
    if (!selectedBlock || !selectedDate) return;
    if (isAssigned) {
      const confirmCancel = window.confirm("Are you sure you want to cancel this dog's walk? Doing so will instantly text the owner.");
      if (confirmCancel) {
        await removeDogFromBlock(selectedDate, selectedBlock, dogId);
        
        // Stealth Ping Twilio Cancellation
        const dog = dogs.find(d => d.id === dogId);
        const blockLabel = timeBlocks.find(b => b.id === selectedBlock)?.label;
        if (dog) {
          fetch('/api/notify-cancellation', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ dogName: dog.name, blockLabel, date: selectedDate, customerPhone: dog.phone })
          }).catch(err => console.error("Webhook failed:", err));
        }
      }
    } else {
      assignDogToBlock(selectedDate, selectedBlock, dogId);
    }
  };

  const handleStatusCycle = (e: React.MouseEvent, date: string, blockId: string, currentStatus: BlockStatus) => {
    e.stopPropagation(); // Prevent opening drawer
    const cycle: Record<BlockStatus, BlockStatus> = {
      "Not Started": "In Progress",
      "In Progress": "Done",
      "Done": "Not Started"
    };
    updateBlockStatus(date, blockId, cycle[currentStatus] || "Not Started");
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FBFBFC] w-full">
      <header className="flex flex-col gap-4 py-4 px-4 sm:px-8 bg-white shadow-sm z-10 sticky top-0 relative">
        <div className="flex items-center justify-between w-full max-w-[1600px] mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-muted active:scale-95 text-muted-foreground transition-colors">
              <ArrowLeft className="w-5 h-5"/>
            </Link>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-zinc-900">Admin Editor</h1>
              <p className="text-sm font-semibold text-zinc-500 tracking-wide uppercase mt-1">Week of {format(monday, 'MMMM do, yyyy')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="default" size="sm" onClick={() => setIsAddDogOpen(true)} className="gap-2 bg-indigo-600 hover:bg-indigo-700 font-bold rounded-full">
               <Users className="w-4 h-4" /> Manage Customers
            </Button>
            <Button variant="ghost" size="icon" onClick={signOut} title="Sign Out" className="hover:bg-red-50 hover:text-red-600 transition-colors">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Pending Approval Section */}
      {pendingBookings.length > 0 && (
        <div className="px-4 sm:px-8 py-6 bg-red-50/50 border-b border-red-100">
           <div className="max-w-[1600px] mx-auto flex flex-col gap-3">
               <h2 className="text-sm font-bold text-red-600 flex items-center gap-2 uppercase tracking-wide">
                  <AlertCircle className="w-4 h-4" /> Action Required ({pendingBookings.length})
               </h2>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                 {pendingBookings.map(booking => {
                    const dog = dogs.find(d => d.id === booking.dogId);
                    const block = timeBlocks.find(b => b.id === booking.blockId);
                    if (!dog || !block) return null;
                    const bookingDateObj = new Date(booking.date + "T00:00:00");
                    return (
                      <Card key={booking.id} className="border border-red-300 shadow-md bg-white overflow-hidden">
                         <div className="p-3 flex items-center justify-between border-b border-red-100 bg-red-50/30">
                           <span className="text-xs font-bold text-red-700/80">{format(bookingDateObj, 'EEEE, MMM do')}</span>
                           <span className="text-xs font-semibold text-muted-foreground">{block.label}</span>
                         </div>
                         <CardContent className="p-4 flex flex-col gap-4">
                            <div className="flex items-center gap-4">
                               <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-sm border border-white/20 ${dog.avatarColor}`}>
                                 {dog.name.charAt(0)}
                               </div>
                               <div className="flex flex-col">
                                 <span className="font-bold text-lg leading-none mb-1 text-foreground">{dog.name}</span>
                                 <span className="text-sm text-muted-foreground font-medium">{dog.owner} requested a walk</span>
                               </div>
                            </div>
                            <div className="flex gap-2 w-full mt-2">
                              <Button 
                                variant="default" 
                                className="flex-1 bg-emerald-500 hover:bg-emerald-600 font-bold"
                                onClick={() => updateBookingStatus(booking.id, booking, 'confirmed')}
                              >
                                <Check className="w-4 h-4 mr-2" /> Approve
                              </Button>
                              <Button 
                                variant="outline" 
                                className="flex-1 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 font-bold"
                                onClick={() => updateBookingStatus(booking.id, booking, 'rejected')}
                              >
                                <X className="w-4 h-4 mr-2" /> Reject
                              </Button>
                            </div>
                         </CardContent>
                      </Card>
                    )
                 })}
               </div>
           </div>
        </div>
      )}

      <main className="flex-1 overflow-x-auto px-4 sm:px-8 py-8 w-full max-w-[1600px] mx-auto hide-scrollbar">
        <div className="grid grid-cols-[max-content_repeat(5,minmax(200px,1fr))] gap-4 sm:gap-6 pb-8 min-w-[1000px]">
          {/* Header Row */}
          <div className="pt-2"></div>
          {weekDays.map(day => {
             const ds = format(day, "yyyy-MM-dd");
             const isToday = ds === format(new Date(), "yyyy-MM-dd");
             return (
              <div key={ds} className="flex flex-col mb-4">
                <span className={`text-sm font-bold uppercase tracking-wider mb-1 ${isToday ? 'text-indigo-600' : 'text-zinc-500'}`}>
                  {format(day, 'EEEE')}
                </span>
                <span className="text-3xl font-black tracking-tight text-zinc-900">
                  {format(day, 'MMM do')}
                </span>
                {isToday && <div className="h-1 w-8 bg-indigo-600 rounded-full mt-2" />}
              </div>
             )
          })}

          {/* Time Block Rows */}
          {timeBlocks.map((block) => (
            <div className="contents group" key={block.id}>
              {/* Row Label (Y-axis) */}
              <div className="flex flex-col justify-center pr-6 sticky left-0 bg-[#FBFBFC] z-0">
                 <h3 className="font-bold text-lg text-zinc-900 whitespace-nowrap">{block.label}</h3>
                 <p className="text-sm font-medium text-zinc-500 whitespace-nowrap">{block.timeRange}</p>
                 <span className="text-xs font-semibold text-zinc-400 mt-1 whitespace-nowrap flex items-center gap-1">
                   <Info className="w-3 h-3" /> Max {MAX_DOGS_PER_BLOCK} dogs
                 </span>
              </div>

              {/* Matrix Cells */}
              {weekDays.map(day => {
                const ds = format(day, "yyyy-MM-dd");
                const schedule = schedules[ds] || { blocks: {} };
                const scheduledBlock = schedule.blocks[block.id] || { status: 'Not Started', dogIds: [] };
                const dogsInBlock = scheduledBlock.dogIds.map(id => dogs.find(d => d.id === id)).filter(Boolean) as Dog[];
                const isFull = dogsInBlock.length >= MAX_DOGS_PER_BLOCK;
                
                const blockColorMap: Record<string, string> = {
                  'morning': 'bg-orange-50/80 hover:bg-orange-100/80 border-orange-300',
                  'midday': 'bg-cyan-50/80 hover:bg-cyan-100/80 border-cyan-300',
                  'afternoon': 'bg-violet-50/80 hover:bg-violet-100/80 border-violet-300',
                };
                const colorConfig = blockColorMap[block.id] || 'bg-white border-zinc-300';
                
                // Status Toggle specifics
                let StatusIcon = CircleDashed;
                let statusColor = "text-zinc-500";
                let statusBg = "bg-white/80 hover:bg-zinc-100/80 border-zinc-300";
                
                if (scheduledBlock.status === "In Progress") {
                  StatusIcon = Orbit;
                  statusColor = "text-amber-600";
                  statusBg = "bg-amber-100/90 hover:bg-amber-200/90 border-amber-300";
                } else if (scheduledBlock.status === "Done") {
                  StatusIcon = CheckCircle2;
                  statusColor = "text-emerald-600";
                  statusBg = "bg-emerald-100/90 hover:bg-emerald-200/90 border-emerald-300 opacity-90";
                }

                return (
                  <div
                    onClick={() => {
                        setSelectedDate(ds);
                        setSelectedBlock(block.id);
                        setIsDrawerOpen(true);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setSelectedDate(ds);
                          setSelectedBlock(block.id);
                          setIsDrawerOpen(true);
                        }
                    }}
                    key={`${ds}-${block.id}`}
                    className={`relative flex flex-col border-2 rounded-[28px] p-6 text-left transition-all duration-300 min-h-[160px] cursor-pointer
                      ${isFull && scheduledBlock.status === "Not Started" ? 'bg-red-50/50 border-red-300' : colorConfig} 
                      ${scheduledBlock.status === "Done" ? 'opacity-70 grayscale-0 bg-zinc-100 border-zinc-300' : 'hover:-translate-y-1 hover:shadow-xl' }
                    `}
                  >
                    {/* Top Decorative Line */}
                    <div className={`absolute top-0 left-8 right-8 h-[4px] rounded-b-xl transition-colors ${isFull ? 'bg-red-400' : 'bg-transparent group-hover:bg-zinc-900/10'}`} />

                    <div className="flex flex-col items-start gap-4 w-full mb-6">
                       {/* Condensed Capacity Bar */}
                       <div className="flex gap-1">
                          {Array.from({ length: MAX_DOGS_PER_BLOCK }).map((_, idx) => (
                            <div 
                              key={idx} 
                              className={`h-2 w-4 sm:w-6 transition-colors rounded-full ${idx < dogsInBlock.length ? (isFull ? 'bg-red-500' : 'bg-zinc-800') : 'bg-black/10'}`}
                            />
                          ))}
                       </div>
                       
                       <button 
                         className={`flex items-center h-6 px-2.5 gap-1.5 rounded-md font-bold transition-all border shadow-sm ${statusBg} text-zinc-700 active:scale-95 relative z-10`}
                         onClick={(e) => handleStatusCycle(e, ds, block.id, scheduledBlock.status)}
                       >
                         <StatusIcon className={`w-3.5 h-3.5 ${statusColor} ${scheduledBlock.status === "In Progress" ? "animate-spin-slow" : ""}`} />
                         <span className="text-[11px] uppercase tracking-wider">{scheduledBlock.status}</span>
                       </button>
                    </div>

                    <div className="flex-1 w-full">
                       {dogsInBlock.length > 0 ? (
                         <div className="flex flex-wrap gap-2 mt-auto pt-2">
                           {dogsInBlock.map(dog => (
                              <div key={dog.id} className="relative group/tooltip">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow outline outline-2 outline-white ${dog.avatarColor}`}>
                                  {dog.name.charAt(0)}
                                </div>
                              </div>
                           ))}
                         </div>
                       ) : (
                         <div className="h-full w-full flex items-center mb-4">
                           <span className="text-sm font-semibold text-zinc-400 italic">Tap to assign dogs</span>
                         </div>
                       )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-black/5 w-full flex items-center justify-between">
                       <span className="text-sm font-bold text-zinc-600">
                         {dogsInBlock.length} / {MAX_DOGS_PER_BLOCK} Dogs
                       </span>
                       <span className="text-xs font-semibold text-zinc-500 underline decoration-zinc-300">
                         Manage
                       </span>
                    </div>

                    </div>
                );
              })}
            </div>
          ))}
        </div>
      </main>

      {/* Editor Drawer */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="max-h-[90vh]">
          <div className="max-w-md w-full mx-auto">
            <DrawerHeader className="pt-6">
              <DrawerTitle className="text-2xl font-bold">Assign Dogs</DrawerTitle>
              <DrawerDescription className="text-base font-medium">
                {selectedDate && selectedBlock && (
                   <>
                     {format(new Date(selectedDate+"T00:00:00"), 'EEEE, MMM do')} • {timeBlocks.find(b => b.id === selectedBlock)?.label}
                   </>
                )}
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4 py-2 flex flex-col gap-3 overflow-y-auto max-h-[55vh]">
              {dogs.map(dog => {
                 const blockData = (selectedDate && selectedBlock) ? (schedules[selectedDate]?.blocks[selectedBlock] || { dogIds: [] as string[] }) : { dogIds: [] as string[] };
                 const isAssigned = blockData.dogIds.includes(dog.id);
                 return (
                   <label 
                     key={dog.id} 
                     className={`flex items-center space-x-3 p-4 rounded-2xl border-2 transition-all cursor-pointer select-none active:scale-[0.98] ${isAssigned ? 'border-indigo-500 bg-indigo-50/50' : 'border-zinc-200 hover:bg-zinc-50'}`}
                   >
                     <Checkbox 
                       checked={isAssigned} 
                       onCheckedChange={() => handleDogToggle(dog.id, isAssigned)} 
                       className="w-6 h-6 rounded-md data-[state=checked]:bg-indigo-500 pointer-events-none"
                     />
                     <div className="flex items-center gap-4 flex-1 ml-2">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-sm border border-white/20 ${dog.avatarColor}`}>
                          {dog.name.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-lg leading-none mb-1 text-foreground">{dog.name}</span>
                          <span className="text-sm text-muted-foreground font-medium">{dog.owner}</span>
                        </div>
                     </div>
                   </label>
                 )
              })}
            </div>
            <DrawerFooter className="pt-6 pb-8">
              <DrawerClose asChild>
                <Button size="lg" className="h-14 text-lg font-bold rounded-xl active:scale-95 shadow-lg">Done</Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Manage Customers Drawer */}
      <Drawer open={isAddDogOpen} onOpenChange={setIsAddDogOpen}>
        <DrawerContent className="max-h-[90vh] bg-zinc-50 rounded-t-[32px]">
          <div className="max-w-md w-full mx-auto pb-4 overflow-y-auto max-h-[85vh] hide-scrollbar">
            <DrawerHeader className="pt-8 pb-4 px-6 relative bg-white border-b border-zinc-100 rounded-t-[32px]">
              <div className="w-12 h-1.5 bg-zinc-200 rounded-full absolute top-3 left-1/2 -translate-x-1/2" />
              <DrawerTitle className="text-2xl font-black tracking-tight text-zinc-900">Manage Customers</DrawerTitle>
              <DrawerDescription className="text-sm font-medium text-zinc-500">
                Add new dogs to the roster or remove inactive ones.
              </DrawerDescription>
            </DrawerHeader>
            
            <div className="p-6">
              <h3 className="text-sm font-bold text-zinc-700 mb-3 uppercase tracking-wider">Current Roster ({dogs.length})</h3>
              <div className="flex flex-col gap-2 mb-8">
                 {dogs.length === 0 && (
                    <div className="p-4 border-2 border-dashed border-zinc-200 rounded-2xl text-center">
                       <span className="text-sm font-bold text-zinc-400">Roster is empty. Add a customer below!</span>
                    </div>
                 )}
                 {dogs.map(dog => (
                    <div key={dog.id} className="flex items-center justify-between p-3 bg-white border border-zinc-200 rounded-2xl shadow-sm">
                       <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm ${dog.avatarColor}`}>
                            {dog.name.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-zinc-900 leading-none mb-1">{dog.name}</span>
                            <span className="text-xs font-semibold text-zinc-500">{dog.owner} {dog.phone ? `• ${dog.phone}` : ''}</span>
                          </div>
                       </div>
                       <Button 
                         variant="ghost" 
                         size="icon"
                         onClick={() => deleteDog(dog.id)}
                         className="text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
                       >
                         <Trash2 className="w-4 h-4" />
                       </Button>
                    </div>
                 ))}
              </div>

              <div className="bg-white p-5 rounded-[24px] border border-zinc-200 shadow-sm">
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-zinc-700 uppercase tracking-wider">Add New Customer</h3>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleImportContact}
                      className="h-8 shadow-sm gap-2 px-3 border-indigo-200 text-xs font-bold text-indigo-700 rounded-lg hover:bg-indigo-50 bg-indigo-50/50"
                    >
                      <BookUser className="w-3.5 h-3.5" /> Import Details
                    </Button>
                 </div>
                 <form onSubmit={handleAddNewDog} className="flex flex-col gap-4">
                   <div className="flex flex-col gap-1.5">
                     <label className="text-sm font-bold text-zinc-700">Dog&apos;s Name</label>
                     <input 
                       type="text" 
                       required
                       value={newDogName}
                       onChange={(e) => setNewDogName(e.target.value)}
                       placeholder="e.g. Buster" 
                       className="flex h-11 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" 
                     />
                   </div>
                   <div className="flex flex-col gap-1.5">
                     <label className="text-sm font-bold text-zinc-700">Owner&apos;s First Name</label>
                     <input 
                       type="text" 
                       required
                       value={newDogOwner}
                       onChange={(e) => setNewDogOwner(e.target.value)}
                       placeholder="e.g. Sarah" 
                       className="flex h-11 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" 
                     />
                   </div>
                   <div className="flex flex-col gap-1.5">
                     <label className="text-sm font-bold text-zinc-700">Owner&apos;s Phone Number</label>
                     <input 
                       type="tel" 
                       required
                       value={newDogPhone}
                       onChange={(e) => setNewDogPhone(e.target.value)}
                       placeholder="+14045551234" 
                       className="flex h-11 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" 
                     />
                   </div>
                   <Button type="submit" className="h-11 mt-2 text-base font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 w-full shadow-md">Add to Roster</Button>
                 </form>
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
