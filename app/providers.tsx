"use client";
import { useEffect } from "react";
import { initAuthListener } from "@/lib/authListener";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { queryClient } from "@/lib/react-query";

export default function Providers({ children }: { children: ReactNode }) {

  useEffect(() => {
      initAuthListener();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};