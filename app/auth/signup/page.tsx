"use client";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  async function handleSignUp(e:React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/auth/login");
    } catch (error) {
      console.error("Signup error:", error);
    }
  }

  return (
    <form onSubmit={handleSignUp} className="p-4 max-w-md mx-auto">
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="p-2 w-full mb-2" />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="p-2 w-full mb-2" />
      <button type="submit" className="p-2 bg-blue-600 text-white w-full">Sign Up</button>
    </form>
  );
}
