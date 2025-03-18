
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@1.0.0";

// Initialize Resend with API key from environment variable
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Set up CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  content: string;
  from_name?: string;
  from_email?: string;
  reply_to?: string;
  template_id?: string;
  tracking_id?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the current authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }

    // Parse request body
    const { to, subject, content, from_name, from_email, reply_to, template_id, tracking_id }: EmailRequest = await req.json();
    
    // Validate required fields
    if (!to || !subject || !content) {
      throw new Error('Missing required email fields (to, subject, or content)');
    }

    // Default sender if not specified
    const sender = from_email 
      ? `${from_name || 'Freelance Opportunity Finder'} <${from_email}>` 
      : 'Freelance Opportunity Finder <onboarding@resend.dev>';

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: sender,
      to: [to],
      subject: subject,
      html: content,
      reply_to: reply_to,
      // Include tracking data if provided
      tags: tracking_id ? [{ name: 'tracking_id', value: tracking_id }] : undefined,
    });

    console.log("Email sent successfully:", emailResponse);

    // Return success response with tracking details
    return new Response(JSON.stringify({
      success: true,
      message_id: emailResponse.id,
      tracking_id: tracking_id || null
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error("Error sending email:", error);
    
    // Return error response
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to send email"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
