"use client";
import React from "react";
import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const Login = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showCredentialsForm, setShowCredentialsForm] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [isClient, setIsClient] = useState(false);

  // Ensure component is mounted on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Debug logging
  useEffect(() => {
    console.log("Login component mounted");
    console.log("Session status:", status);
    console.log("Session data:", session);
  }, [session, status]);

  // Redirect if already logged in
  useEffect(() => {
    if (status === "authenticated" && session) {
      console.log("User already authenticated, redirecting...");
      router.push("/");
    }
  }, [status, session, router]);

  const handleCredentialsLogin = async (e) => {
    e.preventDefault();
    console.log("Attempting credentials login...");

    try {
      const result = await signIn("credentials", {
        redirect: false,
        username,
        password,
        email,
      });

      console.log("SignIn result:", result);

      if (result?.error) {
        console.error("Login error:", result.error);
        toast.error(result.error || "Invalid login details");
      } else if (result?.ok) {
        console.log("Login successful");
        toast.success("Login successful!");
        router.push("/");
      }
    } catch (error) {
      console.error("Login exception:", error);
      toast.error("An error occurred during login");
    }
  };

  // Show loading state
  if (status === "loading" || !isClient) {
    return (
      <div className="text-white flex py-14 mx-auto items-center justify-center flex-col w-full h-[86vh] bg-blue-950">
        <div>Loading...</div>
      </div>
    );
  }

  // Don't render login if already authenticated
  if (status === "authenticated") {
    return (
      <div className="text-white flex py-14 mx-auto items-center justify-center flex-col w-full h-[86vh] bg-blue-950">
        <div>Redirecting...</div>
      </div>
    );
  }

  return (
    <>
    <div className="bg-gradient-to-br from-blue-950 via-purple-900 to-blue-950 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:18px_26px]"></div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-blue-400/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute top-40 right-20 w-32 h-32 bg-purple-400/20 rounded-full blur-xl animate-pulse delay-300"></div>
      <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-pink-400/20 rounded-full blur-xl animate-pulse delay-700"></div>

      <div className="text-white flex py-14 mx-auto items-center justify-center flex-col w-full h-[86vh]">
        <h1 className="text-3xl font-bold mb-6">Login to Your Account</h1>

        <div className="flex flex-col gap-3 bg-black w-100 backdrop-blur-md rounded-lg p-8">
          <button
            type="button"
            className="text-white bg-[#9d49ec] hover:bg-[#9d59ea]/90 focus:ring-4 focus:outline-none focus:ring-[#9d00ed]/50 font-bold rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#3b5998]/55 me-2 mb-2 h-10"
            onClick={() => {
              console.log("Credentials button clicked");
              setShowCredentialsForm(!showCredentialsForm);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4 me-2"
              aria-hidden="true"
            >
              <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-4.33 0-8 2.17-8 6v1h16v-1c0-3.83-3.67-6-8-6z" />
            </svg>
            Sign in with Credentials
          </button>

          {showCredentialsForm && (
            <form
              onSubmit={handleCredentialsLogin}
              className="flex flex-col gap-3 mt-3"
            >
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="p-2 rounded bg-gray-800 text-white"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="p-2 rounded bg-gray-800 text-white"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="p-2 rounded bg-gray-800 text-white"
                required
              />
              <div className="btn flex justify-center gap-4 w-full">
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 w-1/2 text-white py-2 px-4 rounded"
                >
                  Login
                </button>
                <button
                  type="button"
                  className="bg-red-500 hover:bg-red-600 text-white w-1/2 py-2 px-4 rounded"
                  onClick={() => {
                    console.log("Back button clicked");
                    setShowCredentialsForm(false);
                  }}
                >
                  Back
                </button>
              </div>
            </form>
          )}
          {!showCredentialsForm && (
            <>
              <button
                type="button"
                className="text-white cursor-pointer bg-[#24292F] hover:bg-[#323335] focus:ring-4 focus:outline-none focus:ring-[#24292F]/50 font-bold rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-gray-500 dark:hover:bg-[#050708]/30 me-2 mb-2 h-10"
                onClick={() => {
                  console.log("GitHub login clicked");
                  signIn("github");
                }}
              >
                <svg
                  className="w-4 h-4 me-2"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 .333A9.911 9.911 0 0 0 6.866 19.65c.5.092.678-.215.678-.477 0-.237-.01-1.017-.014-1.845-2.757.6-3.338-1.169-3.338-1.169a2.627 2.627 0 0 0-1.1-1.451c-.9-.615.07-.6.07-.6a2.084 2.084 0 0 1 1.518 1.021 2.11 2.11 0 0 0 2.884.823c.044-.503.268-.973.63-1.325-2.2-.25-4.516-1.1-4.516-4.9A3.832 3.832 0 0 1 4.7 7.068a3.56 3.56 0 0 1 .095-2.623s.832-.266 2.726 1.016a9.409 9.409 0 0 1 4.962 0c1.89-1.282 2.717-1.016 2.717-1.016.366.83.402 1.768.1 2.623a3.827 3.827 0 0 1 1.02 2.659c0 3.807-2.319 4.644-4.525 4.889a2.366 2.366 0 0 1 .673 1.834c0 1.326-.012 2.394-.012 2.72 0 .263.18.572.681.475A9.911 9.911 0 0 0 10 .333Z"
                    clipRule="evenodd"
                  />
                </svg>
                Sign in with Github
              </button>
              <button
                onClick={() => {
                  console.log("Google login clicked");
                  signIn("google");
                }}
                type="button"
                className="text-white cursor-pointer bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-bold rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#4285F4]/55 me-2 mb-2 h-10"
              >
                <svg
                  className="w-4 h-4 me-2"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 18 19"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.842 18.083a8.8 8.8 0 0 1-8.65-8.948 8.841 8.841 0 0 1 8.8-8.652h.153a8.464 8.464 0 0 1 5.7 2.257l-2.193 2.038A5.27 5.27 0 0 0 9.09 3.4a5.882 5.882 0 0 0-.2 11.76h.124a5.091 5.091 0 0 0 5.248-4.057L14.3 11H9V8h8.34c.066.543.095 1.09.088 1.636-.086 5.053-3.463 8.449-8.4 8.449l-.186-.002Z"
                    clipRule="evenodd"
                  />
                </svg>
                Sign in with Google
              </button>
            </>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default Login;
