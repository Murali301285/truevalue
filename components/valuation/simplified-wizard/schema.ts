import * as z from "zod";

export const simplifiedValuationSchema = z.object({
  // Step 1: Business Info
  sector: z.string().min(1, "Please select a sector"),
  age: z.enum(["0-3", "3-7", "7+"]),
  revenue: z.preprocess((val) => (val === "" || isNaN(Number(val)) || typeof val === 'undefined' ? undefined : Number(val)), z.number().min(0, "Revenue cannot be negative")),
  ebitda: z.preprocess((val) => (val === "" || isNaN(Number(val)) || typeof val === 'undefined' ? undefined : Number(val)), z.number().optional().nullable()),

  // Step 2: Value Drivers
  revenueGrowth: z.enum(["Low", "Medium", "High"]).optional(),
  profitMargin: z.enum(["Low", "Medium", "High"]).optional(),
  businessStability: z.enum(["Low", "Medium", "High"]).optional(),
});

export type SimplifiedValuationFormData = z.infer<typeof simplifiedValuationSchema>;

export const STEPS = [
  { id: 1, title: "Tell us about your business", description: "Let's start with the basics to understand your industry and size." },
  { id: 2, title: "Key value drivers", description: "Tell us how your business performs on these key metrics to refine your valuation." },
  { id: 3, title: "Review & Payment", description: "Confirm your details to unlock your comprehensive valuation report." },
  { id: 4, title: "Valuation Report", description: "Explore your estimated enterprise value." }
];
