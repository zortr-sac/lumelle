import { CustomerForm } from "../_components/customer-form";

export const metadata = { title: "Nueva clienta" };

export default function NuevaClientaPage() {
  return (
    <div className="mx-auto max-w-xl">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold tracking-[-0.04em]">
          Nueva clienta
        </h1>
        <p className="text-sm text-muted-foreground">
          Cuanto más sepas de ella, mejor la atiendes.
        </p>
      </header>
      <CustomerForm />
    </div>
  );
}
