import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white text-center px-4">
      <h1 className="text-4xl font-bold mb-6">Welcome to My Next.js App</h1>
      <p className="text-lg text-gray-400 mb-6">
        Experience live video streaming and AI-powered insights.
      </p>
      
      {/* Go to Dashboard */}
      <Link href="/dashboard">
        <button className="px-6 py-3 bg-blue-600 rounded text-white hover:bg-blue-700 transition">
          Go to Dashboard
        </button>
      </Link>
    </div>
  );
}
