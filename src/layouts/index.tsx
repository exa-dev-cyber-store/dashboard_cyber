import icon from "../assets/icon.png";
import { Sidebar, SidebarBody, SidebarLink } from "../components/ui/sidebar";
import {
    IconArrowLeft,
    IconBrandTabler,
    IconBuildingStore,
    IconNotes,
    IconExternalLink,
    IconShieldCheck,
    IconUser,
    IconUsers,
    IconTicket,
} from "@tabler/icons-react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useContext, useState } from "react";
import { useCookies } from "react-cookie";
import { NameProvider } from "@/context";

export default function Layout() {
    const [cookies, , removeCookie] = useCookies(['token', 'admin_name']);
    const nameContext = useContext(NameProvider);
    const navigate = useNavigate();
    const location = useLocation();
    const [open, setOpen] = useState(false);

    const adminName = nameContext?.name || cookies.admin_name || "Admin Cyber";

    const handleLogout = () => {
        removeCookie('token', { path: '/' });
        removeCookie('admin_name', { path: '/' });
        if (nameContext?.setName) {
            nameContext.setName('');
        }
        navigate('/login', { replace: true });
    };

    const links = [
        {
            label: "Dashboard",
            href: "/",
            icon: (
                <IconBrandTabler className="flex-shrink-0 w-5 h-5" />
            ),
        },
        {
            label: "Products",
            href: "/products",
            icon: (
                <IconBuildingStore className="flex-shrink-0 w-5 h-5" />
            )
        },
        {
            label: "Orders",
            href: "/orders",
            icon: (
                <IconNotes className="flex-shrink-0 w-5 h-5" />
            )
        },
        {
            label: "Users",
            href: "/users",
            icon: (
                <IconUsers className="flex-shrink-0 w-5 h-5 text-cyan-400" />
            )
        },
        {
            label: "Vouchers",
            href: "/vouchers",
            icon: (
                <IconTicket className="flex-shrink-0 w-5 h-5 text-amber-400" />
            )
        },
    ];

    const getPageTitle = () => {
        if (location.pathname === "/") return "Overview & Analytics";
        if (location.pathname.startsWith("/products/add")) return "Add New Product";
        if (location.pathname.startsWith("/products/edit")) return "Edit Product";
        if (location.pathname.startsWith("/products")) return "Product Catalog";
        if (location.pathname.startsWith("/orders")) return "Order Management";
        if (location.pathname.startsWith("/users")) return "User Management";
        if (location.pathname.startsWith("/vouchers")) return "Voucher & Promo Generator";
        return "Dashboard";
    };

    return (
        <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#090b10] text-neutral-100 overflow-x-hidden">
            <Sidebar open={open} setOpen={setOpen}>
                <SidebarBody className="justify-between gap-10">
                    <div className="flex flex-col flex-1 overflow-x-hidden overflow-y-auto">
                        {open ? <Logo /> : <LogoIcon />}
                        <div className="flex flex-col gap-1.5 mt-8">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-300 px-3 mb-1">
                                {open ? "Management" : "•••"}
                            </span>
                            {links.map((link, idx) => (
                                <SidebarLink key={idx} link={link} />
                            ))}
                        </div>

                        <div className="mt-8 pt-4 border-t border-neutral-800/60 flex flex-col gap-1.5">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-300 px-3 mb-1">
                                {open ? "Quick Links" : "•••"}
                            </span>
                            <a
                                href="http://localhost:3001"
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-start gap-3 py-2.5 px-3 rounded-xl text-neutral-400 hover:text-cyan-300 hover:bg-white/5 transition-all text-sm group"
                            >
                                <IconExternalLink className="w-5 h-5 flex-shrink-0 text-neutral-300 group-hover:text-cyan-400" />
                                {open && <span className="text-sm font-medium whitespace-pre">Storefront</span>}
                            </a>
                            <SidebarLink
                                link={{
                                    label: "Logout",
                                    href: "#",
                                    icon: <IconArrowLeft className="flex-shrink-0 w-5 h-5 text-rose-400" />,
                                    onClick: handleLogout,
                                }}
                            />
                        </div>
                    </div>

                    {/* Admin profile pill */}
                    <div className="pt-4 border-t border-neutral-800/80">
                        <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/5">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-md flex-shrink-0">
                                {adminName.charAt(0).toUpperCase()}
                            </div>
                            {open && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col min-w-0"
                                >
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-xs font-semibold text-white truncate max-w-[120px]">
                                            {adminName}
                                        </span>
                                        <IconShieldCheck className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                                    </div>
                                    <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                                        Root Admin
                                    </span>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </SidebarBody>
            </Sidebar>

            {/* Main content viewport */}
            <div className="flex-1 flex flex-col min-w-0 min-h-screen">
                {/* Modern Top Header */}
                <header className="h-16 px-6 lg:px-10 border-b border-neutral-800/70 bg-[#0c0e15]/80 backdrop-blur-xl flex items-center justify-between sticky top-0 z-30">
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                            <h2 className="text-base font-semibold text-white tracking-tight">
                                {getPageTitle()}
                            </h2>
                            <span className="text-[11px] text-neutral-400 hidden sm:inline">
                                Cyber Apple Store Operations &bull; Live Control Center
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <a
                            href={import.meta.env.VITE_STOREFRONT_URL || "http://localhost:3001"}
                            target="_blank"
                            rel="noreferrer"
                            className="hidden sm:flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            Live Store
                            <IconExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <div className="h-4 w-px bg-neutral-800 hidden sm:block" />
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center text-xs font-bold">
                                <IconUser className="w-4 h-4" />
                            </div>
                            <span className="text-xs text-neutral-300 font-medium hidden md:inline">
                                {adminName}
                            </span>
                        </div>
                    </div>
                </header>

                {/* Page Content View */}
                <main className="flex-1 p-6 lg:p-10 max-w-7xl w-full mx-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export const Logo = () => {
    return (
        <Link
            to={"/"}
            className="relative z-20 flex items-center py-1 space-x-3 text-sm font-normal text-white group"
        >
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 p-[1.5px] shadow-[0_0_15px_rgba(6,182,212,0.4)] group-hover:shadow-[0_0_22px_rgba(6,182,212,0.7)] transition-all duration-300 flex items-center justify-center">
                <div className="w-full h-full bg-[#080b11] rounded-[10px] flex items-center justify-center p-1.5">
                    <img src={icon} className="object-contain w-full h-full drop-shadow-[0_0_10px_rgba(6,182,212,0.85)] group-hover:scale-110 transition-transform duration-300" alt="Cyber Apple Logo" />
                </div>
            </div>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col"
            >
                <span className="font-black text-sm tracking-wider text-white uppercase flex items-center gap-1.5">
                    CYBER APPLE
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 tracking-widest shadow-xs">PRO</span>
                </span>
                <span className="text-[10px] text-cyan-400/80 font-medium tracking-wide">Command Center</span>
            </motion.div>
        </Link>
    );
};

export const LogoIcon = () => {
    return (
        <Link
            to={"/"}
            className="relative z-20 flex items-center justify-center py-1 text-sm font-normal text-white group"
        >
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 p-[1.5px] shadow-[0_0_15px_rgba(6,182,212,0.4)] group-hover:shadow-[0_0_22px_rgba(6,182,212,0.7)] transition-all duration-300 flex items-center justify-center">
                <div className="w-full h-full bg-[#080b11] rounded-[10px] flex items-center justify-center p-1.5">
                    <img src={icon} className="object-contain w-full h-full drop-shadow-[0_0_10px_rgba(6,182,212,0.85)] group-hover:scale-110 transition-transform duration-300" alt="Cyber Apple Logo" />
                </div>
            </div>
        </Link>
    );
};
