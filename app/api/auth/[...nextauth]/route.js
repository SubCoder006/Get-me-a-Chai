import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import clientPromise from "@/utils/mongodb";

const authOptions = {
  providers: [
    // ✅ Credentials provider for username/password
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
        email: { label: "Email", type: "email" },
      },
      async authorize(credentials) {
        try {
          console.log("🔐 Credentials authorization attempt:", {
            username: credentials.username,
            email: credentials.email
          });

          if (!credentials.username || !credentials.password || !credentials.email) {
            throw new Error("Username, email, and password are required");
          }

          const client = await clientPromise;
          const db = client.db();
          const users = db.collection("users");

          // 🔄 Check if user exists by email
          let user = await users.findOne({ email: credentials.email });
          console.log("👤 User lookup result:", user ? "Found" : "Not found");

          if (!user) {
            // 🆕 Create new user
            console.log("📝 Creating new user");
            const insertResult = await users.insertOne({
              username: credentials.username,
              password: credentials.password,
              email: credentials.email,
              createdAt: new Date(),
            });
            
            user = {
              _id: insertResult.insertedId,
              username: credentials.username,
              email: credentials.email,
            };
            console.log("✅ New user created:", user._id.toString());
          } else {
            // 🔐 Verify password
            if (user.password !== credentials.password) {
              console.log("❌ Password verification failed");
              throw new Error("Invalid password");
            }
            
            // 🔄 Update last login
            await users.updateOne(
              { _id: user._id },
              { $set: { lastLogin: new Date() } }
            );
            console.log("✅ Existing user authenticated");
          }

          return {
            id: user._id.toString(),
            name: user.username,
            email: user.email,
          };
        } catch (err) {
          console.error("❌ Authorization error:", err);
          throw err;
        }
      },
    }),
    // ✅ OAuth providers
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    GoogleProvider({
  clientId: process.env.GOOGLE_ID,
  clientSecret: process.env.GOOGLE_SECRET,
  authorization: {
    params: {
      prompt: "select_account", // ← This forces account selection
      access_type: "offline",
      response_type: "code"
    }
  },
  profile(profile) {
    return {
      id: profile.sub,
      name: profile.name,
      email: profile.email,
      image: profile.picture,
    };
  }
}),
  ],

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // ✅ ADD THIS: Cookie settings for better persistence
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      }
    }
  },

  callbacks: {
    async redirect({ url, baseUrl }) {
      console.log("🔄 Redirect callback:", { url, baseUrl });
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    
    async signIn({ user, account, profile }) {
      console.log("🔑 SignIn callback:", {
        provider: account?.provider,
        email: user?.email,
        name: user?.name
      });
      
      // Handle OAuth providers
      if (account && (account.provider === "github" || account.provider === "google")) {
        try {
          const client = await clientPromise;
          const db = client.db();
          const users = db.collection("users");
          
          // Check if user exists by email
          let existingUser = await users.findOne({ email: user.email });
          
          if (!existingUser) {
            // Create new user for OAuth
            const cleanUsername = user.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
            
            const insertResult = await users.insertOne({
              username: cleanUsername,
              displayName: user.name || profile?.name || cleanUsername,
              email: user.email,
              provider: account.provider,
              providerId: account.providerAccountId,
              image: user.image || profile?.picture,
              createdAt: new Date(),
              lastLogin: new Date(),
            });
            
            user.id = insertResult.insertedId.toString();
            user.name = cleanUsername;
            console.log("✅ New OAuth user created:", user.id);
          } else {
            // Update existing user
            await users.updateOne(
              { _id: existingUser._id },
              { 
                $set: { 
                  lastLogin: new Date(),
                } 
              }
            );
            
            user.id = existingUser._id.toString();
            user.name = existingUser.username || user.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
            console.log("✅ Existing OAuth user updated:", user.id);
          }
          
          return true;
        } catch (error) {
          console.error("❌ Error handling OAuth user:", error);
          return false;
        }
      }
      
      return true;
    },
    
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.image;
      }
      console.log("📊 Session callback:", {
        userId: session?.user?.id,
        email: session?.user?.email
      });
      return session;
    },
    
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.image = user.image;
        console.log("🎫 JWT token created/updated for user:", user.email);
      }
      return token;
    },
  },

  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };