"use client";
import { useState } from "react";

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [imagePath, setImagePath] = useState("");
  const [videoPath, setVideoPath] = useState("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("Response:", data);

      if (data.image_path) {
        setImagePath(data.image_path);
      } else if (data.video_path) {
        setVideoPath(data.video_path);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center bg-gray-900 text-white p-6">
      <h1 className="text-2xl mb-4">Upload Image/Video for YOLOv9 Detection</h1>
      <input type="file" onChange={handleFileChange} className="mb-4 text-black" />
      <button onClick={handleUpload} className="px-4 py-2 bg-blue-600 rounded">
        Upload
      </button>
      {loading && <p className="mt-4">Processing...</p>}

      {/* Display Image Result */}
      {imagePath && <img src={`http://localhost:5000/${imagePath}`} alt="Detected Image" className="mt-4 w-96" />}

      {/* Display Video Result */}
      {videoPath && (
        <video controls className="mt-4 w-96">
          <source src={`http://localhost:5000/${videoPath}`} type="video/mp4" />
        </video>
      )}
    </div>
  );
}
