// src/redux/slices/eventSlice.js
import { createSlice } from '@reduxjs/toolkit';

// Sample Events Data (hardcoded)
const sampleEvents = [
  {
    id: 'evt001',
    title: 'Tech Conference 2024',
    description: 'Annual technology conference featuring industry leaders',
    date: '2024-03-15',
    time: '09:00 AM',
    venue: 'Convention Center, Karachi',
    category: 'Technology',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    totalTickets: 500,
    bookedTickets: 0,
    price: 0,
    organizer: 'Tech Hub',
  },
  {
    id: 'evt002',
    title: 'Startup Summit',
    description: 'Connect with entrepreneurs and investors',
    date: '2024-03-20',
    time: '10:00 AM',
    venue: 'Business Center, Lahore',
    category: 'Business',
    image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800',
    totalTickets: 300,
    bookedTickets: 0,
    price: 0,
    organizer: 'Startup Inc',
  },
  {
    id: 'evt003',
    title: 'AI & ML Workshop',
    description: 'Hands-on workshop on Artificial Intelligence',
    date: '2024-03-25',
    time: '02:00 PM',
    venue: 'University Auditorium, Islamabad',
    category: 'Education',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800',
    totalTickets: 150,
    bookedTickets: 0,
    price: 0,
    organizer: 'AI Academy',
  },
  {
    id: 'evt004',
    title: 'Digital Marketing Seminar',
    description: 'Learn latest digital marketing strategies',
    date: '2024-04-01',
    time: '11:00 AM',
    venue: 'Hotel Grand, Karachi',
    category: 'Marketing',
    image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800',
    totalTickets: 200,
    bookedTickets: 0,
    price: 0,
    organizer: 'Digital Pro',
  },
  {
    id: 'evt005',
    title: 'Hackathon 2024',
    description: '24-hour coding competition with prizes',
    date: '2024-04-10',
    time: '08:00 AM',
    venue: 'Tech Park, Lahore',
    category: 'Technology',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
    totalTickets: 100,
    bookedTickets: 0,
    price: 0,
    organizer: 'Code Masters',
  },
];

const eventSlice = createSlice({
  name: 'events',
  initialState: {
    events: sampleEvents,
    selectedEvent: null,
    searchQuery: '',
    categoryFilter: 'All',
    loading: false,
    error: null,
  },
  reducers: {
    // Select an event
    selectEvent: (state, action) => {
      state.selectedEvent = state.events.find(
        (event) => event.id === action.payload
      );
    },
    
    // Clear selected event
    clearSelectedEvent: (state) => {
      state.selectedEvent = null;
    },
    
    // Update booked tickets count
    updateBookedTickets: (state, action) => {
      const { eventId, count } = action.payload;
      const event = state.events.find((e) => e.id === eventId);
      if (event) {
        event.bookedTickets += count;
      }
      if (state.selectedEvent?.id === eventId) {
        state.selectedEvent.bookedTickets += count;
      }
    },
    
    // Set search query
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    
    // Set category filter
    setCategoryFilter: (state, action) => {
      state.categoryFilter = action.payload;
    },
    
    // Add new event (for organizers)
    addEvent: (state, action) => {
      state.events.push({
        ...action.payload,
        id: `evt${Date.now()}`,
        bookedTickets: 0,
      });
    },
  },
});

export const {
  selectEvent,
  clearSelectedEvent,
  updateBookedTickets,
  setSearchQuery,
  setCategoryFilter,
  addEvent,
} = eventSlice.actions;

export default eventSlice.reducer;

// Selectors
export const selectFilteredEvents = (state) => {
  const { events, searchQuery, categoryFilter } = state.events;
  
  return events.filter((event) => {
    const matchesSearch = event.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === 'All' || event.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });
};

export const selectAvailableEvents = (state) => {
  return state.events.events.filter(
    (event) => event.bookedTickets < event.totalTickets
  );
};