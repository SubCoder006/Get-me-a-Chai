import clientPromise from "@/utils/mongodb";

export async function GET(request, { params }) {
  try {
    const { email } = params;
    
    if (!email) {
      return Response.json(
        { error: "Email parameter is required" },
        { status: 400 }
      );
    }

    const decodedEmail = decodeURIComponent(email);
    console.log("🔍 Fetching user by email:", decodedEmail);

    const client = await clientPromise;
    const db = client.db();
    const users = db.collection("users");
    const supporters = db.collection("supporters");

    // Find user by email
    const user = await users.findOne({ email: decodedEmail });

    if (!user) {
      console.log("❌ User not found in users collection");
      
      // Try to find user data from supporters collection as fallback
      const supporterData = await supporters.findOne({ userEmail: decodedEmail });
      
      if (supporterData) {
        console.log("✅ Found user data in supporters collection");
        const userSupporters = await supporters
          .find({ userEmail: decodedEmail })
          .sort({ createdAt: -1 })
          .toArray();

        const totalEarnings = userSupporters.reduce((sum, supporter) => {
          return sum + (parseFloat(supporter.amount) || 0);
        }, 0);

        const supporterCount = userSupporters.length;

        return Response.json({
          success: true,
          userInfo: {
            username: supporterData.username || decodedEmail.split('@')[0],
            displayName: supporterData.username || decodedEmail.split('@')[0],
            email: decodedEmail,
            image: null
          },
          supporters: userSupporters,
          stats: {
            totalEarnings,
            supporterCount,
            averageSupport: supporterCount > 0 ? (totalEarnings / supporterCount).toFixed(2) : 0
          }
        });
      }

      return Response.json(
        { 
          success: false,
          error: "User not found",
          userInfo: null
        },
        { status: 404 }
      );
    }

    console.log("✅ User found in users collection:", user.username);

    // Get supporters for this user
    const supportersList = await supporters
      .find({ userEmail: decodedEmail })
      .sort({ createdAt: -1 })
      .toArray();

    console.log("📊 Supporters found:", supportersList.length);

    // Calculate stats
    const totalEarnings = supportersList.reduce((sum, supporter) => {
      return sum + (parseFloat(supporter.amount) || 0);
    }, 0);

    const supporterCount = supportersList.length;

    return Response.json({
      success: true,
      userInfo: {
        username: user.username,
        displayName: user.displayName || user.username,
        email: user.email,
        image: user.image
      },
      supporters: supportersList,
      stats: {
        totalEarnings,
        supporterCount,
        averageSupport: supporterCount > 0 ? (totalEarnings / supporterCount).toFixed(2) : 0
      }
    });

  } catch (error) {
    console.error("❌ Error in /api/user/[email]:", error);
    return Response.json(
      { success: false, error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}

// Optional: Add POST method to create/update user
export async function POST(request, { params }) {
  try {
    const { email } = params;
    const userData = await request.json();

    if (!email) {
      return Response.json(
        { error: "Email parameter is required" },
        { status: 400 }
      );
    }

    const decodedEmail = decodeURIComponent(email);
    const client = await clientPromise;
    const db = client.db();
    const users = db.collection("users");

    const result = await users.updateOne(
      { email: decodedEmail },
      {
        $set: {
          ...userData,
          updatedAt: new Date()
        },
        $setOnInsert: {
          createdAt: new Date()
        }
      },
      { upsert: true }
    );

    return Response.json({
      success: true,
      message: result.upsertedId ? "User created" : "User updated",
      userId: result.upsertedId || decodedEmail
    });

  } catch (error) {
    console.error("❌ Error creating/updating user:", error);
    return Response.json(
      { success: false, error: "Failed to create/update user" },
      { status: 500 }
    );
  }
}