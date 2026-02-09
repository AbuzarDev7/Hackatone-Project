// src/redux/slices/ticketSlice.js
import { createSlice } from '@reduxjs/toolkit';

const ticketSlice = createSlice({
  name: 'tickets',
  initialState: {
    userTickets: [],
    allBookings: [], // For organizer
    loading: false,
    error: null,
  },
  reducers: {
    // Book a ticket
    bookTicket: (state, action) => {
      const { eventId, eventTitle, eventDate, eventVenue, userId, userName } = action.payload;
      
      // Check if user already has a ticket for this event
      const existingTicket = state.userTickets.find(
        (ticket) => ticket.eventId === eventId && ticket.userId === userId
      );
      
      if (existingTicket) {
        state.error = 'You already have a ticket for this event';
        return;
      }
      
      // Generate unique ticket
      const ticket = {
        ticketId: `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        eventId,
        eventTitle,
        eventDate,
        eventVenue,
        userId,
        userName,
        bookedAt: new Date().toISOString(),
        status: 'valid', // valid, used, cancelled
        qrCode: `${eventId}-${userId}-${Date.now()}`, // QR code data
      };
      
      state.userTickets.push(ticket);
      state.allBookings.push(ticket);
      state.error = null;
      
      // Save to localStorage
      localStorage.setItem('userTickets', JSON.stringify(state.userTickets));
    },
    
    // Load tickets from localStorage
    loadTickets: (state, action) => {
      const userId = action.payload;
      const savedTickets = localStorage.getItem('userTickets');
      
      if (savedTickets) {
        const allTickets = JSON.parse(savedTickets);
        state.userTickets = allTickets.filter((ticket) => ticket.userId === userId);
      }
    },
    
    // Load all bookings (for organizer)
    loadAllBookings: (state) => {
      const savedTickets = localStorage.getItem('userTickets');
      if (savedTickets) {
        state.allBookings = JSON.parse(savedTickets);
      }
    },
    
    // Validate ticket
    validateTicket: (state, action) => {
      const ticketId = action.payload;
      const ticket = state.allBookings.find((t) => t.ticketId === ticketId);
      
      if (ticket) {
        if (ticket.status === 'used') {
          state.error = 'Ticket already used';
        } else if (ticket.status === 'cancelled') {
          state.error = 'Ticket has been cancelled';
        } else {
          ticket.status = 'used';
          state.error = null;
          
          // Update localStorage
          localStorage.setItem('userTickets', JSON.stringify(state.allBookings));
        }
      } else {
        state.error = 'Invalid ticket';
      }
    },
    
    // Cancel ticket
    cancelTicket: (state, action) => {
      const ticketId = action.payload;
      const ticket = state.userTickets.find((t) => t.ticketId === ticketId);
      
      if (ticket) {
        ticket.status = 'cancelled';
        
        // Update in allBookings too
        const allTicket = state.allBookings.find((t) => t.ticketId === ticketId);
        if (allTicket) {
          allTicket.status = 'cancelled';
        }
        
        // Update localStorage
        localStorage.setItem('userTickets', JSON.stringify(state.allBookings));
      }
    },
    
    // Get tickets for specific event (organizer)
    getEventTickets: (state, action) => {
      const eventId = action.payload;
      return state.allBookings.filter((ticket) => ticket.eventId === eventId);
    },
    
    // Clear error
    clearTicketError: (state) => {
      state.error = null;
    },
  },
});

export const {
  bookTicket,
  loadTickets,
  loadAllBookings,
  validateTicket,
  cancelTicket,
  getEventTickets,
  clearTicketError,
} = ticketSlice.actions;

export default ticketSlice.reducer;

// Selectors
export const selectUserTickets = (state) => state.tickets.userTickets;

export const selectEventTickets = (eventId) => (state) => {
  return state.tickets.allBookings.filter(
    (ticket) => ticket.eventId === eventId && ticket.status !== 'cancelled'
  );
};

export const selectTicketCount = (eventId) => (state) => {
  return state.tickets.allBookings.filter(
    (ticket) => ticket.eventId === eventId && ticket.status !== 'cancelled'
  ).length;
};

export const selectValidTickets = (state) => {
  return state.tickets.userTickets.filter(
    (ticket) => ticket.status === 'valid'
  );
};