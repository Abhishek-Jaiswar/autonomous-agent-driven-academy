import React from "react";
import Hero from "@/components/landing/hero";
import Features from "@/components/landing/features";

const Home = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-primary/20 selection:text-primary">
      <main className="flex-1">
        <Hero />
        <Features />
      </main>
    </div>
  );
};

export default Home;
