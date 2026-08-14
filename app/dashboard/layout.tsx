// app/dashboard/layout.tsx
import DashboardHeader from "./header";
import BottomNav from "./bottom-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F7F8FB] font-sans text-ink dark:bg-[#2F2F2F] dark:text-white">
      <DashboardHeader />
      <main className="flex-1 px-[6vw] py-8 pb-24 md:py-10 md:pb-10">{children}</main>
      <BottomNav />
    </div>
  );
}
