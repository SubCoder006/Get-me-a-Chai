"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Script from "next/script";

const ProfilePage = ({ params }) => {
  const { data: session } = useSession();
  const [userInfo, setUserInfo] = useState(null);
  const [supporters, setSupporters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [supportForm, setSupportForm] = useState({
    name: "",
    amount: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const { username } = React.use(params);

  useEffect(() => {
    if (username) {
      fetchUserProfile();
    }
  }, [username]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/supporters/user/${encodeURIComponent(username)}`);
      const data = await response.json();
      
      if (data.success && data.userInfo) {
        setUserInfo(data.userInfo);
        setSupporters(data.supporters || []);
      } else {
        console.error("User not found");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setSupportForm({
      ...supportForm,
      [e.target.name]: e.target.value
    });
  };

  const initializeRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    
    if (!supportForm.name || !supportForm.amount) {
      alert("Please fill in your name and amount");
      return;
    }

    if (parseFloat(supportForm.amount) < 1) {
      alert("Minimum amount is ₹1");
      return;
    }

    setIsSubmitting(true);

    try {
      // Initialize Razorpay
      const isRazorpayLoaded = await initializeRazorpay();
      
      if (!isRazorpayLoaded) {
        alert("Razorpay SDK failed to load");
        return;
      }

      // Create order
      const orderResponse = await fetch("/api/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: parseFloat(supportForm.amount),
        }),
      });

      const orderData = await orderResponse.json();
      
      if (!orderResponse.ok) {
        throw new Error(orderData.error || "Failed to create order");
      }

      // Razorpay options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: `Support ${userInfo.displayName || userInfo.username}`,
        description: `Supporting ${userInfo.displayName || userInfo.username}`,
        order_id: orderData.id,
        handler: async function (response) {
          try {
            // Save support data to database
            const supportData = {
              name: supportForm.name,
              amount: parseFloat(supportForm.amount),
              message: supportForm.message,
              userEmail: userInfo.email,
              username: userInfo.username,
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
            };

            const saveResponse = await fetch("/api/supporters", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(supportData),
            });

            if (saveResponse.ok) {
              // Success! Reset form and refresh data
              setSupportForm({ name: "", amount: "", message: "" });
              setShowPaymentForm(false);
              fetchUserProfile();
              
              // Show success message
              alert(`Thank you ${supportForm.name}! Your support of ₹${supportForm.amount} has been received! 🎉`);
            } else {
              throw new Error("Failed to save support data");
            }
          } catch (error) {
            console.error("Error saving support:", error);
            alert("Payment successful but there was an error saving the data. Please contact support.");
          }
        },
        prefill: {
          name: supportForm.name,
          email: session?.user?.email || "",
        },
        theme: {
          color: "#7C3AED",
        },
        modal: {
          ondismiss: function () {
            console.log("Payment modal closed");
            setIsSubmitting(false);
          },
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
      
    } catch (error) {
      console.error("Payment error:", error);
      alert("Failed to initiate payment: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-purple-900 to-blue-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <div className="text-white text-xl font-medium">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-purple-900 to-blue-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-3xl font-bold text-white mb-4">Profile Not Found</h1>
          <p className="text-gray-300 mb-6">The user you're looking for doesn't exist.</p>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const totalEarnings = supporters.reduce((sum, supporter) => sum + parseFloat(supporter.amount || 0), 0);
  const recentSupporters = supporters.slice(0, 3);

  return (
    <>
      <Script 
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-purple-900 to-blue-950 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:18px_26px]"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-400/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-purple-400/20 rounded-full blur-xl animate-pulse delay-300"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-pink-400/20 rounded-full blur-xl animate-pulse delay-700"></div>

        <div className="relative z-10 container mx-auto px-6 py-12">
          {/* Profile Header */}
          <div className="text-center mb-12">
            <div className="relative inline-block mb-6">
              {userInfo.image ? (
                <img
                  src={userInfo.image}
                  alt={userInfo.displayName || userInfo.username}
                  className="w-32 h-32 rounded-full mx-auto border-4 border-white/30 shadow-2xl"
                />
              ) : (
                <div className="w-32 h-32 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mx-auto border-4 border-white/30 flex items-center justify-center text-white text-4xl font-bold shadow-2xl">
                  {(userInfo.displayName || userInfo.username || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                <span className="text-white text-lg">✓</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent mb-2">
              {userInfo.displayName || userInfo.username}
            </h1>
            
            <p className="text-blue-200 text-xl mb-4">@{userInfo.username}</p>
            
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 max-w-md mx-auto">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-400">₹{totalEarnings.toLocaleString('en-IN')}</p>
                  <p className="text-gray-300 text-sm">Total Raised</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-400">{supporters.length}</p>
                  <p className="text-gray-300 text-sm">Supporters</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Support Form */}
            <div className="order-2 lg:order-1">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-2xl">💝</span>
                  Support {userInfo.displayName || userInfo.username}
                </h2>

                {!showPaymentForm ? (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-6">🚀</div>
                    <h3 className="text-2xl font-bold text-white mb-4">Ready to Show Support?</h3>
                    <p className="text-gray-300 mb-8">
                      Your contribution helps {userInfo.displayName || userInfo.username} continue their amazing work!
                    </p>
                    <button
                      onClick={() => setShowPaymentForm(true)}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105 shadow-xl"
                    >
                      💖 Support Now
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handlePayment} className="space-y-6">
                    <div>
                      <label className="block text-white font-semibold mb-2">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={supportForm.name}
                        onChange={handleInputChange}
                        placeholder="Enter your name"
                        className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-white font-semibold mb-2">
                        Support Amount (₹) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">₹</span>
                        <input
                          type="number"
                          name="amount"
                          value={supportForm.amount}
                          onChange={handleInputChange}
                          placeholder="0"
                          min="1"
                          step="1"
                          className="w-full pl-8 pr-4 py-3 bg-black/30 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
                          required
                        />
                      </div>
                      
                      {/* Quick Amount Buttons */}
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {[50, 100, 200, 500, 1000].map((amount) => (
                          <button
                            key={amount}
                            type="button"
                            onClick={() => setSupportForm({...supportForm, amount: amount.toString()})}
                            className="px-3 py-1 bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 text-sm rounded-lg transition-colors border border-purple-400/30"
                          >
                            ₹{amount}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-white font-semibold mb-2">
                        Message (Optional)
                      </label>
                      <textarea
                        name="message"
                        value={supportForm.message}
                        onChange={handleInputChange}
                        placeholder="Leave a supportive message..."
                        rows="3"
                        className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 resize-none"
                      />
                    </div>

                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setShowPaymentForm(false)}
                        className="flex-1 bg-gray-600/50 hover:bg-gray-600/70 text-white font-semibold py-3 px-6 rounded-xl transition-all"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                            Processing...
                          </div>
                        ) : (
                          `💳 Pay ₹${supportForm.amount || '0'}`
                        )}
                      </button>
                    </div>
                  </form>
                )}

                {/* Security Badge */}
                <div className="mt-6 flex items-center justify-center gap-2 text-gray-400 text-sm">
                  <span className="text-green-400">🔒</span>
                  Secured by Razorpay
                </div>
              </div>
            </div>

            {/* Recent Supporters */}
            <div className="order-1 lg:order-2">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-2xl">🌟</span>
                  Recent Supporters
                </h2>

                {supporters.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">🎯</div>
                    <p className="text-gray-400 text-lg">
                      Be the first to support {userInfo.displayName || userInfo.username}!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentSupporters.map((supporter, index) => (
                      <div
                        key={supporter._id || index}
                        className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                              {(supporter.name || 'A').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-white">
                                {supporter.name || 'Anonymous'}
                              </p>
                              <p className="text-gray-400 text-sm">
                                {new Date(supporter.createdAt).toLocaleDateString('en-IN')}
                              </p>
                            </div>
                          </div>
                          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-lg font-bold">
                            ₹{parseFloat(supporter.amount).toLocaleString('en-IN')}
                          </div>
                        </div>
                        {supporter.message && (
                          <div className="mt-3 bg-black/20 p-3 rounded-lg">
                            <p className="text-gray-300 text-sm italic">"{supporter.message}"</p>
                          </div>
                        )}
                      </div>
                    ))}

                    {supporters.length > 3 && (
                      <div className="text-center pt-4">
                        <p className="text-gray-400">
                          and {supporters.length - 3} more supporter{supporters.length - 3 !== 1 ? 's' : ''}...
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Share Section */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 mt-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span>📢</span>
                  Share This Profile
                </h3>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      const url = window.location.href;
                      navigator.clipboard.writeText(url);
                      alert('Profile link copied to clipboard!');
                    }}
                    className="flex-1 bg-blue-600/50 hover:bg-blue-600/70 text-white py-2 px-4 rounded-lg transition-colors text-sm"
                  >
                    📋 Copy Link
                  </button>
                  <button
                    onClick={() => {
                      const url = window.location.href;
                      const text = `Support ${userInfo.displayName || userInfo.username} at ${url}`;
                      if (navigator.share) {
                        navigator.share({ title: 'Support Profile', text, url });
                      } else {
                        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
                      }
                    }}
                    className="flex-1 bg-purple-600/50 hover:bg-purple-600/70 text-white py-2 px-4 rounded-lg transition-colors text-sm"
                  >
                    🐦 Share
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* All Supporters Section */}
          {supporters.length > 3 && (
            <div className="mt-12">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-2xl">🎉</span>
                  All Supporters ({supporters.length})
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto custom-scrollbar">
                  {supporters.map((supporter, index) => (
                    <div
                      key={supporter._id || index}
                      className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {(supporter.name || 'A').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-white text-sm">
                              {supporter.name || 'Anonymous'}
                            </p>
                            <p className="text-gray-400 text-xs">
                              {new Date(supporter.createdAt).toLocaleDateString('en-IN')}
                            </p>
                          </div>
                        </div>
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-1 rounded font-bold text-sm">
                          ₹{parseFloat(supporter.amount).toLocaleString('en-IN')}
                        </div>
                      </div>
                      {supporter.message && (
                        <div className="mt-2 bg-black/20 p-2 rounded text-xs">
                          <p className="text-gray-300 italic">"{supporter.message}"</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
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
    </>
  );
};

export default ProfilePage;