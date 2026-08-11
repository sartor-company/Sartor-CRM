import React, { useEffect, useRef } from 'react';

const Comparison = () => {
  const elementsRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    elementsRef.current.forEach(el => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const capabilities = [
    // SALES & PIPELINE
    { category: "SALES & PIPELINE" },
    { name: "Pipeline", field: true, depot: true, crm360: true },
    { name: "Leads Management", field: true, depot: true, crm360: true },
    { name: "Customer Management", field: true, depot: true, crm360: true },

    // ORDERS & FULFILMENT
    { category: "ORDERS & FULFILMENT" },
    { name: "LPOs (Local Purchase Orders)", field: true, depot: true, crm360: true },
    { name: "Invoices", field: true, depot: true, crm360: true },
    { name: "Goods Returns", field: true, depot: true, crm360: true },
    { name: "LPO Queue", field: false, depot: true, crm360: true },
    { name: "Pack LPOs", field: false, depot: true, crm360: true },
    { name: "Deliveries", field: false, depot: true, crm360: true },

    // FIELD OPERATIONS
    { category: "FIELD OPERATIONS" },
    { name: "Store Visits", field: true, depot: true, crm360: true },
    { name: "Market Intelligence", field: true, depot: true, crm360: true },
    { name: "Merchandiser Dashboard", field: true, depot: true, crm360: true },

    // INVENTORY
    { category: "INVENTORY" },
    { name: "Product Catalog", field: true, depot: true, crm360: true },
    { name: "Receive Stock / GRN", field: false, depot: true, crm360: true },
    { name: "Reorder Alerts", field: false, depot: true, crm360: true },
    { name: "Stock Reconciliation", field: false, depot: false, crm360: true },

    // WAREHOUSE & DISTRIBUTION
    { category: "WAREHOUSE & DISTRIBUTION" },
    { name: "Warehouses (Multi-location)", field: false, depot: true, crm360: true },
    { name: "Drivers", field: false, depot: true, crm360: true },
    { name: "Suppliers", field: false, depot: true, crm360: true },

    // FINANCE
    { category: "FINANCE" },
    { name: "My Commissions (Individual)", field: true, depot: true, crm360: true },
    { name: "Finance Dashboard / Payment Queue", field: false, depot: true, crm360: true },
    { name: "Commissions (Aggregate Management)", field: false, depot: true, crm360: true },

    // REPORTING
    { category: "REPORTING" },
    { name: "Dashboard", field: true, depot: true, crm360: true },
    { name: "Reports & Analytics", field: true, depot: true, crm360: true },

    // TEAM MANAGEMENT
    { category: "TEAM MANAGEMENT" },
    { name: "Team Management", field: true, depot: true, crm360: true },

    // TOOLS
    { category: "TOOLS" },
    { name: "Barcode Generator", field: false, depot: true, crm360: true },
    { name: "QR Code Generator (DORA Verification)", field: false, depot: false, crm360: true },

    // PLATFORM
    { category: "PLATFORM" },
    { name: "Sartor-Chain (Track & Trace)", field: false, depot: false, crm360: true },
    { name: "DORA AI (Product Intelligence & Protection)", field: false, depot: false, crm360: true },
    { name: "Custom Verification Domains & Subdomains", field: false, depot: false, crm360: true },
  ];

  return (
    <section id="compare" className="px-[5%] py-[100px]">
      <div className="reveal max-w-[580px] mb-16" ref={el => elementsRef.current[0] = el}>
        <div className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-orange mb-4">
          <div className="w-5 h-[2px] bg-orange rounded-sm"></div>
          Compare
        </div>
        <h2 className="font-syne text-[clamp(28px,4vw,46px)] font-extrabold tracking-[-0.03em] leading-[1.1] mb-4" style={{ color: 'var(--white)' }}>Why CRM 360?</h2>
        <p className="text-[17px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          No other platform combines supply chain visibility, field oversight, product protection, and consumer intelligence in a single product built for African FMCG and pharma.
        </p>
      </div>

      <div className="reveal overflow-x-auto" ref={el => elementsRef.current[1] = el}>
        <table style={{ borderColor: 'var(--border)' }} className="w-full border-collapse border-[0.5px] rounded-[20px] overflow-hidden min-w-[800px]">
          <thead>
            <tr>
              <th style={{ background: 'var(--navy-mid)', borderColor: 'var(--border)', color: 'var(--white)' }} className="p-4 px-6 font-syne text-[14px] font-bold text-left border-b w-[30%]">Capability</th>
              <th style={{ background: 'var(--navy-mid)', borderColor: 'var(--border)', color: 'var(--white)' }} className="p-4 px-6 font-syne text-[14px] font-bold text-center border-b">CRM Field</th>
              <th style={{ background: 'var(--navy-mid)', borderColor: 'var(--border)', color: 'var(--white)' }} className="p-4 px-6 font-syne text-[14px] font-bold text-center border-b">CRM Depot</th>
              <th style={{ background: 'rgba(255, 92, 53, 0.08)', borderColor: 'rgba(255, 92, 53, 0.2)', color: 'var(--orange)' }} className="p-4 px-6 font-syne text-[14px] font-bold text-center border-b"> CRM 360 (Full)</th>
            </tr>
          </thead>
          <tbody>
            {capabilities.map((item, i) => {
              if (item.category) {
                return (
                  <tr key={i}>
                    <td
                      colSpan={4}
                      style={{
                        background: "var(--navy-mid)",
                        color: "var(--orange)",
                        borderColor: "var(--border)",
                      }}
                      className="px-6 py-3 text-xs font-bold tracking-[0.12em]"
                    >
                      {item.category}
                    </td>
                  </tr>
                );
              }

              return (
                <tr
                  key={i}
                  style={{ borderColor: "var(--border)" }}
                  className="border-b hover:opacity-80 transition-opacity"
                >
                  <td
                    style={{
                      color: "var(--white)",
                      borderColor: "var(--border)",
                    }}
                    className="p-3.5 px-6 text-[14px] border-b font-medium"
                  >
                    {item.name}
                  </td>

                  <td
                    style={{ borderColor: "var(--border)" }}
                    className="p-3.5 px-6 border-b text-center"
                  >
                    <Check active={item.field} />
                  </td>

                  <td
                    style={{ borderColor: "var(--border)" }}
                    className="p-3.5 px-6 border-b text-center"
                  >
                    <Check active={item.depot} />
                  </td>

                  <td
                    style={{
                      background: "rgba(255,92,53,0.05)",
                      borderColor: "var(--border)",
                    }}
                    className="p-3.5 px-6 border-b text-center"
                  >
                    <Check active={item.crm360} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};

const Check = ({ active }) => (
  active ? (
    <span style={{ background: 'rgba(29, 184, 122, 0.15)', borderColor: 'rgba(29, 184, 122, 0.35)' }} className="inline-flex w-[22px] h-[22px] rounded-full border items-center justify-center">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#1DB87A" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
    </span>
  ) : (
    <span style={{ background: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text-muted)' }} className="inline-flex w-[22px] h-[22px] rounded-full border items-center justify-center text-[13px]">
      —
    </span>
  )
);

export default Comparison;
