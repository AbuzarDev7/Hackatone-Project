import React from "react";
import { Link, NavLink } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { auth } from "../firebase/firebaseconfig/firebase";
import { signOut } from "firebase/auth";
import { setUser } from "../redux/reducers/authSlice";

const Navbar = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const handleLogout = async () => {
    await signOut(auth);
    dispatch(setUser(null));
  };

  const linkClass =
    "px-3 py-2 rounded-lg text-sm font-medium transition hover:bg-white/10";

  return (
    <nav className="sticky top-0 z-50 bg-gray-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* LOGO */}
        <Link
          to="/"
          className="text-2xl font-bold tracking-wide text-emerald-400"
        >
          Qube<span className="text-white">Ticket</span>
        </Link>

        {/* LINKS */}
        <div className="flex items-center gap-2">

          {/* GUEST */}
          {!user && (
            <>
              <NavLink to="/login" className={linkClass}>
                Login
              </NavLink>
              <NavLink
                to="/signup"
                className="px-4 py-2 rounded-lg text-sm font-semibold
                           bg-emerald-600 hover:bg-emerald-700 transition"
              >
                Sign Up
              </NavLink>
            </>
          )}

          {/* ATTENDEE */}
          {user && user.role === "attendee" && (
            <>
              <NavLink to="/home" className={linkClass}>
                Home
              </NavLink>

              <NavLink to="/my-tickets" className={linkClass}>
                My Tickets
              </NavLink>

              <button
                onClick={handleLogout}
                className="ml-2 px-4 py-2 rounded-lg text-sm font-semibold
                           bg-red-500 hover:bg-red-600 transition"
              >
                Logout
              </button>
            </>
          )}

          {/* ORGANIZER */}
          {user && user.role === "organizer" && (
            <>
              <NavLink to="/dashboard" className={linkClass}>
                Dashboard
              </NavLink>

              <NavLink to="/create-event" className={linkClass}>
                Create Event
              </NavLink>

              <button
                onClick={handleLogout}
                className="ml-2 px-4 py-2 rounded-lg text-sm font-semibold
                           bg-red-500 hover:bg-red-600 transition"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
