"use client";
import React, { useEffect, useState, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const EarningsAccount = ({ params }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Unwrap the params Promise
  const resolvedParams = use(params);
  const account = resolvedParams?.account;
  
  const [supporters, setSupporters] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    supporterCount: 0,
    averageSupport: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simplified authorization check - allow access if user is logged in and matches account
  // Add this useEffect to handle the API call properly
useEffect(() => {
  if (status === "authenticated") {
    fetchEarningsData();
  }
}, [status, session, account, router]);

const fetchEarningsData = async () => {
  try {
    setLoading(true);
    setError(null);
    
    // Use session email or account parameter
    const identifier = session?.user?.email || account;
    console.log("🔍 Fetching earnings for identifier:", identifier);
    
    // Check if identifier is an email or username
    const isEmail = identifier.includes('@');
    
    // Use the correct API endpoint based on identifier type
    const apiUrl = isEmail 
      ? `/api/user/${encodeURIComponent(identifier)}`
      : `/api/supporters/user/${encodeURIComponent(identifier)}`;
    
    console.log("🌐 Making API call to:", apiUrl);
    
    // Get supporters data with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const supportersResponse = await fetch(apiUrl, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    console.log("📨 API Response status:", supportersResponse.status);
    
    if (!supportersResponse.ok) {
      const errorText = await supportersResponse.text();
      console.error("❌ API Error response:", errorText);
      throw new Error(`API returned ${supportersResponse.status}: ${errorText}`);
    }
    
    const supportersData = await supportersResponse.json();
    console.log("✅ API Response data:", supportersData);
    
    if (supportersData.success) {
      setUserInfo(supportersData.userInfo);
      setSupporters(supportersData.supporters || []);
      setStats(supportersData.stats || { totalEarnings: 0, supporterCount: 0, averageSupport: 0 });
    } else {
      console.log("⚠️ API returned success:false", supportersData.error);
      // If no user found, create basic user info from session
      setUserInfo({
        username: session?.user?.name || session?.user?.email?.split('@')[0],
        displayName: session?.user?.name,
        email: session?.user?.email,
        image: session?.user?.image
      });
      setSupporters([]);
      setStats({ totalEarnings: 0, supporterCount: 0, averageSupport: 0 });
    }

  } catch (err) {
    console.error("💥 Error fetching earnings:", err);
    setError(err.message || 'Failed to fetch earnings data');
  } finally {
    setLoading(false);
  }
};

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-purple-900 to-blue-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <div className="text-white text-xl font-medium">Loading your earnings...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-purple-900 to-blue-950 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-500/20 backdrop-blur-md border border-red-500/50 rounded-2xl p-8 text-center">
            <div className="text-6xl mb-4">😔</div>
            <h2 className="text-3xl font-bold text-red-400 mb-4">Oops! Something went wrong</h2>
            <p className="text-red-300 mb-6 text-lg">{error}</p>
            
            <div className="flex gap-4 justify-center">
              <button
                onClick={fetchEarningsData}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all transform hover:scale-105"
              >
                Try Again
              </button>
              
              <button
                onClick={() => router.push("/")}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all transform hover:scale-105"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const profileUrl = userInfo?.username 
    ? `${window.location.origin}/profile/${encodeURIComponent(userInfo.username)}`
    : `${window.location.origin}/profile/${encodeURIComponent(session?.user?.email || account)}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-purple-900 to-blue-950 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:18px_26px]"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-blue-400/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute top-40 right-20 w-32 h-32 bg-purple-400/20 rounded-full blur-xl animate-pulse delay-300"></div>
      <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-pink-400/20 rounded-full blur-xl animate-pulse delay-700"></div>

      <div className="relative z-10 container mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mb-6 animate-bounce">
            <span className="text-4xl">💰</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent mb-4">
            Earnings Dashboard
          </h1>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 max-w-md mx-auto">
            {userInfo?.image && (
              <img 
                src={userInfo.image} 
                alt="Profile" 
                className="w-16 h-16 rounded-full mx-auto mb-4 border-4 border-white/30"
              />
            )}
            <h2 className="text-2xl font-semibold text-white mb-2">
              {userInfo?.displayName || userInfo?.username || session?.user?.name}
            </h2>
            <p className="text-blue-200">
              @{userInfo?.username || session?.user?.name || account}
            </p>
            <p className="text-gray-300 text-sm mt-2">
              {userInfo?.email || session?.user?.email}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="group bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-md p-8 rounded-2xl border border-green-400/30 hover:border-green-400/50 transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/30 rounded-xl">
                <span className="text-2xl">💰</span>
              </div>
              <div className="text-green-400 text-sm font-semibold">TOTAL EARNINGS</div>
            </div>
            <p className="text-4xl font-bold text-white mb-2">
              ₹{(stats.totalEarnings || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-green-200 text-sm">Your total revenue</p>
          </div>
          
          <div className="group bg-gradient-to-br from-blue-500/20 to-cyan-600/20 backdrop-blur-md p-8 rounded-2xl border border-blue-400/30 hover:border-blue-400/50 transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/30 rounded-xl">
                <span className="text-2xl">👥</span>
              </div>
              <div className="text-blue-400 text-sm font-semibold">SUPPORTERS</div>
            </div>
            <p className="text-4xl font-bold text-white mb-2">
              {stats.supporterCount || 0}
            </p>
            <p className="text-blue-200 text-sm">People who support you</p>
          </div>
          
          <div className="group bg-gradient-to-br from-purple-500/20 to-pink-600/20 backdrop-blur-md p-8 rounded-2xl border border-purple-400/30 hover:border-purple-400/50 transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/30 rounded-xl">
                <span className="text-2xl">📊</span>
              </div>
              <div className="text-purple-400 text-sm font-semibold">AVERAGE</div>
            </div>
            <p className="text-4xl font-bold text-white mb-2">
              ₹{parseFloat(stats.averageSupport || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-purple-200 text-sm">Average per supporter</p>
          </div>
        </div>

        {/* Supporters List */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 mb-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <span className="text-2xl">🎉</span>
              Your Amazing Supporters
            </h2>
            {supporters.length > 0 && (
              <div className="text-gray-400 text-sm">
                {supporters.length} supporter{supporters.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
          
          {supporters.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-8xl mb-6">🎯</div>
              <h3 className="text-2xl font-bold text-white mb-4">Ready to Get Started?</h3>
              <p className="text-gray-300 text-lg mb-8 max-w-md mx-auto">
                Share your profile link and start receiving support from your amazing community!
              </p>
              
              <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 max-w-2xl mx-auto mb-8">
                <p className="text-gray-400 text-sm mb-3">Share your profile URL:</p>
                <div className="flex items-center gap-3">
                  <code className="flex-1 bg-black/50 text-green-400 px-4 py-3 rounded-lg text-sm font-mono break-all">
                    {profileUrl}
                  </code>
                  <button
                    onClick={() => navigator.clipboard.writeText(profileUrl)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors flex-shrink-0"
                  >
                    📋 Copy
                  </button>
                </div>
              </div>
              
              <button
                onClick={() => router.push(`/profile/${encodeURIComponent(userInfo?.username || session?.user?.name || account)}`)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105 shadow-xl"
              >
                View My Profile 🚀
              </button>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
              {supporters.map((supporter, index) => (
                <div
                  key={supporter._id || index}
                  className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 group"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {(supporter.name || 'A').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-semibold text-white text-lg">
                            {supporter.name || 'Anonymous Supporter'}
                          </h4>
                          <p className="text-gray-400 text-sm">
                            {new Date(supporter.createdAt).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      {supporter.message && (
                        <div className="bg-black/20 p-4 rounded-lg mt-3">
                          <p className="text-gray-300 italic">"{supporter.message}"</p>
                        </div>
                      )}
                    </div>
                    <div className="text-right ml-6">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-xl">
                        <p className="text-2xl font-bold">
                          ₹{parseFloat(supporter.amount).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="text-center space-x-4 my-4">
          <button
            onClick={() => router.push(`/profile/${encodeURIComponent(userInfo?.username || session?.user?.name || account)}`)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 my-4 px-8 rounded-xl transition-all transform hover:scale-105 shadow-xl"
          >
            🚀 View My Profile
          </button>
          
          <button
            onClick={fetchEarningsData}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105 shadow-xl"
          >
            🔄 Refresh Data
          </button>
          
          <button
            onClick={() => navigator.clipboard.writeText(profileUrl)}
            className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105 shadow-xl"
          >
            📋 Share Profile
          </button>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
};

export default EarningsAccount;