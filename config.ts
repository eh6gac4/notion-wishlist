export const config = {
  auth: {
    username: process.env.APP_USERNAME ?? "",
    password: process.env.APP_PASSWORD ?? "",
  },
} as const;
