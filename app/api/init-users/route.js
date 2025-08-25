import clientPromise from "@/utils/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const users = db.collection("users");
    const supporters = db.collection("supporters");

    // Get all unique users from supporters
    const uniqueUsers = await supporters.aggregate([
      {
        $group: {
          _id: {
            username: "$username",
            email: "$userEmail"
          }
        }
      }
    ]).toArray();

    // Insert users into users collection
    for (const user of uniqueUsers) {
      if (user._id.username || user._id.email) {
        await users.updateOne(
          {
            $or: [
              { username: user._id.username },
              { email: user._id.email }
            ]
          },
          {
            $set: {
              username: user._id.username,
              email: user._id.email,
              displayName: user._id.username,
              updatedAt: new Date()
            },
            $setOnInsert: {
              createdAt: new Date()
            }
          },
          { upsert: true }
        );
      }
    }

    const userCount = await users.countDocuments();

    return Response.json({
      success: true,
      message: `Users collection initialized with ${userCount} users`,
      userCount
    });

  } catch (error) {
    console.error("Error initializing users:", error);
    return Response.json(
      { success: false, error: "Failed to initialize users" },
      { status: 500 }
    );
  }
}