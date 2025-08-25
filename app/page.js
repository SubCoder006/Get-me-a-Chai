import Image from "next/image";

export default function Home() {
  return (
    <>
      <div className="bg-gradient-to-br from-blue-950 via-purple-900 to-blue-950 relative overflow-hidden">
        {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:18px_26px]"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-blue-400/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute top-40 right-20 w-32 h-32 bg-purple-400/20 rounded-full blur-xl animate-pulse delay-300"></div>
      <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-pink-400/20 rounded-full blur-xl animate-pulse delay-700"></div>

        <div className="flex flex-col justify-center items-center h-full  ">
          <h1 className="text-3xl flex gap-4 items-center font-bold mt-4 text-sky-200">
            Welcome to Get me a Chai
            <span>
              <img
                src="/tea1.gif"
                alt=""
                className="bg-transparent w-40 mb-3"
              />
            </span>
          </h1>
          <p className=" text-lg text-center text-teal-200 w-[70%]">
            Your one-stop solution for all your chai needs. Join us in our
            mission to support chai lovers and their projects. Start exploring
            our platform today!
          </p>
          <p className="flex gap-4">
            <button
              type="button"
              className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80dark:focus:ring-blue-800 rounded-lg font-bold px-5 py-2.5 text-center me-2 mb-2 mt-4 text-xl cursor-pointer"
            >
              Start Now!
            </button>
            <button
              type="button"
              className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80dark:focus:ring-blue-800 rounded-lg font-bold px-5 py-2.5 text-center me-2 mb-2 mt-4 text-xl cursor-pointer"
            >
              About Creator
            </button>
          </p>
        </div>

        <div className="w-full h-24 bg-transparent dark:bg-transparent">
          <svg
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 200"
            preserveAspectRatio="none"
          >
            <defs>
              <filter
                id="purple-shadow-dark"
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
              >
                <feDropShadow
                  dx="0"
                  dy="8"
                  stdDeviation="6"
                  floodColor="rgba(110,35,168,0.9)"
                />
              </filter>
            </defs>

            <path
              d="M0,150 Q720,0 1440,150"
              stroke="rgb(107,33,168)"
              strokeWidth="5"
              fill="none"
              filter="url(#purple-shadow-dark)"
            />
          </svg>
        </div>

        <div className="mt-5 flex justify-center flex-col">
          <div className="text-2xl font-bold text-center mb-2 text-sky-200">
            Meet Our Chai Expert
          </div>

          <div className="flex justify-around mb-10">
            <div className="flex items-center flex-col justify-center w-1/3 text-center">
              <div className="flex items-center ml-10 m-4 bg-blue-800 rounded-[50%] w-40 h-[160px]">
                <img
                  src="man.gif"
                  alt=""
                  className="relative bg-transparent w-full h-full object-cover rounded-[50%]"
                />
              </div>
              <div>
                <span className="text-blue-300 text-[20px] font-bold  mb-6">
                  Connect to Expert
                </span>
                <p className="text-blue-200 text-sm">
                  Get personalized advice from our chai expert.
                </p>
              </div>
            </div>

            <div className="flex items-center flex-col justify-center w-1/3 text-center">
              <div className="flex items-center ml-10 m-4 bg-blue-800 rounded-[50%] w-40 h-[160px]">
                <img
                  src="money.gif"
                  alt=""
                  className="relative bg-transparent w-50 rounded-[50%] h-[160px]"
                />
              </div>
              <div>
                <span className="text-blue-300 text-[20px] font-bold  mb-6">
                  Fund Yourself
                </span>
                <p className="text-blue-200 text-sm">
                  Get the funds you need to bring your chai project to life.
                </p>
              </div>
            </div>

            <div className="flex items-center flex-col justify-center w-1/3 text-center">
              <div className="flex items-center ml-10 m-4 bg-blue-800 rounded-[50%] w-40 h-[160px]">
                <img
                  src="group.gif"
                  alt=""
                  className="relative bg-transparent w-full rounded-[50%] h-full object-cover"
                />
              </div>
              <div>
                <span className="text-blue-300 text-[20px] font-bold  mb-6">
                  Fans want to help
                </span>
                <p className="text-blue-200 text-sm">
                  Join our community of chai lovers and get the support you
                  need.
                </p>
              </div>
            </div>
          </div>

          <div className="relative flex items-center justify-center h-screen bg-transparent">
            <div className="relative w-60 h-60">
              <img
                src="women.gif"
                alt="Meditating Woman"
                className="object-contain rounded-full h-full w-full"
              />
            </div>

            {/* Top */}
            <div className="absolute top-5 w-60 h-35 text-white bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 shadow-lg font-medium rounded-lg text-[16px] px-5 py-2.5 text-center cursor-pointer move-top">
              ☀️ <b className="text-yellow-200">Boosts immunity</b> – Spices
              like ginger, cinnamon, and cardamom strengthen your body’s
              defenses.
            </div>

            {/* Top Right */}
            <div className="absolute top-20 right-26 w-60 h-35 text-white bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 shadow-lg font-medium rounded-lg text-[16px] px-5 py-2.5 text-center cursor-pointer move-top-right">
              🌿 <b className="text-yellow-200">Improves focus</b> – Mild
              caffeine and L-theanine in tea promote calm alertness.
            </div>

            {/* Right */}
            <div className="absolute right-10 w-60 h-35 text-white bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 shadow-lg font-medium rounded-lg text-[16px] px-5 py-2.5 text-center cursor-pointer move-right">
              🍃 <b className="text-yellow-200">Aids digestion</b> – Ginger and
              black pepper help improve gut health and reduce bloating.
            </div>

            {/* Bottom Right */}
            <div className="absolute bottom-20 right-26 w-60 h-35 text-white bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 shadow-lg font-medium rounded-lg text-[16px] px-5 py-2.5 text-center cursor-pointer move-bottom-right">
              🛌 <b className="text-yellow-200">Relieves stress</b> – Warm
              spices and aroma help you relax and unwind.
            </div>

            {/* Bottom */}
            <div className="absolute bottom-5 w-60 h-35 text-white bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 shadow-lg font-medium rounded-lg text-[16px] px-5 py-2.5 text-center cursor-pointer move-bottom">
              ⚡ <b className="text-yellow-200">Enhances energy</b> – Black tea
              provides a gentle caffeine boost without jitters.
            </div>

            {/* Bottom Left */}
            <div className="absolute bottom-20 left-26 w-60 h-35 text-white bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 shadow-lg font-medium rounded-lg text-[16px] px-5 py-2.5 text-center cursor-pointer move-bottom-left">
              🩺 <b className="text-yellow-200">Supports heart health</b> –
              Antioxidants may help improve circulation and reduce cholesterol.
            </div>

            {/* Left */}
            <div className="absolute left-10 w-60 h-35 text-white bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 shadow-lg font-medium rounded-lg text-[16px] px-5 py-2.5 text-center cursor-pointer move-left">
              💖 <b className="text-yellow-200">Reduces inflammation</b> –
              Antioxidant-rich spices help fight inflammation in the body.
            </div>

            {/* Top Left */}
            <div className="absolute top-20 left-26 w-60 h-35 text-white bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 shadow-lg font-medium rounded-lg text-[16px] px-5 py-2.5 text-center cursor-pointer move-top-left">
              🦴 <b className="text-yellow-200">Strengthens bones</b> – Calcium
              in milk chai supports bone health.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
