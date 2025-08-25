import clientPromise from "@/utils/mongodb";

export async function POST(req) {
  try {
    const supporterData = await req.json();
    
    const client = await clientPromise;
    const db = client.db();
    const supporters = db.collection("supporters");
    const users = db.collection("users");
    
    // Add timestamp
    supporterData.createdAt = new Date();
    supporterData.status = "completed";
    
    // Insert the supporter data
    const result = await supporters.insertOne(supporterData);
    
    // Try to update or create user in users collection
    try {
      const userUpdate = {
        $set: {
          username: supporterData.username,
          email: supporterData.userEmail,
          displayName: supporterData.username, // Use username as display name
          updatedAt: new Date()
        },
        $setOnInsert: {
          createdAt: new Date()
        }
      };
      
      await users.updateOne(
        { 
          $or: [
            { username: supporterData.username },
            { email: supporterData.userEmail }
          ]
        },
        userUpdate,
        { upsert: true }
      );
    } catch (userError) {
      console.warn("Could not update users collection:", userError);
      // Continue even if user update fails
    }
    
    return Response.json({ 
      success: true, 
      supporterId: result.insertedId 
    });
    
  } catch (error) {
    console.error("Error saving supporter:", error);
    return Response.json({ 
      success: false, 
      error: "Failed to save supporter data" 
    }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");
    const email = searchParams.get("email");
    
    if (!username && !email) {
      return Response.json({ 
        success: false, 
        error: "Username or email parameter is required" 
      }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db();
    const supporters = db.collection("supporters");
    
    // Find supporters for this user
    const query = {};
    if (username) query.username = username;
    if (email) query.userEmail = email;
    
    const userSupporters = await supporters
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();
    
    return Response.json({ 
      success: true, 
      supporters: userSupporters 
    });
    
  } catch (error) {
    console.error("Error fetching supporters:", error);
    return Response.json({ 
      success: false, 
      error: "Failed to fetch supporters" 
    }, { status: 500 });
  }
}