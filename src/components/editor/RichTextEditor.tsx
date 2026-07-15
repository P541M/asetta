import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { ReactNode, useState } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Link2,
  List,
  ListOrdered,
  Redo2,
  Undo2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { RichTextEditorProps } from "../../types/editor";

interface LinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLink: (url: string, text: string) => void;
}

const LinkModal = ({ isOpen, onClose, onAddLink }: LinkModalProps) => {
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url) {
      onAddLink(url, text || url);
      setUrl("");
      setText("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-150 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-card shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-label="Add link"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pb-1 pt-4">
          <h3 className="text-base font-semibold text-foreground">Add link</h3>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground"
            onClick={onClose}
            aria-label="Close"
          >
            <X aria-hidden />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 px-5 pb-5">
          <div className="space-y-1.5">
            <Label htmlFor="link-url">URL</Label>
            <Input
              type="url"
              id="link-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              autoFocus
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="link-text">Link text (optional)</Label>
            <Input
              type="text"
              id="link-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Display text"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Add link</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface ToolbarButtonProps {
  onClick: () => void;
  title: string;
  /** Toggle state for formatting buttons; omit for plain actions (undo/redo). */
  active?: boolean;
  disabled?: boolean;
  children: ReactNode;
}

/* Active state uses the amber selection tint (standards.md) rather than a surface swap. */
const ToolbarButton = ({ onClick, title, active, disabled, children }: ToolbarButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    aria-label={title}
    aria-pressed={active}
    className={cn(
      "flex size-9 items-center justify-center rounded-lg text-muted-foreground outline-hidden transition-colors",
      "hover:bg-accent hover:text-foreground",
      "focus-visible:ring-2 focus-visible:ring-ring",
      "disabled:pointer-events-none disabled:opacity-50",
      active && "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary",
    )}
  >
    {children}
  </button>
);

const RichTextEditor = ({
  content,
  onChange,
  placeholder = "Start typing...",
  onAddLink,
}: RichTextEditorProps) => {
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkCallback, setLinkCallback] = useState<((url: string, text: string) => void) | null>(
    null,
  );

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder,
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  const handleAddLink = () => {
    if (onAddLink) {
      onAddLink((url, text) => {
        editor.chain().focus().setLink({ href: url }).run();
        if (text) {
          editor.chain().focus().insertContent(text).run();
        }
      });
    } else {
      setLinkCallback((url, text) => {
        editor.chain().focus().setLink({ href: url }).run();
        if (text) {
          editor.chain().focus().insertContent(text).run();
        }
      });
      setShowLinkModal(true);
    }
  };

  return (
    <div className="rich-text-editor">
      <div className="flex flex-wrap gap-1 border-b border-border p-2">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold"
          active={editor.isActive("bold")}
        >
          <Bold className="size-4" aria-hidden />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic"
          active={editor.isActive("italic")}
        >
          <Italic className="size-4" aria-hidden />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet list"
          active={editor.isActive("bulletList")}
        >
          <List className="size-4" aria-hidden />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Numbered list"
          active={editor.isActive("orderedList")}
        >
          <ListOrdered className="size-4" aria-hidden />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          title="Align left"
          active={editor.isActive({ textAlign: "left" })}
        >
          <AlignLeft className="size-4" aria-hidden />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          title="Align center"
          active={editor.isActive({ textAlign: "center" })}
        >
          <AlignCenter className="size-4" aria-hidden />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          title="Align right"
          active={editor.isActive({ textAlign: "right" })}
        >
          <AlignRight className="size-4" aria-hidden />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          title="Undo"
          disabled={!editor.can().undo()}
        >
          <Undo2 className="size-4" aria-hidden />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          title="Redo"
          disabled={!editor.can().redo()}
        >
          <Redo2 className="size-4" aria-hidden />
        </ToolbarButton>
        <ToolbarButton onClick={handleAddLink} title="Add link" active={editor.isActive("link")}>
          <Link2 className="size-4" aria-hidden />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} className="p-4" />
      <LinkModal
        isOpen={showLinkModal}
        onClose={() => {
          setShowLinkModal(false);
          setLinkCallback(null);
        }}
        onAddLink={(url, text) => {
          if (linkCallback) {
            linkCallback(url, text);
          }
        }}
      />
    </div>
  );
};

export default RichTextEditor;
