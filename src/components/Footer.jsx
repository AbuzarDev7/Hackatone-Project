import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
       
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} QubeTicket. All rights reserved.
          </p>
          
        
          <p className="text-gray-400 text-sm">
            Made with  by{" "}
            <span className="text-emerald-400 font-semibold">Abuzar</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;