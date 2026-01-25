import React from "react";
import Navbar from "@/components/navbar/Navbar";
import HomeLayout from "@/components/layout/HomeLayout";

export default function Home() {
  return (
    <>
      <Navbar />
      <HomeLayout>
        <h1 className="text-2xl font-bold mb-4">Home Feed</h1>
        <p className="text-gray-500">Main content will go here...</p>
      </HomeLayout>
    </>
  );
}