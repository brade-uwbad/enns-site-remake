"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ContactFormFields } from "@/components/contact/contact-form-fields";
import { contactPageFormSchema, type ContactPageFormValues } from "@/lib/validations/contact";
import { sendContactEmail } from "@/app/contact/actions";

type Props = {
  /** Short label for the listing, e.g. the street address or title. */
  listingLabel: string;
};

function buildDefaults(listingLabel: string): ContactPageFormValues {
  return {
    name: "",
    email: "",
    phone: "",
    subject: `Inquiry about ${listingLabel}`,
    message: `Hi Brad,\n\nI'm interested in this listing (${listingLabel}). Could you share more details and let me know about next steps?\n\nThanks!`,
    honeypot: "",
  };
}

/**
 * "Contact Brad about this listing" button that opens a modal with the contact
 * form prefilled with the listing's subject and a starter message. Submits
 * through the same server action as the `/contact` page.
 */
export function ListingContactDialog({ listingLabel }: Props) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const defaultValues = useMemo(() => buildDefaults(listingLabel), [listingLabel]);

  const form = useForm<ContactPageFormValues>({
    resolver: zodResolver(contactPageFormSchema),
    defaultValues,
  });

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      // Reset back to a clean, prefilled form once the close animation starts.
      form.reset(defaultValues);
      setStatus("idle");
      setErrorMessage(null);
    }
  };

  const handleSubmit = async (values: ContactPageFormValues) => {
    setStatus("submitting");
    setErrorMessage(null);

    try {
      const result = await sendContactEmail(values);

      if (result.success) {
        setStatus("success");
        form.reset(defaultValues);
      } else {
        setStatus("error");
        setErrorMessage(result.error ?? "Something went wrong.");
      }
    } catch (error) {
      console.error("Listing inquiry error:", error);
      setStatus("error");
      setErrorMessage(
        "Something went wrong sending your message. Please try again, or call directly if it's urgent.",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center justify-center rounded-md border border-sky-600 bg-white px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-sky-700 hover:bg-sky-50"
        >
          Contact Brad about this listing
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        {status === "success" ? (
          <div className="py-4 text-center">
            <DialogTitle className="text-xl">Message sent</DialogTitle>
            <p className="mx-auto mt-3 max-w-sm text-sm text-zinc-600">
              Thanks for reaching out about this listing. Brad will get back to you within a day.
            </p>
            <Button type="button" className="mt-6" onClick={() => handleOpenChange(false)}>
              Done
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Contact Brad about this listing</DialogTitle>
              <DialogDescription>
                Send a message about {listingLabel}. Brad usually replies within a day.
              </DialogDescription>
            </DialogHeader>

            <form noValidate onSubmit={form.handleSubmit(handleSubmit)}>
              <FieldGroup>
                <ContactFormFields
                  form={form}
                  messageRows={4}
                  messageClassName="field-sizing-fixed h-28 resize-none overflow-y-auto"
                />

                {status === "error" && errorMessage && (
                  <div
                    role="alert"
                    className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800"
                  >
                    {errorMessage}
                  </div>
                )}

                <Button type="submit" className="mt-2 w-full" disabled={status === "submitting"}>
                  {status === "submitting" ? "Sending..." : "Send Message"}
                </Button>
              </FieldGroup>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
