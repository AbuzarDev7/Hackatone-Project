import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider, useDispatch } from "react-redux";
import { store } from "./redux/store/store";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase/firebaseConfig/firebase";
import { doc, getDoc } from "firebase/firestore";
import { setUser } from "./redux/reducers/authSlice";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoutes from "./components/ProtectedRoute";
// Pages
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Home from "./pages/Home";
import Organizer from "./pages/Organizer"; 
import CreateEvent from "./pages/CreateEvent";
import EventDetails from "./pages/EventDetails";
import MyTickets from "./pages/MyTickets";
import NotFound from "./pages/NotFound";
import Ticket from "./pages/Ticket";
import ScanTicket from "./pages/ScanTikcet";

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
              }),
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
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route index element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                {/* ATTENDEE */}
                <Route
                  path="/home"
                  element={
                    <ProtectedRoutes role={["attendee"]} component={<Home />} />
                  }
                />
                <Route
                  path="/events/:id"
                  element={
                    <ProtectedRoutes
                      role={["attendee"]}
                      component={<EventDetails />}
                    />
                  }
                />
                <Route
                  path="/my-tickets"
                  element={
                    <ProtectedRoutes
                      role={["attendee"]}
                      component={<MyTickets />}
                    />
                  }
                />
                <Route
                  path="/ticket/:ticketId"
                  element={
                    <ProtectedRoutes role={["attendee"]} component={<Ticket />} />
                  }
                />
                {/* ORGANIZER */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoutes
                      role={["organizer"]}
                      component={<Organizer />} 
                    />
                  }
                />
                <Route
                  path="/create-event"
                  element={
                    <ProtectedRoutes
                      role={["organizer"]}
                      component={<CreateEvent />}
                    />
                  }
                />
                 <Route
                  path="/scan-qr"
                  element={
                    <ProtectedRoutes
                      role={["organizer"]}
                      component={<ScanTicket />}
                    />
                  }
                />
      
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </BrowserRouter>
    </Provider>
  );
};

export default App;