import { getCompanies } from "@/app/actions/company";
import { getCustomers } from "@/app/actions/customer";
import CustomerPageClient from "@/components/config/customer-page";

export default async function CustomerPage() {
    const customers = await getCustomers();
    const companies = await getCompanies();

    return <CustomerPageClient initialData={customers} companies={companies} />;
}
