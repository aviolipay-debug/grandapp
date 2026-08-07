// app/dashboard/layout.tsx
import DashboardHeader from "./header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F7F8FB] font-sans text-ink dark:bg-[#2F2F2F] dark:text-white">
      <DashboardHeader />
      <main className="px-[6vw] py-8 md:py-10">{children}</main>
    </div>
  );
}
