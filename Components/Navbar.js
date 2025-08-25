"use client";
import React, { useState, useRef, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { toast } from "react-toastify";

const Navbar = () => {
  const { data: session, status } = useSession();
  const [showdropdown, setShowdropdown] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const dropdownRef = useRef(null);
  const dropdownTimeout = useRef(null);

  // Debug session state
  useEffect(() => {
    console.log("Session status:", status);
    console.log("Session data:", session);
  }, [status, session]);

  useEffect(() => {
    if (status === "authenticated" && session) {
      console.log("✅ User authenticated:", session.user);
      toast.success(`Welcome back, ${getDisplayName()}!`);

      // Fetch user profile
      const fetchUserProfile = async () => {
        try {
          const response = await fetch(`/api/user/${session.user.email}`);
          if (response.ok) {
            const userData = await response.json();
            setUserProfile(userData);
          }
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
        }
      };
      
      fetchUserProfile();
    }
  }, [status, session]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowdropdown(false);
        if (dropdownTimeout.current) {
          clearTimeout(dropdownTimeout.current);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getDisplayName = () => {
  // First check userProfile (from database) for displayName
  if (userProfile?.userInfo?.displayName) {
    return userProfile.userInfo.displayName;
  }
  
  // Then check userProfile directly (if different structure)
  if (userProfile?.displayName) {
    return userProfile.displayName;
  }
  
  // Then check session data
  if (session?.user?.name) {
    return session.user.name;
  }
  
  // Then check email from session
  if (session?.user?.email) {
    return session.user.email.split('@')[0];
  }
  
  // Final fallback
  return "User";
};

const getProfileUsername = () => {
  // First check userProfile (from database) for username
  if (userProfile?.userInfo?.username) {
    return userProfile.userInfo.username;
  }
  
  // Then check userProfile directly
  if (userProfile?.username) {
    return userProfile.username;
  }
  
  // Then check session name (if it's a username)
  if (session?.user?.name) {
    return session.user.name.replace(/[^a-zA-Z0-9]/g, '');
  }
  
  // Then use email as username
  if (session?.user?.email) {
    return session.user.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
  }
  
  // Final fallback
  return "user";
};

  const handleDropdownToggle = () => {
    setShowdropdown(!showdropdown);
    if (dropdownTimeout.current) {
      clearTimeout(dropdownTimeout.current);
    }
  };

  const handleDropdownItemClick = () => {
    setShowdropdown(false);
  };

  return (
    <nav className="flex bg-slate-900 text-white justify-between h-16 items-center px-4">
      <div>
        <Link href="/" className="flex justify-center items-center gap-3 h-16">
          <img src="/tea1.gif" alt="Logo" className="mb-4 h-20 object-cover" />
          <div
            className="logo font-bold text-2xl text-purple-400"
            style={{ textShadow: "3px 2px 5px rgba(168, 85, 247, 0.8)" }}
          >
            Get me a Chai
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-4 relative space-x-3">
        {status === "loading" && (
          <div className="text-white mx-4 font-bold bg-gray-600 rounded-lg px-5 py-2.5">
            <span>Loading...</span>
          </div>
        )}
        
        {status === "authenticated" && session && (
          <>
            <button
              onClick={handleDropdownToggle}
              className="text-white bg-blue-700 hover:bg-blue-800 px-5 py-2.5 rounded-lg inline-flex items-center transition-colors duration-200"
              type="button"
            >
              Welcome {getDisplayName()}
              <svg
                className={`w-2.5 h-2.5 ms-3 transition-transform duration-200 ${
                  showdropdown ? "rotate-180" : ""
                }`}
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 10 6"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 1 4 4 4-4"
                />
              </svg>
            </button>

            <div
              ref={dropdownRef}
              className={`z-50 ${
                showdropdown ? "" : "hidden"
              } absolute top-full right-0 mt-2 bg-white divide-y divide-gray-100 rounded-lg shadow-lg w-44 border border-gray-200`}
            >
              <ul className="py-2 text-sm text-gray-700">
                <li>
                  <Link
                    onClick={handleDropdownItemClick}
                    href={`/profile/${encodeURIComponent(getProfileUsername())}`}
                    className="block px-4 py-2 font-medium hover:bg-blue-50 hover:text-blue-700"
                  >
                    👤 Profile
                  </Link>
                </li>
                <li>
                  <Link
                    href="/earnings"
                    onClick={handleDropdownItemClick}
                    className="block px-4 py-2 font-medium hover:bg-green-50 hover:text-green-700"
                  >
                    💰 Earnings
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => {
                      handleDropdownItemClick();
                      signOut({ callbackUrl: "/" });
                    }}
                    className="block w-full text-left px-4 py-2 font-medium hover:bg-red-50 hover:text-red-700"
                  >
                    🚪 Sign out
                  </button>
                </li>
              </ul>
            </div>
          </>
        )}
        
        {status === "unauthenticated" && (
          <button
            onClick={() => signIn()}
            className="text-white mx-4 font-bold bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br rounded-lg px-5 py-2.5 transition-all duration-200"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;