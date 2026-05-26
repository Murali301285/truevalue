import { z } from "zod";

export const companySchema = z.object({
    tier: z.string().min(1, "Please select a valuation tier"),
    companyName: z.string().min(1, "Company Name is required"),
    industry: z.string().min(1, "Please select an industry"),

    // New Detailed Fields
    legalStructure: z.string().optional(),
    code: z.string().optional(),
    incorporationDate: z.string().optional(),

    // Address
    addressLine1: z.string().optional(),
    addressLine2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),

    // Statutory
    pan: z.string().optional(),
    gstNo: z.string().optional(),
    cin: z.string().optional(),

    // Custom Fields
    otherIndustry: z.string().optional(),
});

export const financialSchema = z.object({
    revenue: z.coerce.number().min(0, "Revenue must be positive"),
    ebitda: z.coerce.number().min(0, "EBITDA must be positive"),
    pat: z.coerce.number().min(0, "PAT must be positive"),
    totalAssets: z.coerce.number().min(0, "Assets must be positive"),
    totalLiabilities: z.coerce.number().min(0, "Liabilities must be positive"),

    // New Fields
    numberOfEmployees: z.coerce.number().optional(),
    yearsInOperation: z.coerce.number().min(0, "Years must be positive"),
    purpose: z.string().min(1, "Please select a purpose"),
    otherPurpose: z.string().optional(),
}).refine((data) => data.totalAssets >= data.totalLiabilities, {
    message: "Assets can't be less than liabilities",
    path: ["totalAssets"], // This will attach the error to the totalAssets field
});

export const valuationSchema = companySchema.merge(financialSchema);

export type ValuationFormData = z.infer<typeof valuationSchema>;

export const STEPS = [
    { id: 1, title: "Select Tier" },
    { id: 2, title: "Company Information" },
    { id: 3, title: "Financial Details" },
    { id: 4, title: "Review & Payment" },
    { id: 5, title: "Valuation Report" },
];
