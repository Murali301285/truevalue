import { z } from "zod";

export const companySchema = z.object({
    companyName: z.string().min(1, "Company Name is required"),
    industry: z.string().min(1, "Please select an industry"),
    yearsInOperation: z.coerce.number().min(0, "Years must be positive"),
    purpose: z.string().min(1, "Please select a purpose"),
});

export const financialSchema = z.object({
    revenue: z.coerce.number().min(0, "Revenue must be positive"),
    ebitda: z.coerce.number().min(0, "EBITDA must be positive"),
    pat: z.coerce.number().min(0, "PAT must be positive"),
    totalAssets: z.coerce.number().min(0, "Assets must be positive"),
    totalLiabilities: z.coerce.number().min(0, "Liabilities must be positive"),
}).refine((data) => data.totalAssets >= data.totalLiabilities, {
    message: "Assets can't be less than liabilities",
    path: ["totalAssets"], // This will attach the error to the totalAssets field
});

export const valuationSchema = companySchema.merge(financialSchema);

export type ValuationFormData = z.infer<typeof valuationSchema>;

export const STEPS = [
    { id: 1, title: "Company Information" },
    { id: 2, title: "Financial Details" },
    { id: 3, title: "Review & Payment" },
    { id: 4, title: "Valuation Report" },
];
