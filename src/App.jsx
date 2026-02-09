import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { store } from './redux/store/store';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebase/firebaseconfig/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { setUser } from './redux/reducers/authSlice';

// Components
import Navbar from './components/Navbar';
import ProtectedRoutes from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import CreateEvent from './pages/CreateEvent';
import EventDetails from './pages/EventDetails';
import MyTickets from './pages/MyTickets';
import Attendees from './pages/Attendees';
import Profile from './pages/Profile';
import ValidateTicket from './pages/ValidateTicket';
import NotFound from './pages/NotFound';

// Auth Persistence Component
function AuthProvider({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            dispatch(
              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName || data.name,
                role: data.role,
              })
            );
          } else {
            dispatch(setUser(null));
          }
        } catch (err) {
          console.error(err);
          dispatch(setUser(null));
        }
      } else {
        dispatch(setUser(null));
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  return children;
}

const App = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AuthProvider>
          {/* ✅ Navbar always visible */}
          <Navbar />

          <Routes>
            {/* PUBLIC */}
            <Route index element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />

            {/* ATTENDEE */}
            <Route
              path="/home"
              element={<ProtectedRoutes role={['attendee']} component={<Home />} />}
            />
            <Route
              path="/events/:id"
              element={<ProtectedRoutes role={['attendee']} component={<EventDetails />} />}
            />
            <Route
              path="/my-tickets"
              element={<ProtectedRoutes role={['attendee']} component={<MyTickets />} />}
            />
            <Route
              path="/profile"
              element={<ProtectedRoutes role={['attendee']} component={<Profile />} />}
            />

            {/* ORGANIZER */}
            <Route
              path="/dashboard"
              element={<ProtectedRoutes role={['organizer']} component={<Dashboard />} />}
            />
            <Route
              path="/create-event"
              element={<ProtectedRoutes role={['organizer']} component={<CreateEvent />} />}
            />
            <Route
              path="/attendees/:eventId"
              element={<ProtectedRoutes role={['organizer']} component={<Attendees />} />}
            />
            <Route
              path="/validate-ticket"
              element={<ProtectedRoutes role={['organizer']} component={<ValidateTicket />} />}
            />

            {/* FALLBACK */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </Provider>
  );
};

export default App;
