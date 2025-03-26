import Link from "next/link";

export default function Home() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.1)_0%,_rgba(0,0,0,0.2)_100%)] opacity-40 pointer-events-none"></div>
      
      {/* Main Content */}
      <div className="relative z-10 max-w-2xl text-center px-8 py-16">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
          Video Streaming Platform
        </h1>
        
        <p className="text-lg sm:text-xl text-gray-300 mb-8 leading-relaxed">
          Discover cutting-edge live video streaming with AI-powered insights and real-time analytics.
        </p>
        
        {/* Call-to-Action Button */}
        <Link href="/dashboard">
          <button className="px-6 sm:px-8 py-3 bg-blue-600 rounded-full text-white font-semibold 
            hover:bg-blue-700 transition duration-300 ease-in-out 
            transform hover:-translate-y-1 hover:scale-105 
            shadow-lg hover:shadow-blue-500/50 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
            Enter Dashboard
          </button>
        </Link>
      </div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[20%] left-[15%] w-32 h-32 bg-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-[20%] right-[15%] w-40 h-40 bg-purple-500/30 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
    </div>
  );
}
