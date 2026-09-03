/** Client-side LPO export helpers (no extra deps). */

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeCsv(value: unknown) {
  const s = String(value ?? '');
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function downloadLpoExcel(opts: {
  lpoId: string;
  companyName: string;
  customerName: string;
  createdBy: string;
  terms: string;
  status: string;
  rows: Array<{ sku: string; product: string; qty: number; unitPrice: number; subtotal: number }>;
  grandTotal: number;
}) {
  const lines = [
    ['Purchase Order', opts.lpoId],
    ['From', opts.companyName],
    ['Deliver To', opts.customerName],
    ['Created By', opts.createdBy],
    ['Terms', opts.terms],
    ['Status', opts.status],
    [],
    ['SKU', 'Product', 'Qty', 'Unit Price', 'Subtotal'],
    ...opts.rows.map((r) => [r.sku, r.product, r.qty, r.unitPrice, r.subtotal]),
    [],
    ['Grand Total', '', '', '', opts.grandTotal],
  ];
  const csv = lines.map((row) => row.map(escapeCsv).join(',')).join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(`${opts.lpoId || 'lpo'}.csv`, blob);
}

/** Minimal single-page text PDF (Helvetica). */
export function downloadLpoPdf(opts: {
  lpoId: string;
  companyName: string;
  customerName: string;
  createdBy: string;
  terms: string;
  status: string;
  rows: Array<{ sku: string; product: string; qty: number; unitPrice: number; subtotal: number }>;
  grandTotal: number;
}) {
  const lines: string[] = [
    `Purchase Order  ${opts.lpoId}`,
    `From: ${opts.companyName}`,
    `Deliver To: ${opts.customerName}`,
    `Created By: ${opts.createdBy}`,
    `Terms: ${opts.terms}`,
    `Status: ${opts.status}`,
    '',
    'SKU / Product / Qty / Unit / Subtotal',
    ...opts.rows.map(
      (r) =>
        `${r.sku} | ${r.product} | ${r.qty} | ${Number(r.unitPrice).toLocaleString()} | ${Number(r.subtotal).toLocaleString()}`,
    ),
    '',
    `Grand Total: ${Number(opts.grandTotal).toLocaleString()}`,
  ];

  const escapePdf = (s: string) =>
    s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

  const contentParts: string[] = ['BT', '/F1 11 Tf', '50 780 Td', '14 TL'];
  lines.forEach((line, i) => {
    if (i === 0) contentParts.push('/F1 16 Tf', `(${escapePdf(line)}) Tj`, '12 TL', 'T*', '/F1 11 Tf');
    else contentParts.push(`(${escapePdf(line)}) Tj`, 'T*');
  });
  contentParts.push('ET');
  const stream = contentParts.join('\n');

  const objects: string[] = [];
  objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  objects.push('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');
  objects.push(
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n',
  );
  objects.push(`4 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj\n`);
  objects.push('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n');

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  for (const obj of objects) {
    offsets.push(pdf.length);
    pdf += obj;
  }
  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i < offsets.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  downloadBlob(`${opts.lpoId || 'lpo'}.pdf`, new Blob([pdf], { type: 'application/pdf' }));
}
