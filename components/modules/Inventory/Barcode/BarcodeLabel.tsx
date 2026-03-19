"use client";

import React from "react";
import Barcode from "react-barcode";

interface BarcodeLabelProps {
  productName: string;
  variantName: string;
  sku: string;
  price: number;
}

export const BarcodeLabel = ({ productName, variantName, sku, price }: BarcodeLabelProps) => {
  return (
    <div className="flex flex-col items-center bg-white p-6 border-2 border-slate-100 rounded-2xl shadow-sm w-full max-w-[320px] mx-auto print:border-none print:shadow-none print:p-0">
      <div className="text-center mb-4">
        <h4 className="text-sm font-black uppercase tracking-tight leading-tight truncate px-2">
          {productName}
        </h4>
        <p className="text-[10px] text-slate-400 font-bold uppercase truncate px-2">
          {variantName}
        </p>
      </div>

      <div className="bg-white py-2 flex justify-center w-full overflow-hidden">
        <Barcode
          value={sku}
          width={1.2}
          height={50}
          fontSize={10}
          margin={0}
          background="transparent"
          displayValue={true}
        />
      </div>

      <div className="mt-2 text-center">
        <p className="text-sm font-black text-slate-900">
          Rp {price.toLocaleString()}
        </p>
      </div>
      
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-label, .printable-label * {
            visibility: visible;
          }
          .printable-label {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
            display: flex;
            justify-content: center;
            align-items: center;
          }
        }
      `}</style>
    </div>
  );
};
