"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { trackInquirySubmit } from "@/lib/analytics";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  phone: z.string().optional(),
  inquiryType: z.enum(
    ["Charter", "Yacht Management", "Cinematography", "Brandwave", "General"],
    { message: "Please select an inquiry type" }
  ),
  preferredDate: z.string().optional(),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message must be less than 2000 characters"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

const inquiryOptions = [
  "Charter",
  "Yacht Management",
  "Cinematography",
  "Brandwave",
  "General",
] as const;

const inputClasses =
  "w-full rounded-lg border border-white/10 bg-navy-800 px-4 py-3 text-white placeholder:text-white/30 text-sm transition-colors focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500/50";

const labelClasses = "block text-sm font-medium text-white/70 mb-2";

const errorClasses = "mt-1.5 text-xs text-red-400 flex items-center gap-1";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      inquiryType: undefined,
      preferredDate: "",
      message: "",
    },
  });

  async function onSubmit() {
    // Simulate network delay for UX feedback
    await new Promise((resolve) => setTimeout(resolve, 1000));
    trackInquirySubmit();
    setSubmitted(true);
    reset();
  }

  if (submitted) {
    return (
      <div className="rounded-2xl bg-navy-800 border border-white/5 p-8 sm:p-12 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-gold-500/10 flex items-center justify-center mb-6">
          <CheckCircle className="w-8 h-8 text-gold-500" />
        </div>
        <h3 className="font-heading text-2xl font-bold text-white mb-3">
          Message Sent
        </h3>
        <p className="text-white/60 leading-relaxed max-w-md mx-auto">
          Thank you for reaching out. Our team will get back to you within 24
          hours. For urgent inquiries, please reach us via WhatsApp.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-8 text-sm text-gold-400 hover:text-gold-300 transition-colors cursor-pointer underline underline-offset-4"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="rounded-2xl bg-navy-800 border border-white/5 p-6 sm:p-8 lg:p-10 space-y-6"
    >
      {/* Name & Email row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className={labelClasses}>
            Full Name <span className="text-gold-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            placeholder="Your name"
            className={cn(inputClasses, errors.name && "border-red-400/50")}
            {...register("name")}
          />
          {errors.name && (
            <p className={errorClasses}>
              <AlertCircle className="w-3 h-3" />
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="email" className={labelClasses}>
            Email Address <span className="text-gold-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            className={cn(inputClasses, errors.email && "border-red-400/50")}
            {...register("email")}
          />
          {errors.email && (
            <p className={errorClasses}>
              <AlertCircle className="w-3 h-3" />
              {errors.email.message}
            </p>
          )}
        </div>
      </div>

      {/* Phone & Inquiry Type row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="phone" className={labelClasses}>
            Phone Number
          </label>
          <input
            id="phone"
            type="tel"
            placeholder="+971 50 000 0000"
            className={inputClasses}
            {...register("phone")}
          />
        </div>

        <div>
          <label htmlFor="inquiryType" className={labelClasses}>
            Inquiry Type <span className="text-gold-500">*</span>
          </label>
          <select
            id="inquiryType"
            className={cn(
              inputClasses,
              "appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23C9A84C%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[position:right_12px_center] bg-no-repeat pr-10",
              errors.inquiryType && "border-red-400/50"
            )}
            defaultValue=""
            {...register("inquiryType")}
          >
            <option value="" disabled>
              Select type
            </option>
            {inquiryOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors.inquiryType && (
            <p className={errorClasses}>
              <AlertCircle className="w-3 h-3" />
              {errors.inquiryType.message}
            </p>
          )}
        </div>
      </div>

      {/* Preferred Date */}
      <div>
        <label htmlFor="preferredDate" className={labelClasses}>
          Preferred Date
        </label>
        <input
          id="preferredDate"
          type="date"
          className={cn(inputClasses, "[color-scheme:dark]")}
          {...register("preferredDate")}
        />
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className={labelClasses}>
          Message <span className="text-gold-500">*</span>
        </label>
        <textarea
          id="message"
          rows={5}
          placeholder="Tell us about your charter requirements, preferred dates, number of guests, or any special requests..."
          className={cn(
            inputClasses,
            "resize-y min-h-[120px]",
            errors.message && "border-red-400/50"
          )}
          {...register("message")}
        />
        {errors.message && (
          <p className={errorClasses}>
            <AlertCircle className="w-3 h-3" />
            {errors.message.message}
          </p>
        )}
      </div>

      {/* Submit */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-navy-950/30 border-t-navy-950 rounded-full animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Send Message
          </>
        )}
      </Button>

      <p className="text-center text-xs text-white/30">
        We typically respond within 24 hours. For urgent inquiries, use
        WhatsApp.
      </p>
    </form>
  );
}
