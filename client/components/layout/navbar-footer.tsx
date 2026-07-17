"use client";

import React from "react";
import Navbar from "../landing/navbar";
import Footer from "../landing/footer";
import { usePathname } from "next/navigation";

const NavbarFooter = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/dashboard");

  if (isDashboard) {
    return children;
  }
  
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
};

export default NavbarFooter;
