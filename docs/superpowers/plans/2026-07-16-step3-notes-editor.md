# Step 3: Notes editor simplification + link fix — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A minimal, working notes editor: Tiptap slimmed to StarterKit + Link + Placeholder, a link button that actually works, and the dead `onAddLink` prop threading deleted.

**Architecture:** `RichTextEditor` becomes self-contained: it owns the link dialog and applies links itself (to the selection when one exists, else by inserting linked text). `NotesModal` owns its draft state, seeded from the assessment; `AssessmentsTable` shrinks to "which assessment's notes are open" plus a save handler. The two broken link paths (the `callback("", "")` stub and the `setState(fn)`-as-updater bug) disappear with the plumbing that hosted them.

**Tech Stack:** Tiptap 2 (`@tiptap/react`, `starter-kit`, `extension-link`, `extension-placeholder`, `pm`), existing modal recipe per standards.md.

## Global Constraints

- Same as step 1 (`2026-07-16-step1-motion-and-semester-flicker.md`): standards.md rules, verification loop from `asetta/`, no agent git operations, no test framework.
- Existing notes were saved as HTML and may contain `text-align` styles or underline tags; without those extensions Tiptap silently drops the attributes on load — acceptable, no migration.

---

### Task 1: Slim the editor and fix the link dialog

**Files:**
- Modify: `package.json` (via `npm uninstall @tiptap/extension-underline @tiptap/extension-text-align`)
- Modify: `src/types/editor.ts`
- Rewrite: `src/components/editor/RichTextEditor.tsx`

**Interfaces:**
- Produces: `RichTextEditorProps` = `{ content: string; onChange: (content: string) => void; placeholder?: string }` (no `onAddLink`). Task 2's `NotesModal` renders `<RichTextEditor content onChange placeholder />`.

- [ ] **Step 1: Uninstall the dead extensions**

Run: `npm uninstall @tiptap/extension-underline @tiptap/extension-text-align`
Expected: both removed from `package.json`; lockfile updated.

- [ ] **Step 2: Update the props type**

`src/types/editor.ts` becomes:

```ts
export interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}
```

- [ ] **Step 3: Rewrite the editor**

Replace `src/components/editor/RichTextEditor.tsx` in full. Key changes from the old file:
Underline/TextAlign extensions and align buttons gone; `onAddLink`/`linkCallback` gone (the
`setLinkCallback(fn)` updater bug with them); the link dialog is owned here and hides its
text field when linking a selection; toolbar = bold, italic, bullet list, numbered list,
link, undo, redo. LinkModal is rendered conditionally (its `isOpen` prop goes away).

```tsx
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { ReactNode, useState } from "react";
import { Bold, Italic, Link2, List, ListOrdered, Redo2, Undo2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { RichTextEditorProps } from "../../types/editor";

interface LinkModalProps {
  hasSelection: boolean;
  onClose: () => void;
  onSubmit: (url: string, text: string) => void;
}

const LinkModal = ({ hasSelection, onClose, onSubmit }: LinkModalProps) => {
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    onSubmit(url, text);
    onClose();
  };

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
          {/* Linking selected text needs no display text; the selection is the text */}
          {!hasSelection && (
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
          )}
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
}: RichTextEditorProps) => {
  const [showLinkModal, setShowLinkModal] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  const handleAddLink = (url: string, text: string) => {
    if (editor.state.selection.empty) {
      editor
        .chain()
        .focus()
        .insertContent({
          type: "text",
          text: text || url,
          marks: [{ type: "link", attrs: { href: url } }],
        })
        .run();
    } else {
      // extendMarkRange lets a click inside an existing link retarget the whole link
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
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
          onClick={() => setShowLinkModal(true)}
          title="Add link"
          active={editor.isActive("link")}
        >
          <Link2 className="size-4" aria-hidden />
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
      </div>
      <EditorContent editor={editor} className="p-4" />
      {showLinkModal && (
        <LinkModal
          hasSelection={!editor.state.selection.empty}
          onClose={() => setShowLinkModal(false)}
          onSubmit={handleAddLink}
        />
      )}
    </div>
  );
};

export default RichTextEditor;
```

- [ ] **Step 4: Verify** — `npm run lint && npx tsc --noEmit` fails at this point is EXPECTED
(NotesModal/AssessmentsTable still pass `onAddLink`); proceed to Task 2, which removes those.

---

### Task 2: NotesModal owns its draft; AssessmentsTable slims

**Files:**
- Modify: `src/components/tables/assessments/NotesModal.tsx`
- Modify: `src/components/tables/AssessmentsTable.tsx`

**Interfaces:**
- Produces: `NotesModalProps` = `{ assessment: Assessment; onClose: () => void; onSave: (notes: string) => void }`.

- [ ] **Step 1: NotesModal**

- Add `import { useState } from "react";` and seed a draft: `const [draft, setDraft] = useState(assessment.notes ?? "");`
- Props interface becomes `{ assessment, onClose, onSave }` (delete `notesInput`, `onNotesChange`, `onAddLink`).
- `handleCopy` reads `draft` instead of `notesInput`.
- Editor usage: `<RichTextEditor content={draft} onChange={setDraft} placeholder="Add your notes here..." />`
- Save button: `onClick={() => onSave(draft)}`.

- [ ] **Step 2: AssessmentsTable**

- Delete state: `notesInput`, `showNotesModal`; keep `selectedAssessment` as the single "notes modal open for this assessment" driver.
- Delete `handleAddLink` entirely.
- `handleNotesClick` becomes: `setSelectedAssessment(assessment);`
- `handleSaveNotes` takes the draft and closes the modal itself:

```ts
const handleSaveNotes = async (notes: string) => {
  if (!user || !selectedAssessment?.id) return;
  try {
    const assessmentRef = getAssessmentDocRef(user.uid, semesterId, selectedAssessment.id);

    // Strip tags to detect visually-empty notes; empty notes remove the field
    const strippedContent = notes.replace(/<[^>]*>/g, "").trim();
    const updateData =
      strippedContent === ""
        ? { updatedAt: new Date(), notes: null }
        : { notes, updatedAt: new Date() };

    await updateDoc(assessmentRef, updateData);
    onStatusChange?.(selectedAssessment.id, selectedAssessment.status);
    setSelectedAssessment(null);
  } catch (error) {
    console.error("Error saving notes:", error);
  }
};
```

- Render block becomes:

```tsx
{selectedAssessment && (
  <NotesModal
    assessment={selectedAssessment}
    onClose={() => setSelectedAssessment(null)}
    onSave={handleSaveNotes}
  />
)}
```

- [ ] **Step 3: Confirm the plumbing is gone**

Run: `Grep pattern "onAddLink|notesInput|showNotesModal" path src`
Expected: zero hits.

- [ ] **Step 4: Verify** — `npm run lint && npx tsc --noEmit` clean.

---

### Task 3: Verification loop + manual QA

- [ ] **Step 1:** `npm run lint && npm run format:check && npx tsc --noEmit && npm run build` — all green. Run `npm run format` first if Prettier complains.
- [ ] **Step 2: Manual QA** (`npm run dev`, both themes):
  1. Open notes on an assessment; type text, bold/italic/lists work; toolbar shows exactly 7 buttons.
  2. Link with no selection: dialog shows URL + text fields; submitting inserts linked text that opens the URL.
  3. Link with text selected: dialog shows URL only; submitting turns the selection into a link.
  4. Save persists after reload; Cancel discards; clearing all text and saving removes the note icon state.
  5. Old notes that had centered/underlined text still open fine (formatting simply dropped).
- [ ] **Step 3:** Hand off for commit (suggested: `refactor: slim notes editor to essentials and fix link insertion`). Note: teammates/other machines need `npm install` after pulling.
