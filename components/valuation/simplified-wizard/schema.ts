import * as z from "zod";

export const simplifiedValuationSchema = z.object({
  // Step 1: Company Information
  companyName: z.string().min(1, "Company Name is required"),
  sector: z.string().min(1, "Please select an industry sector"),
  legalStructure: z.string().optional(),
  incorporationDate: z.string().optional(),
  pan: z.string().optional(),
  gstNo: z.string().optional(),
  cin: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),

  // Step 2: Financial Details ("Tell us about your business")
  revenue: z.preprocess((val) => (val === "" || isNaN(Number(val)) || typeof val === 'undefined' ? undefined : Number(val)), z.number().min(0, "Revenue cannot be negative")),
  ebitda: z.preprocess((val) => (val === "" || isNaN(Number(val)) || typeof val === 'undefined' ? undefined : Number(val)), z.number().optional().nullable()),
  totalAssets: z.preprocess((val) => (val === "" || isNaN(Number(val)) || typeof val === 'undefined' ? undefined : Number(val)), z.number().min(0, "Assets cannot be negative")),
  totalLiabilities: z.preprocess((val) => (val === "" || isNaN(Number(val)) || typeof val === 'undefined' ? undefined : Number(val)), z.number().min(0, "Liabilities cannot be negative")),
  age: z.enum(["0-3", "3-7", "7+"]), // Keep standard "Age" dropdown for the Math engine
  numberOfEmployees: z.preprocess((val) => (val === "" || isNaN(Number(val)) || typeof val === 'undefined' ? undefined : Number(val)), z.number().optional().nullable()),

  // Step 3: Value Drivers
  revenueGrowth: z.enum(["Low", "Medium", "High"]).optional(),
  profitMargin: z.enum(["Low", "Medium", "High"]).optional(),
  businessStability: z.enum(["Low", "Medium", "High"]).optional(),
});

export type SimplifiedValuationFormData = z.infer<typeof simplifiedValuationSchema>;

export const STEPS = [
  { id: 1, title: "Company Information", description: "Provide your statutory and core business registration details." },
  { id: 2, title: "Tell us about your business", description: "Enter your balance sheet and core operational metrics." },
  { id: 3, title: "Key value drivers", description: "Tell us how your business performs on these key metrics to refine your valuation." },
  { id: 4, title: "Review & Payment", description: "Confirm your details to unlock your comprehensive valuation report." },
  { id: 5, title: "Valuation Report", description: "Explore your estimated enterprise value." }
];
