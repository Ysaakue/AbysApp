import "next-auth";

declare module "next-auth" {
  interface User {
    locale?: string;
  }
  interface Session {
    user: {
      id: string;
      locale?: string;
    } & import("next-auth").DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    locale?: string;
  }
}
