import { create } from 'zustand';
import { db } from '@/lib/firebase';
import { collection, doc, onSnapshot, setDoc, updateDoc, addDoc, getDoc } from 'firebase/firestore';

export type Dog = {
  id: string;
  name: string;
  owner: string;
  avatarColor: string;
};

export type BlockStatus = 'Not Started' | 'In Progress' | 'Done';

export type TimeBlock = {
  id: string;
  label: string;
  timeRange: string;
};

export type ScheduledBlock = {
  blockId: string;
  status: BlockStatus;
  dogIds: string[];
};

export type BookingStatus = 'pending' | 'confirmed' | 'rejected';

export type BookingRequest = {
  id: string;
  date: string;
  blockId: string;
  dogId: string;
  status: BookingStatus;
};

export const MAX_DOGS_PER_BLOCK = 6;

export type DailySchedule = {
  date: string; // YYYY-MM-DD
  blocks: Record<string, ScheduledBlock>; // keyed by blockId
};

interface ScheduleState {
  dogs: Dog[];
  timeBlocks: TimeBlock[];
  schedules: Record<string, DailySchedule>;
  bookings: BookingRequest[];
  isInitialized: boolean;
  initializeListeners: () => void;
  assignDogToBlock: (date: string, blockId: string, dogId: string) => Promise<void>;
  removeDogFromBlock: (date: string, blockId: string, dogId: string) => Promise<void>;
  updateBlockStatus: (date: string, blockId: string, status: BlockStatus) => Promise<void>;
  requestBooking: (date: string, blockId: string, dogId: string) => Promise<void>;
  updateBookingStatus: (id: string, booking: BookingRequest, status: BookingStatus) => Promise<void>;
}

const initialDogs: Dog[] = [
  { id: '1', name: 'Pablo', owner: 'Sarah', avatarColor: 'bg-blue-500' },
  { id: '2', name: 'Buster', owner: 'John', avatarColor: 'bg-rose-500' },
  { id: '3', name: 'Bella', owner: 'Emily', avatarColor: 'bg-emerald-500' },
  { id: '4', name: 'Max', owner: 'Mike', avatarColor: 'bg-amber-500' },
  { id: '5', name: 'Luna', owner: 'Jessica', avatarColor: 'bg-purple-500' },
];

const initialBlocks: TimeBlock[] = [
  { id: 'morning', label: 'Morning Walk', timeRange: '8:00 AM - 10:30 AM' },
  { id: 'midday', label: 'Mid-day Pack', timeRange: '11:30 AM - 2:00 PM' },
  { id: 'afternoon', label: 'Afternoon Stroll', timeRange: '3:00 PM - 5:30 PM' },
];

// Helper to ensure a schedule doc exists before updating
const ensureScheduleDoc = async (date: string) => {
  const docRef = doc(db, 'schedules', date);
  const snap = await getDoc(docRef);
  if (!snap.exists()) {
    const emptyBlocks = initialBlocks.reduce((acc, b) => {
      acc[b.id] = { blockId: b.id, status: 'Not Started', dogIds: [] };
      return acc;
    }, {} as Record<string, ScheduledBlock>);
    await setDoc(docRef, { date, blocks: emptyBlocks });
    return { date, blocks: emptyBlocks };
  }
  return snap.data() as DailySchedule;
};

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  dogs: initialDogs,
  timeBlocks: initialBlocks,
  schedules: {},
  bookings: [],
  isInitialized: false,

  initializeListeners: () => {
    if (get().isInitialized) return;
    
    // Listen to Schedules
    const unsubscribeSchedules = onSnapshot(collection(db, 'schedules'), (snapshot) => {
      const liveSchedules: Record<string, DailySchedule> = {};
      snapshot.docs.forEach(doc => {
        liveSchedules[doc.id] = doc.data() as DailySchedule;
      });
      set({ schedules: liveSchedules });
    });

    // Listen to Bookings
    const unsubscribeBookings = onSnapshot(collection(db, 'bookings'), (snapshot) => {
      const liveBookings: BookingRequest[] = [];
      snapshot.docs.forEach(doc => {
        liveBookings.push({ id: doc.id, ...doc.data() } as BookingRequest);
      });
      set({ bookings: liveBookings });
    });

    set({ isInitialized: true });
  },

  requestBooking: async (date, blockId, dogId) => {
    await addDoc(collection(db, 'bookings'), {
      date,
      blockId,
      dogId,
      status: 'pending'
    });
    
    // Stealth Ping Twilio Webhook (Fire and forget so UI doesn't block)
    const store = get();
    const dog = store.dogs.find(d => d.id === dogId);
    const blockLabel = store.timeBlocks.find(b => b.id === blockId)?.label;
    if (dog) {
      fetch('/api/notify-mike', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dogName: dog.name, ownerName: dog.owner, blockLabel, date })
      }).catch(err => console.error("Webhook failed:", err));
    }
  },

  updateBookingStatus: async (id, booking, status) => {
    // 1. Update the booking status
    await updateDoc(doc(db, 'bookings', id), { status });

    // 2. If approved, also add the dog to the schedule.
    if (status === 'confirmed') {
      const { date, blockId, dogId } = booking;
      const scheduleData = await ensureScheduleDoc(date);
      const block = scheduleData.blocks[blockId] || { blockId, status: 'Not Started', dogIds: [] };
      
      if (!block.dogIds.includes(dogId)) {
        block.dogIds.push(dogId);
        await updateDoc(doc(db, 'schedules', date), {
          [`blocks.${blockId}`]: block
        });
      }
      
      // Stealth Ping Twilio Webhook for Customer (Fire and forget)
      const store = get();
      const dog = store.dogs.find(d => d.id === dogId);
      const blockLabel = store.timeBlocks.find(b => b.id === blockId)?.label;
      if (dog) {
        fetch('/api/notify-customer', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ dogName: dog.name, blockLabel, date })
        }).catch(err => console.error("Webhook failed:", err));
      }
    }
  },

  assignDogToBlock: async (date, blockId, dogId) => {
    const scheduleData = await ensureScheduleDoc(date);
    const block = scheduleData.blocks[blockId] || { blockId, status: 'Not Started', dogIds: [] };
    
    if (!block.dogIds.includes(dogId)) {
      block.dogIds.push(dogId);
      await updateDoc(doc(db, 'schedules', date), {
        [`blocks.${blockId}`]: block
      });
    }
  },

  removeDogFromBlock: async (date, blockId, dogId) => {
    const scheduleData = await ensureScheduleDoc(date);
    const block = scheduleData.blocks[blockId];
    if (block) {
      block.dogIds = block.dogIds.filter(id => id !== dogId);
      await updateDoc(doc(db, 'schedules', date), {
        [`blocks.${blockId}`]: block
      });
    }
  },

  updateBlockStatus: async (date, blockId, status) => {
    const scheduleData = await ensureScheduleDoc(date);
    const block = scheduleData.blocks[blockId] || { blockId, status: 'Not Started', dogIds: [] };
    block.status = status;
    await updateDoc(doc(db, 'schedules', date), {
      [`blocks.${blockId}`]: block
    });
  },

}));
