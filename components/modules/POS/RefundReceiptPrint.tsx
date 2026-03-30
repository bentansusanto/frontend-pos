"use client";

interface RefundReceiptPrintProps {
  order: any;
  refund: {
    id: string;
    amount: number;
    reason: string;
    refundedAt: string | Date;
    paymentMethod: string;
    stripeRefundId?: string;
    cashierName?: string;
  };
  branch?: any;
  cashierName?: string;
}

export const RefundReceiptPrint = ({ 
  order, 
  refund, 
  branch, 
  cashierName 
}: RefundReceiptPrintProps) => {
  if (!order || !refund) return null;

  return (
    <div id="receipt-print-refund" className="hidden print:block p-6 font-mono text-xs leading-tight text-black bg-white w-[80mm] mx-auto shadow-sm">
      {/* Brand Header */}
      <div className="flex flex-col items-center mb-6">
        <div className="border-2 border-black p-1 mb-2 font-black text-lg tracking-tighter px-3">
          {branch?.name?.toUpperCase() || "NEXUS POS"}
        </div>
        <p className="text-[9px] uppercase font-bold tracking-widest opacity-80 mb-1">Official Refund Slip</p>
        <div className="text-[9px] text-center leading-snug max-w-[200px]">
          {branch?.address || "123 Business Street, Jakarta"}
          <br />
          Tel: {branch?.phone || "+62 21 555 0123"}
        </div>
      </div>

      {/* Refund ID Header */}
      <div className="bg-black text-white text-center py-1.5 mb-4 rounded-sm">
        <h2 className="text-xs font-black tracking-widest uppercase">Refund Successful</h2>
        <p className="text-[8px] font-mono opacity-90 tracking-normal">REF ID: {refund.id}</p>
      </div>

      {/* Transaction Details */}
      <div className="space-y-1.5 mb-6 border-b border-dashed border-black pb-4 text-[9px]">
        <div className="flex justify-between">
          <span className="font-bold">DATE:</span>
          <span>{new Date(refund.refundedAt).toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-bold">STAFF:</span>
          <span>{refund.cashierName || cashierName || "System Admin"}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-bold">CUSTOMER:</span>
          <span>{order.customer?.name || "Global Walk-in"}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-bold">PAYMENT:</span>
          <span className="capitalize">{refund.paymentMethod?.replace("_", " ")}</span>
        </div>
        <div className="flex justify-between border-t border-dotted border-black pt-1 mt-1">
          <span className="font-bold">ORIGINAL ORD:</span>
          <span>#{order.invoiceNumber || order.invoice_number || order.orderId}</span>
        </div>
        {refund.stripeRefundId && (
          <div className="mt-2 bg-gray-50 border border-black/10 p-1.5 rounded-sm">
            <span className="font-black block text-[7px] mb-0.5">STRIPE REFERENCE:</span>
            <span className="text-[7px] break-all opacity-80 leading-none">{refund.stripeRefundId}</span>
          </div>
        )}
      </div>

      {/* Returned Items Table */}
      <div className="mb-6">
        <div className="flex justify-between font-black text-[9px] border-b border-black pb-1 mb-2">
          <span>ITEM DESCRIPTION</span>
          <span>TOTAL</span>
        </div>
        <div className="space-y-3">
          {order.items?.map((item: any, index: number) => (
            <div key={item.id || index} className="space-y-0.5">
              <div className="flex justify-between items-start leading-none">
                <span className="font-medium mr-2">
                  {item.product_name || item.productName || "Product"}
                  {item.variant_name && !item.variant_name.toLowerCase().includes("default") && ` (${item.variant_name})`}
                </span>
                <span className="font-bold">-${Number(item.subtotal || 0).toFixed(2)}</span>
              </div>
              <div className="text-[8px] opacity-70">
                {item.qty} UNIT(S) @ ${Number(item.price || 0).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Section */}
      <div className="border-y-2 border-black py-3 mb-6 space-y-1 bg-gray-50/50">
        <div className="flex justify-between text-base font-black">
          <span>TOTAL REFUND</span>
          <span>-${Number(refund.amount).toFixed(2)}</span>
        </div>
        <div className="text-[7px] italic text-center opacity-60">Amount returned to original source of payment</div>
      </div>

      {/* Refund Reason */}
      <div className="mb-6 text-center italic text-[9px]">
        <div className="font-black not-italic text-[7px] opacity-40 mb-1 tracking-widest uppercase">Adjustment Note</div>
        "{refund.reason || "Standard Product Return"}"
      </div>

      {/* Barcode Simulation & Footer */}
      <div className="flex flex-col items-center space-y-4 pt-4 border-t border-dashed border-black">
        {/* Simple SVG Barcode Simulation */}
        <div className="w-full flex justify-center opacity-80 h-10 overflow-hidden">
          <svg viewBox="0 0 100 10" preserveAspectRatio="none" className="w-[80%] h-full">
            <rect x="0" width="1" height="10" fill="black" />
            <rect x="2" width="2" height="10" fill="black" />
            <rect x="5" width="1" height="10" fill="black" />
            <rect x="7" width="3" height="10" fill="black" />
            <rect x="11" width="1" height="10" fill="black" />
            <rect x="13" width="2" height="10" fill="black" />
            <rect x="18" width="1" height="10" fill="black" />
            <rect x="21" width="3" height="10" fill="black" />
            <rect x="25" width="2" height="10" fill="black" />
            <rect x="29" width="1" height="10" fill="black" />
            <rect x="32" width="4" height="10" fill="black" />
            <rect x="38" width="1" height="10" fill="black" />
            <rect x="42" width="2" height="10" fill="black" />
            <rect x="46" width="3" height="10" fill="black" />
            <rect x="51" width="1" height="10" fill="black" />
            <rect x="54" width="2" height="10" fill="black" />
            <rect x="58" width="1" height="10" fill="black" />
            <rect x="62" width="3" height="10" fill="black" />
            <rect x="67" width="2" height="10" fill="black" />
            <rect x="71" width="1" height="10" fill="black" />
            <rect x="74" width="4" height="10" fill="black" />
            <rect x="81" width="1" height="10" fill="black" />
            <rect x="84" width="2" height="10" fill="black" />
            <rect x="88" width="3" height="10" fill="black" />
            <rect x="94" width="1" height="10" fill="black" />
            <rect x="97" width="2" height="10" fill="black" />
          </svg>
        </div>
        
        <div className="text-center">
          <p className="text-[10px] font-black tracking-widest bg-black text-white px-3 py-0.5 rounded-full inline-block">
            VERIFIED VOID
          </p>
          <p className="text-[7px] mt-2 opacity-50 uppercase leading-relaxed font-bold">
            Audit Internal • Transaksi Terotomasi
            <br />
            Nexus Technology Suite v2.1
          </p>
        </div>
      </div>
    </div>
  );
};
