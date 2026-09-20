"use client";
import { cn } from "../../libs/utils";

import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IconMenu2, IconX } from "@tabler/icons-react";
import { Link, LinkProps, useLocation } from "react-router-dom";

interface Links {
  label: string;
  href: string;
  icon: React.JSX.Element | React.ReactNode;
  onClick?: () => void;
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate: animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...(props as React.ComponentProps<"div">)} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <>
      <motion.div
        className={cn(
          "h-screen sticky top-0 px-4 py-6 hidden md:flex md:flex-col bg-[#0e111a]/95 border-r border-neutral-800/80 w-[270px] flex-shrink-0 backdrop-blur-xl transition-all duration-300 z-40 overflow-y-auto",
          className
        )}
        animate={{
          width: animate ? (open ? "270px" : "72px") : "270px",
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        {...props}
      >
        {children}
      </motion.div>
    </>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { open, setOpen } = useSidebar();
  return (
    <>
      <div
        className={cn(
          "h-16 px-5 py-4 flex flex-row md:hidden items-center justify-between bg-[#0e111a] border-b border-neutral-800/80 w-full sticky top-0 z-40"
        )}
        {...props}
      >
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm tracking-tight text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            CYBER STORE ADMIN
          </span>
        </div>
        <div className="z-20 flex justify-end">
          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-neutral-200 hover:bg-white/10"
          >
            <IconMenu2 className="w-5 h-5" />
          </button>
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{
                duration: 0.25,
                ease: "easeInOut",
              }}
              className={cn(
                "fixed h-full w-full inset-0 bg-[#090b10]/95 backdrop-blur-2xl p-6 z-[100] flex flex-col justify-between border-r border-neutral-800",
                className
              )}
            >
              <div
                className="absolute z-50 right-6 top-6 p-2 rounded-xl bg-white/5 text-neutral-300 hover:text-white cursor-pointer"
                onClick={() => setOpen(!open)}
              >
                <IconX className="w-5 h-5" />
              </div>
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export const SidebarLink = ({
  link,
  className,
  ...props
}: {
  link: Links;
  className?: string;
  props?: LinkProps;
}) => {
  const { open, animate } = useSidebar();
  const location = useLocation();
  const isActive = link.href === "/"
    ? location.pathname === "/"
    : location.pathname.startsWith(link.href.startsWith("/") ? link.href : `/${link.href}`);

  if (link.onClick) {
    return (
      <button
        onClick={link.onClick}
        className={cn(
          "flex items-center justify-start gap-3 group/sidebar py-2.5 px-3 rounded-xl transition-all duration-200 w-full text-left text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10",
          className
        )}
      >
        {link.icon}
        <motion.span
          animate={{
            display: animate ? (open ? "inline-block" : "none") : "inline-block",
            opacity: animate ? (open ? 1 : 0) : 1,
          }}
          className="text-sm font-medium whitespace-pre inline-block !p-0 !m-0"
        >
          {link.label}
        </motion.span>
      </button>
    );
  }

  return (
    <Link
      to={link.href}
      className={cn(
        "flex items-center justify-start gap-3 group/sidebar py-2.5 px-3 rounded-xl transition-all duration-200",
        isActive
          ? "bg-gradient-to-r from-cyan-500/15 to-blue-500/10 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_-3px_rgba(6,182,212,0.25)] font-semibold"
          : "text-neutral-400 hover:text-neutral-100 hover:bg-white/5",
        className
      )}
      {...props}
    >
      <div className={cn("transition-colors", isActive ? "text-cyan-400" : "text-neutral-400 group-hover/sidebar:text-neutral-200")}>
        {link.icon}
      </div>

      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="text-sm font-medium whitespace-pre inline-block !p-0 !m-0"
      >
        {link.label}
      </motion.span>
    </Link>
  );
};
