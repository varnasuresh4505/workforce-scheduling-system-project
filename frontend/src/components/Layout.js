import React from "react";
import Sidebar from "./Sidebar";

function Layout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-hidden bg-slate-100 p-0">
        {children}
      </div>
    </div>
  );
}

export default Layout;