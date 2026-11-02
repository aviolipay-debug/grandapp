// app/dashboard/layout.tsx
import DashboardHeader from "./header";
import BottomNav from "./bottom-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F0F0F3] font-sans md:pl-64 text-ink dark:bg-[#2F2F2F] dark:text-white">
      <DashboardHeader />
      <main className="relative isolate flex-1 overflow-hidden px-[6vw] py-8 pb-24 md:px-10 md:py-10 md:pb-10">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
