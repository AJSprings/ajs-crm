import { PageHeader } from "@/components/page-header";
import { CompanyForm } from "../company-form";

export default function NewCompanyPage() {
  return (
    <div>
      <PageHeader title="New company" />
      <div className="max-w-2xl">
        <CompanyForm />
      </div>
    </div>
  );
}
