import clientPromise from "@/utils/mongodb";

export async function GET(request, { params }) {
  try {
    const identifier = params.identifier;
    
    if (!identifier) {
      return Response.json(
        { error: "User identifier (username or email) is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();
    const supporters = db.collection("supporters");
    const users = db.collection("users");

    const decodedIdentifier = decodeURIComponent(identifier);
    
    // Try to find user in users collection first
    let user = await users.findOne({
      $or: [
        { username: decodedIdentifier },
        { email: decodedIdentifier }
      ]
    });

    // If user not found in users collection, create a basic user object
    if (!user) {
      user = {
        username: decodedIdentifier,
        email: decodedIdentifier.includes('@') ? decodedIdentifier : null,
        displayName: decodedIdentifier,
        image: null
      };
    }

    // Find supporters for this user using their email or username
    const query = {
      $or: [
        { userEmail: user.email || decodedIdentifier },
        { username: user.username || decodedIdentifier }
      ]
    };

    const supportersList = await supporters
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    // Calculate total earnings
    const totalEarnings = supportersList.reduce((sum, supporter) => {
      return sum + (parseFloat(supporter.amount) || 0);
    }, 0);

    // Get supporter count
    const supporterCount = supportersList.length;

    return Response.json({
      success: true,
      userInfo: {
        username: user.username || decodedIdentifier,
        displayName: user.displayName || decodedIdentifier,
        email: user.email || decodedIdentifier,
        image: user.image || null
      },
      supporters: supportersList,
      stats: {
        totalEarnings: totalEarnings,
        supporterCount: supporterCount,
        averageSupport: supporterCount > 0 ? (totalEarnings / supporterCount).toFixed(2) : 0
      }
    });

  } catch (error) {
    console.error("Error fetching user supporters:", error);
    return Response.json(
      { error: "Failed to fetch supporter data" },
      { status: 500 }
    );
  }
}