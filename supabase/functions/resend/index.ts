import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Looks up RESEND_API_KEY from Supabase secrets
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const handler = async (_request: Request): Promise<Response> => {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "Peels <team@peels.app>",
      to: ["user@email.net"],
      subject: "Hello World",
      html: "<strong>it works!</strong>",
    }),
  });

  const data = await res.json();

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};

serve(handler);
