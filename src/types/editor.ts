export interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  onAddLink?: (callback: (url: string, text: string) => void) => void;
}
