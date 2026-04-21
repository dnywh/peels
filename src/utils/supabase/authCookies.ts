type CookieLike = {
  name: string;
};

export const hasSupabaseAuthCookie = (cookies: CookieLike[]) =>
  cookies.some(({ name }) => name.includes("auth-token"));
