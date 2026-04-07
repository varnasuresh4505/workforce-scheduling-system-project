import React from "react";
import Sidebar from "./Sidebar";

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar />

      <main className="ml-0 pt-[76px] md:ml-[280px]">
        <div className="min-h-[calc(100vh-76px)] bg-slate-100">
          {children}
        </div>
      </main>
    </div>
  );
}

export default Layout;