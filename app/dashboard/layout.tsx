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
      <main className="relative isolate flex-1 overflow-hidden px-[6vw] py-8 pb-24 md:py-10 md:pb-10">
        {/* Fond décoratif — taches de couleur floutées, appliqué à toutes les pages du dashboard */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-[#7D2AE7]/25 blur-3xl dark:bg-[#7D2AE7]/15" />
          <div className="absolute -top-16 right-[-40px] h-80 w-80 rounded-full bg-[#00C4CC]/25 blur-3xl dark:bg-[#00C4CC]/15" />
          <div className="absolute top-72 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[#2A89DA]/20 blur-3xl dark:bg-[#2A89DA]/10" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[#FE6F61]/25 blur-3xl dark:bg-[#FE6F61]/15" />
        </div>

        {children}
      </main>
      <BottomNav />
    </div>
  );
}
