"use client";
import { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "../ui/sidebar";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Briefcase,
  LineChartIcon as ChartLine,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Settings,
} from "lucide-react";
import { ModeToggle } from "../ui/theme-toggle";

export function SidebarDemo() {
  const links = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard />,
    },
    {
      label: "Chat",
      href: "/chat",
      icon: <MessageCircle />,
    },
    {
      label: "Portfolio",
      href: "/portfolio",
      icon: <Briefcase />,
    },
    {
      label: "Settings",
      href: "/settings",
      icon: <Settings />,
    },
    {
      label: "Logout",
      href: "#",
      icon: <LogOut />,
    },
  ];
  const [open, setOpen] = useState(false);
  return (
    <div
      className={cn(
        "rounded-r-md flex flex-col md:flex-row bg-background mx-auto overflow-hidden shadow-right shadow-lg shadow-foreground/40",
        "h-screen" // for your use case, use `h-screen` instead of `h-[60vh]`
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10 bg-background ">
          {open ? <Logo open={open} /> : <LogoIcon />}
          <div className="flex item-center justify-center flex-col flex-1 overflow-y-auto overflow-x-hidden ">
            <div className="mt-8 flex flex-col gap-2 ">
              {links.map((link, idx) => (
                <SidebarLink
                  key={idx}
                  link={link}
                  className="text-foreground [&_svg]:text-foreground"
                />
              ))}
            </div>
          </div>
          <ModeToggle className="bg-foreground text-background hover:bg-foreground  " />
        </SidebarBody>
      </Sidebar>
    </div>
  );
}

export const Logo = ({ open }: { open?: boolean }) => {
  return (
    <Link
      href="/"
      className="font-normal flex space-x-2 items-center text-sm py-1 relative z-20"
    >
      <div className="h-5 w-6 rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0 bg-foreground text-foreground" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium whitespace-pre text-foreground"
        className="font-medium whitespace-pre text-background"
      >
        Intellytics
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link
      href="/"
      className="font-normal flex space-x-2 items-center text-sm text-foreground py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-foreground rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
      <div className="h-5 w-6 bg-background rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
    </Link>
  );
};
