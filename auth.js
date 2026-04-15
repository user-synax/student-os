import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcryptjs from "bcryptjs";
import connectDB from "./lib/mongodb";
import User from "./models/User";

const config = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        await connectDB();
        const user = await User.findOne({ email: credentials.email });
        
        if (!user) return null;
        
        const isValid = await bcryptjs.compare(credentials.password, user.password);
        if (!isValid) return null;
        
        return { 
          id: user._id.toString(), 
          name: user.name, 
          email: user.email 
        };
      }
    })
  ],
  session: { 
    strategy: "jwt" 
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
      }
      return session;
    }
  },
  pages: { 
    signIn: "/login" 
  }
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);
