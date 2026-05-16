"use server";

import { headers } from "next/headers";
import { rateLimitContact } from "@/lib/rate-limit";
import { Resend } from "resend";
import { contactPageFormSchema } from "@/lib/validations/contact";
import type { ContactPageFormValues } from "@/lib/validations/contact";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendContactEmail(values: ContactPageFormValues): Promise<{ success: boolean; error?: string }> {

    const headersList = await headers();

    let ip = headersList.get("x-forwarded-for");
    if (ip) {
        ip = ip.split(",")[0].trim();
    } else {
        ip = headersList.get("x-real-ip") || "unknown";
    }

    // ip check
    const limited = rateLimitContact(ip);
    if (!limited.ok) {
        return { success: false, error: "Too many requests. Please try again later." };
    }


    // Honeypot check
    if (values.honeypot) {
        return { success: true };
    }

    // Server-side validation
    const result = contactPageFormSchema.safeParse(values);
    if (!result.success) {
        return { success: false, error: "Invalid form data. Please check your inputs." };
    }

    const { name, email, phone, subject, message } = result.data;

    try {
        const data = await resend.emails.send({
            from: "Contact Form <onboarding@resend.dev>",
            to: "bradenns.uwbad@gmail.com",
            subject: `New Inquiry: ${subject}`,
            replyTo: email,
            text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || "Not provided"}\nSubject: ${subject}\n\nMessage:\n${message}`.trim(),
        });

        if (data.error) {
            console.error("Resend error:", data.error);
            return { success: false, error: "Failed to send your message. Please try again." };
        }

        return { success: true };
    } catch (error) {
        console.error("Resend error:", error);
        return { success: false, error: "Failed to send your message. Please try again." };
    }
}
