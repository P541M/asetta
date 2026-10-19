// pdf-parse's library file, the same function as the package's entry (see lib/upload/pdfText.ts).
// It hands the data to pdf.js, which takes any Uint8Array, not only a Buffer.
declare module "pdf-parse/lib/pdf-parse.js" {
  import type PdfParse from "pdf-parse";
  export default function pdfParse(
    data: Uint8Array,
    options?: PdfParse.Options,
  ): Promise<PdfParse.Result>;
}
