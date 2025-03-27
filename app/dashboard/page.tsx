"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import Link from "next/link";

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [model1ImagePath, setModel1ImagePath] = useState<string | undefined>(undefined);
  const [model2ImagePath, setModel2ImagePath] = useState<string | undefined>(undefined);
  const [model1VideoPath, setModel1VideoPath] = useState<string | undefined>(undefined);
  const [model2VideoPath, setModel2VideoPath] = useState<string | undefined>(undefined);
  const [showModel1, setShowModel1] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedImage1, setStreamedImage1] = useState<string | null>(null);
  const [streamedImage2, setStreamedImage2] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      handleAuthErrors(error);
    }
  };

  const handleAuthErrors = (error: any) => {
    switch (error.code) {
      case "auth/email-already-in-use":
        setError("This email is already in use. Try logging in.");
        break;
      case "auth/weak-password":
        setError("Password should be at least 6 characters.");
        break;
      case "auth/invalid-email":
        setError("Invalid email format. Please enter a valid email.");
        break;
      case "auth/user-not-found":
        setError("No account found with this email. Try signing up.");
        break;
      case "auth/wrong-password":
        setError("Incorrect password. Try again.");
        break;
      default:
        setError("Something went wrong. Please try again.");
        break;
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async (file: File) => {
    setLoading(true);
    setModel1ImagePath(undefined);
    setModel2ImagePath(undefined);
    setModel1VideoPath(undefined);
    setModel2VideoPath(undefined);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:5001/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to process file');
      }

      // Handle image paths if present
      if (data.model1_image_path && data.model2_image_path) {
        setModel1ImagePath(data.model1_image_path);
        console.log(data.model1_image_path);
        setModel2ImagePath(data.model2_image_path);
        console.log(data.model1_image_path);
      }

      // Handle video paths if present
      if (data.model1_video_path && data.model2_video_path) {
        setModel1VideoPath(data.model1_video_path);
        console.log(data.model1_video_path);
        setModel2VideoPath(data.model2_video_path);
        console.log(data.model2_video_path);
      }

    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const startStreaming = () => {
    setIsStreaming(true);
    let eventSource: EventSource | null = null;

    try {
      eventSource = new EventSource('http://localhost:5001/stream');
      
      eventSource.onopen = () => {
        console.log('Stream connected');
      };
      
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setStreamedImage1(data.model1_frame ? `data:image/jpeg;base64,${data.model1_frame}` : null);
          setStreamedImage2(data.model2_frame ? `data:image/jpeg;base64,${data.model2_frame}` : null);
        } catch (error) {
          console.error('Error parsing stream data:', error);
        }
      };

      eventSource.onerror = (event) => {
        const typedEvent = event as Event;
        console.error('Stream connection error:', typedEvent.type);
        if (eventSource) {
          eventSource.close();
        }
        setIsStreaming(false);
      };

    } catch (error) {
      console.error('Error setting up stream:', error);
      if (eventSource) {
        eventSource.close();
      }
      setIsStreaming(false);
    }
  };

  const stopStreaming = () => {
    setIsStreaming(false);
    setStreamedImage1(null);
    setStreamedImage2(null);
  };

  // Add cleanup on component unmount
  useEffect(() => {
    let eventSource: EventSource | null = null;

    if (isStreaming) {
      try {
        eventSource = new EventSource('http://localhost:5001/stream');
        
        eventSource.onopen = () => {
          console.log('Stream connected');
        };
        
        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            setStreamedImage1(data.model1_frame ? `data:image/jpeg;base64,${data.model1_frame}` : null);
            setStreamedImage2(data.model2_frame ? `data:image/jpeg;base64,${data.model2_frame}` : null);
          } catch (error) {
            console.error('Error parsing stream data:', error);
          }
        };

        eventSource.onerror = (event) => {
          const typedEvent = event as Event;
          console.error('Stream connection error:', typedEvent.type);
          if (eventSource) {
            eventSource.close();
          }
          setIsStreaming(false);
        };
      } catch (error) {
        console.error('Error in stream setup:', error);
        setIsStreaming(false);
      }
    }

    return () => {
      if (eventSource) {
        console.log('Closing stream connection');
        eventSource.close();
      }
    };
  }, [isStreaming]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
        <h1 className="text-3xl font-bold mb-6">
          {isSignUp ? "Sign Up" : "Login"}
        </h1>
        <form
          onSubmit={handleAuth}
          className="flex flex-col bg-gray-800 p-6 rounded-lg shadow-lg w-80"
        >
          {error && <p className="text-red-500 mb-3">{error}</p>}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mb-4 p-2 rounded bg-gray-700 text-white"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mb-4 p-2 rounded bg-gray-700 text-white"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 rounded text-white hover:bg-blue-700"
          >
            {isSignUp ? "Sign Up" : "Login"}
          </button>
        </form>
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="mt-4 text-blue-400 hover:underline"
        >
          {isSignUp ? "Already have an account? Login" : "Don't have an account? Sign up"}
        </button>

        <Link href="/">
          <button className="mt-4 px-4 py-2 bg-gray-700 rounded text-white hover:bg-gray-600">
            Back to Home
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[linear-gradient(to_bottom,#93B48B,#87D68D,#f7fff6)] text-white min-h-screen flex flex-col items-center justify-center p-6">
      <div className="absolute top-4 left-4">
        <Link href="/">
        <button className="px-4 py-2 border-2 border-[#87D68D] text-white rounded transition duration-300 hover:bg-[#F5F5DC] hover:text-[#91818A] hover:shadow-md hover:shadow-white">
          Home
        </button>


        </Link>
      </div>

      <div className="absolute top-4 right-4">
        <button
          onClick={() => auth.signOut()}
          className="px-4 py-2 bg-red-600 rounded text-white hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-br from-gray-900 via-gray-800 to-black bg-clip-text text-transparent">
        Object Detection Dashboard
      </h1>

      <div className="w-full max-w-4xl bg-gradient-to-br from-[#f7fff6] via-[#e4f3e1] to-[#d0e8cb] p-6 rounded-lg shadow-2xl mb-6">
        <h2 className="text-2xl text-[#211A1D] font-semibold mb-4">Upload Image/Video for YOLOv9 Detection</h2>
        <input 
          type="file" 
          onChange={handleFileChange} 
          className="mb-4 text-[#211A1D] w-full"
          accept="image/*,video/*"
        />
        <button 
          onClick={() => file && handleUpload(file)} 
          className="px-4 py-2 bg-blue-600 rounded text-[#211A1D] hover:bg-blue-700 w-full"
          disabled={loading || !file}
        >
          {loading ? "Processing..." : "Upload"}
        </button>
      </div>

      <div className="w-full max-w-4xl bg-gradient-to-br from-[#f7fff6] via-[#e4f3e1] to-[#d0e8cb] p-6 rounded-lg shadow-2xl mb-6">
        <h2 className="text-2xl  text-[#211A1D] font-semibold mb-4">Video Detection</h2>
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={isStreaming ? stopStreaming : startStreaming}
            className={`px-4 py-2 rounded text-[#211A1D] w-full ${
              isStreaming 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isStreaming ? "Stop Stream" : "Start Stream"}
          </button>
        </div>

        {/* Streaming Results */}
        {isStreaming && (
          <div className="w-full">
            <div className="flex space-x-4 mb-6 border-b border-gray-700">
              <button
                onClick={() => setShowModel1(true)}
                className={`pb-2 px-4 text-sm font-medium transition-colors duration-200 relative ${
                  showModel1 
                    ? 'text-blue-400 border-b-2 border-blue-400' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Hazard Detection
                {showModel1 && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-400"></span>}
              </button>
              <button
                onClick={() => setShowModel1(false)}
                className={`pb-2 px-4 text-sm font-medium transition-colors duration-200 relative ${
                  !showModel1 
                    ? 'text-purple-400 border-b-2 border-purple-400' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Crane Defects
                {!showModel1 && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-400"></span>}
              </button>
            </div>

            <div className="rounded-lg overflow-hidden shadow-lg">
              {showModel1 ? (
                streamedImage1 && (
                  <img 
                    src={streamedImage1} 
                    alt="Real-time Hazard Detection" 
                    className="w-full"
                  />
                )
              ) : (
                streamedImage2 && (
                  <img 
                    src={streamedImage2} 
                    alt="Real-time Crane Defects" 
                    className="w-full"
                  />
                )
              )}
            </div>
          </div>
        )}
      </div>

      <div className="w-full max-w-4xl bg-gradient-to-br from-[#f7fff6] via-[#e4f3e1] to-[#d0e8cb] p-6 rounded-lg shadow-2xl mb-6">
        <h2 className="text-2xl text-[#211A1D] font-semibold mb-6">Detection Results</h2>
        
        {/* Model Selection Tabs */}
        {((model1ImagePath && model2ImagePath) || (model1VideoPath && model2VideoPath)) && (
          <div className="flex space-x-4 mb-6 border-b border-gray-700">
            <button
              onClick={() => setShowModel1(true)}
              className={`pb-2 px-4 text-sm font-medium transition-colors duration-200 relative ${
                showModel1 
                  ? 'text-blue-400 border-b-2 border-blue-400' 
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Hazard Detection
              {showModel1 && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-400"></span>}
            </button>
            <button
              onClick={() => setShowModel1(false)}
              className={`pb-2 px-4 text-sm font-medium transition-colors duration-200 relative ${
                !showModel1 
                  ? 'text-purple-400 border-b-2 border-purple-400' 
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Crane Defects
              {!showModel1 && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-400"></span>}
            </button>
          </div>
        )}
        
        {/* Image Results */}
        {model1ImagePath && model2ImagePath && (
          <div className="w-full">
            {showModel1 ? (
              <div className="mb-4">
                <h3 className="text-xl mb-4 text-[#211A1D] font-medium">Hazard Detection Results</h3>
                <div className="rounded-lg overflow-hidden shadow-lg">
                  <img 
                    src={`http://localhost:5001/runs/${model1ImagePath}`} 
                    alt="Hazard Detection" 
                    className="w-full"
                  />
                </div>
              </div>
            ) : (
              <div className="mb-4">
                <h3 className="text-xl mb-4 text-[#211A1D] font-medium">Crane Defects Results</h3>
                <div className="rounded-lg overflow-hidden shadow-lg">
                  <img 
                    src={`http://localhost:5001/runs/${model2ImagePath}`} 
                    alt="Crane Defects" 
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Video Results */}
        {model1VideoPath && model2VideoPath && (
          <div className="w-full">
            {showModel1 ? (
              <div key="model1-video" className="mb-4">
                <h3 className="text-xl mb-4 text-blue-400 font-medium">Hazard Detection Video</h3>
                <div className="rounded-lg overflow-hidden shadow-lg">
                  <video 
                    key={model1VideoPath}
                    controls 
                    className="w-full"
                    autoPlay={false}
                  >
                    <source src={`http://localhost:5001/runs/${model1VideoPath}`} type="video/mp4" />
                    Your browser does not support video playback.
                  </video>
                </div>
              </div>
            ) : (
              <div key="model2-video" className="mb-4">
                <h3 className="text-xl mb-4 text-purple-400 font-medium">Crane Defects Video</h3>
                <div className="rounded-lg overflow-hidden shadow-lg">
                  <video 
                    key={model2VideoPath}
                    controls 
                    className="w-full"
                    autoPlay={false}
                  >
                    <source src={`http://localhost:5001/runs/${model2VideoPath}`} type="video/mp4" />
                    Your browser does not support video playback.
                  </video>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-flex items-center space-x-3">
              <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-lg text-gray-300">Processing your file...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
