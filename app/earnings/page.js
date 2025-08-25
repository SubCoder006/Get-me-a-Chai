"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const Earnings = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    
    if (status === "authenticated" && session?.user) {
      const redirectToEarnings = async () => {
        try {
          let userProfileData = null;
          
          // First try to get user data by email to get the proper username
          if (session.user.email) {
            const response = await fetch(`/api/user/${encodeURIComponent(session.user.email)}`);
            
            if (response.ok) {
              const userData = await response.json();
              if (!userData.error && userData.username) {
                userProfileData = userData;
              }
            }
          }
          
          // Determine username for earnings URL
          let earningsUsername;
          
          if (userProfileData?.username) {
            // Use database username (preferred)
            earningsUsername = userProfileData.username;
          } else if (session.user.name) {
            // Use session name as fallback
            earningsUsername = session.user.name;
          } else if (session.user.email) {
            // Create clean username from email as last resort
            earningsUsername = session.user.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
          } else {
            // Should not happen, but handle edge case
            earningsUsername = 'user';
          }
          
          console.log("🔄 Redirecting to earnings:", earningsUsername);
          router.replace(`/earnings/${encodeURIComponent(earningsUsername)}`);
          
        } catch (error) {
          console.error("❌ Error getting user data for earnings:", error);
          
          // Fallback: use session data
          const fallbackUsername = session.user.name || 
                                  session.user.email?.split('@')[0].replace(/[^a-zA-Z0-9]/g, '') || 
                                  'user';
          
          router.replace(`/earnings/${encodeURIComponent(fallbackUsername)}`);
        } finally {
          setLoading(false);
        }
      };
      
      redirectToEarnings();
    }
  }, [status, session, router]);

  // Show loading state while redirecting
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[86vh] bg-blue-950">
        <div className="text-white text-xl">Redirecting to your earnings...</div>
      </div>
    );
  }

  // Don't render anything after redirect
  return null;
};

export default Earnings;