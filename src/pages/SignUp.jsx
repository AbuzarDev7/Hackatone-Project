import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { signUpUser } from "../redux/reducers/authSlice";
import { useNavigate, Link } from "react-router-dom";

function SignUp() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    try {
      await dispatch(
        signUpUser({
          email,
          password,
          name: fullName,
          role: "attendee",
        })
      ).unwrap();

      alert("Account created successfully!");
      navigate("/login", { replace: true });
    } catch (err) {
      alert("Signup failed: " + err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex">

        {/* LEFT PANEL */}
        <div className="hidden md:flex w-1/2 bg-gray-900 text-white flex-col justify-center px-10">
          <h1 className="text-4xl font-bold leading-tight">
            Join
            <span className="block text-emerald-400">Event Platform</span>
          </h1>

          <p className="mt-6 text-gray-300 text-sm leading-relaxed max-w-sm">
            Create your account to attend events, book tickets and stay
            connected with amazing experiences.
          </p>

          <div className="mt-10 space-y-3 text-sm text-gray-300">
            <p>✔ Easy signup</p>
            <p>✔ Attend events</p>
            <p>✔ Digital tickets</p>
          </div>
        </div>

        {/* RIGHT FORM */}
        <div className="w-full md:w-1/2 px-8 py-10 flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-gray-800">
            Create Account
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Sign up as an attendee
          </p>

          {error && (
            <p className="text-red-600 text-sm mt-4">{error}</p>
          )}

          <form onSubmit={handleSignUp} className="mt-8 space-y-5">

            <div>
              <label className="text-xs font-semibold text-gray-500">
                FULL NAME
              </label>
              <input
                type="text"
                placeholder="John Doe"
                className="mt-2 w-full border border-gray-300 rounded-xl px-4 py-3 text-sm
                           focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

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
                placeholder="Min. 6 characters"
                className="mt-2 w-full border border-gray-300 rounded-xl px-4 py-3 text-sm
                           focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500">
                CONFIRM PASSWORD
              </label>
              <input
                type="password"
                placeholder="Re-enter password"
                className="mt-2 w-full border border-gray-300 rounded-xl px-4 py-3 text-sm
                           focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

          
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold
                         hover:bg-emerald-700 transition active:scale-95 shadow-lg
                         disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <p className="text-sm text-gray-600 mt-6 text-center">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-emerald-600 font-semibold hover:underline"
            >
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
