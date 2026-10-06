import type { ReactNode } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useUiStore } from "../../store/ui.store";

type DashboardLayoutProps = {
    children: ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const isSidebarOpen = useUiStore((state) => state.isSidebarOpen);
    const openSidebar = useUiStore((state) => state.openSidebar);
    const closeSidebar = useUiStore((state) => state.closeSidebar);

    return (
        <div className="min-h-screen bg-background">
            <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
            {isSidebarOpen && (
                <button
                    type="button"
                    className="fixed inset-0 z-30 bg-black/40 lg:hidden"
                    aria-label="Chiudi menu"
                    onClick={closeSidebar}
                />
            )}
            <div className="lg:pl-64">
                <Header onMenuClick={openSidebar} />
                <main className="p-4 sm:p-6 lg:p-8">{children}</main>
            </div>
        </div>
    );
}