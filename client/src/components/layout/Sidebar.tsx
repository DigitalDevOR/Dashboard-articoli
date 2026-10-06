import { Globe, ShieldCheck, Upload, Users, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useCurrentUser } from "../../queries/auth.queries";
import { hasPermission } from "../../lib/permissions";

const links = [
    { href: "/upload-articoli", label: "Upload articoli", icon: Upload },
    { href: "/gestione-utenti", label: "Gestione utenti", icon: Users, requiredPermission: "user:read" },
    { href: "/gestione-ruoli", label: "Gestione Ruoli Utente", icon: ShieldCheck, requiredPermission: "permission:assign" },
    { href: "/gestione-siti-wordpress", label: "Gestione siti WordPress", icon: Globe, requiredPermission: "site:read" },
];

type SidebarProps = {
    isOpen: boolean;
    onClose: () => void;
};

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const [location] = useLocation();
    const currentUserQuery = useCurrentUser();
    const visibleLinks = links.filter(
        (link) => !link.requiredPermission || hasPermission(currentUserQuery.data, link.requiredPermission),
    );

    return (
        <aside
            className={`fixed inset-y-0 left-0 z-40 w-64 border-r bg-card transition-transform duration-200 lg:translate-x-0 ${
                isOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >
            <div className="flex h-16 items-center border-b px-6">
                <span className="text-lg font-semibold text-primary">Articoli</span>
                <button
                    type="button"
                    className="ml-auto rounded-md p-2 text-muted-foreground hover:bg-muted lg:hidden"
                    aria-label="Chiudi menu"
                    onClick={onClose}
                >
                    <X className="h-5 w-5" />
                </button>
            </div>
            <nav className="space-y-1 p-4">
                {visibleLinks.map(({ href, label, icon: Icon }) => {
                    const active = location === href;

                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                                active
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`}
                            onClick={onClose}
                        >
                            <Icon className="h-4 w-4" />
                            {label}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}