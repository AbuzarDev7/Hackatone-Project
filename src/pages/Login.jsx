import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { signInUser } from "../redux/reducers/authSlice";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig/firebase";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleLogin = async (e) => {
    e.preventDefault();

    const result = await dispatch(signInUser({ email, password }));

    if (signInUser.fulfilled.match(result)) {
      const user = result.payload;

      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", user.email));
      const snap = await getDocs(q);

      const role = !snap.empty ? snap.docs[0].data().role : "attendee";

      role === "organizer"
        ? navigate("/dashboard", { replace: true })
        : navigate("/", { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex">

        {/* LEFT PANEL */}
        <div className="hidden md:flex w-1/2 bg-gray-900 text-white flex-col justify-center px-10">
          <h1 className="text-4xl font-bold leading-tight">
            Event
            <span className="block text-emerald-400">Management</span>
          </h1>

          <p className="mt-6 text-gray-300 text-sm leading-relaxed max-w-sm">
            Organize events, manage attendees and validate tickets using a
            modern dashboard designed for professionals.
          </p>

          <div className="mt-10 space-y-3 text-sm text-gray-300">
            <p>✔ Secure login</p>
            <p>✔ Organizer dashboard</p>
            <p>✔ Real-time ticket tracking</p>
          </div>
        </div>

        {/* RIGHT FORM */}
        <div className="w-full md:w-1/2 px-8 py-10 flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-gray-800">
            Login Account
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Enter your credentials to continue
          </p>

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <div>
              <label className="text-xs font-semibold text-gray-500">
                EMAIL
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className="mt-2 w-full border border-gray-300 rounded-xl px-4 py-3 text-sm
                           focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500">
                PASSWORD
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="mt-2 w-full border border-gray-300 rounded-xl px-4 py-3 text-sm
                           focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

          
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold
                         hover:bg-emerald-700 transition active:scale-95 shadow-lg"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <p className="text-sm text-gray-600 mt-6 text-center">
            New here?{" "}
            <Link
              to="/signup"
              className="text-emerald-600 font-semibold hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
