// The library file, not the package entry: the entry runs pdf-parse's own debug demo (reading a
// test PDF that isn't shipped) whenever it is loaded without a parent module, as Vitest loads it.
import pdfParse from "pdf-parse/lib/pdf-parse.js";

/**
 * The text of an uploaded PDF. pdf-parse's pdf.js (1.10) mishandles a Node Buffer: a small one
 * fails ("bad XRef entry"), and one that is a slice of a shared buffer, as `fs.readFileSync`
 * returns small files, is read from the start of that shared memory, so it can parse as another
 * file's bytes (A44). A plain Uint8Array copy owns exactly the file's bytes.
 */
export async function pdfText(data: Buffer): Promise<string> {
  return (await pdfParse(new Uint8Array(data))).text;
}
