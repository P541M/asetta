export interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}
