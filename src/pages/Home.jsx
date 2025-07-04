import { Link } from "react-router-dom";
import FeedbackForm from "../components/FeedbackForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-indigo-100 text-gray-800 font-sans">
      {/* Header */}
      <header className="py-4 shadow bg-white/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-extrabold text-indigo-700 tracking-tight drop-shadow-sm">
            🛡️ Crime Tracker
          </h1>
          <div className="mt-3 md:mt-0 space-x-2">
            <Link
              to="/login"
              className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition-all duration-300"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="inline-block bg-white border border-indigo-600 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-all duration-300 shadow"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center text-center px-4 py-16 sm:py-20 bg-gradient-to-tr from-indigo-100 to-purple-100">
        <div className="max-w-3xl">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-indigo-800 mb-4 animate-fade-in-up">
            Report Crimes Anonymously
            <br />
            Track and Stay Safe
          </h2>
          <p className="text-base sm:text-lg text-gray-600 mb-8 animate-fade-in-up delay-100">
            Empower your community by reporting crimes, witnessing incidents,
            and keeping track of safety updates — all from your device.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/report"
              className="bg-green-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-green-700 hover:scale-105 transition transform duration-300"
            >
              Report a Crime
            </Link>
            <Link
              to="/witness"
              className="bg-yellow-500 text-white px-6 py-3 rounded-full shadow-lg hover:bg-yellow-600 hover:scale-105 transition transform duration-300"
            >
              Submit as Witness
            </Link>
          </div>
        </div>
      </main>

      {/* Feature Cards */}
      <section className="bg-white py-14 px-4">
        <div className="max-w-6xl mx-auto grid gap-6 sm:grid-cols-2 lg:grid-cols-3 text-center">
          {[
            {
              icon: "📤",
              title: "Easy Reporting",
              desc: "Submit crime or witness reports within minutes from your phone or desktop.",
            },
            {
              icon: "🔐",
              title: "Secure & Private",
              desc: "Your data is encrypted and only accessible by authorized personnel.",
            },
            {
              icon: "📡",
              title: "Track Incidents",
              desc: "Get real-time updates on submitted cases and actions taken.",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="bg-indigo-50 hover:bg-indigo-100 transition rounded-xl p-6 shadow-lg border hover:scale-[1.03] transform duration-300"
            >
              <div className="text-4xl sm:text-5xl mb-3">{feature.icon}</div>
              <h3 className="text-lg sm:text-xl font-semibold text-indigo-700 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-r from-purple-200 via-indigo-100 to-white text-center px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-bold text-indigo-800 mb-3">
            Be the Voice of Change.
          </h2>
          <p className="text-gray-700 mb-5 text-sm sm:text-base">
            Every report helps someone. Make your community safer today.
          </p>
          <Link
            to="/report"
            className="inline-block bg-indigo-700 text-white px-8 py-3 rounded-full shadow-xl hover:bg-indigo-800 hover:scale-105 transition duration-300"
          >
            Report Now
          </Link>
        </div>
      </section>

      {/* Feedback Form Section */}
      <section className="py-14 px-4 bg-gradient-to-bl from-indigo-100 to-purple-50">
        <FeedbackForm />
      </section>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-gray-500 border-t bg-white px-2">
        &copy; {new Date().getFullYear()} Crime Tracker. All rights reserved.
      </footer>
    </div>
  );
}
