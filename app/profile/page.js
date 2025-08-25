"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const Profile = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    
    if (status === "authenticated" && session?.user?.email) {
      // Fetch user data to get the correct username for profile URL
      const fetchUserAndRedirect = async () => {
        try {
          const response = await fetch(`/api/user/${encodeURIComponent(session.user.email)}`);
          
          if (response.ok) {
            const userData = await response.json();
            // Use the clean username from database for profile URL
            router.replace(`/profile/${encodeURIComponent(userData.username)}`);
          } else {
            // Fallback: create clean username from email if user not found in database
            const cleanUsername = session.user.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
            router.replace(`/profile/${encodeURIComponent(cleanUsername)}`);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          // Fallback: create clean username from email
          const cleanUsername = session.user.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
          router.replace(`/profile/${encodeURIComponent(cleanUsername)}`);
        } finally {
          setLoading(false);
        }
      };
      
      fetchUserAndRedirect();
    }
  }, [status, session, router]);

  // Show loading state while redirecting
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[86vh] bg-blue-950">
        <div className="text-white text-2xl font-bold ">Redirecting to your profile...</div>
      </div>
    );
  }

  // Don't render anything after redirect
  return null;
};

export default Profile;