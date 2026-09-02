import React from 'react';
import { Link } from 'wouter';

export default function Footer() {
  return (
    <footer className="bg-[#112244] text-white py-3 px-4 mt-auto w-full">
      <div className="w-full max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-lg font-bold">Bet Master League</h2>
            <p className="text-xs text-gray-300">App di pronostici sportivi</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3 text-xs">
            <Link href="/support/terms" className="text-gray-300 hover:text-white">
              Termini e condizioni
            </Link>
            <Link href="/support/privacy" className="text-gray-300 hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/support/regolamento" className="text-gray-300 hover:text-white">
              Regolamento
            </Link>
          </div>
        </div>
        
        <div className="mt-3 text-xs text-center text-gray-300">
          <p>© {new Date().getFullYear()} Bet Master League. Tutti i diritti riservati.</p>
          <p className="mt-1">
            Questo è un gioco di puro intrattenimento. Non sono coinvolti soldi veri.
          </p>
        </div>
      </div>
    </footer>
  );
}