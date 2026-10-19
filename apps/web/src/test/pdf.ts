/**
 * A minimal one-page PDF with the given lines of text, about 700 bytes: small enough that Node
 * reads it back from disk as a slice of a shared buffer, the case A44 is about.
 */
export function minimalPdf(lines: string[]): Buffer {
  const escape = (text: string) => text.replace(/[\\()]/g, (c) => `\\${c}`);
  const stream = ["BT", "/F1 11 Tf", "14 TL", "50 780 Td"]
    .concat(
      lines.map((line) => `(${escape(line)}) Tj T*`),
      "ET",
    )
    .join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((object, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`).join("");
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  // Memory of its own: Buffer.from would hand back a slice of Node's shared pool (A44)
  const out = Buffer.alloc(pdf.length);
  out.write(pdf, "latin1");
  return out;
}
