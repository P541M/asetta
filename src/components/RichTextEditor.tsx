import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { useState } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  onAddLink?: (callback: (url: string, text: string) => void) => void;
}

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md animate-scale">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Add Link</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700">
              URL
            </label>
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="text" className="block text-sm font-medium text-gray-700">
              Link Text (optional)
            </label>
            <input
              type="text"
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Display text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline py-1.5 px-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary py-1.5 px-4"
            >
              Add Link
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const RichTextEditor = ({ content, onChange, placeholder = 'Start typing...', onAddLink }: RichTextEditorProps) => {
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkCallback, setLinkCallback] = useState<((url: string, text: string) => void) | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder,
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
      <div className="toolbar border-b border-gray-200 p-2 flex flex-wrap gap-2">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded hover:bg-gray-100 ${
            editor.isActive('bold') ? 'bg-gray-100' : ''
          }`}
          title="Bold"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
            <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
          </svg>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded hover:bg-gray-100 ${
            editor.isActive('italic') ? 'bg-gray-100' : ''
          }`}
          title="Italic"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="4" x2="10" y2="4"></line>
            <line x1="14" y1="20" x2="5" y2="20"></line>
            <line x1="15" y1="4" x2="9" y2="20"></line>
          </svg>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded hover:bg-gray-100 ${
            editor.isActive('bulletList') ? 'bg-gray-100' : ''
          }`}
          title="Bullet List"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="9" y1="6" x2="20" y2="6"></line>
            <line x1="9" y1="12" x2="20" y2="12"></line>
            <line x1="9" y1="18" x2="20" y2="18"></line>
            <circle cx="5" cy="6" r="2"></circle>
            <circle cx="5" cy="12" r="2"></circle>
            <circle cx="5" cy="18" r="2"></circle>
          </svg>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded hover:bg-gray-100 ${
            editor.isActive('orderedList') ? 'bg-gray-100' : ''
          }`}
          title="Numbered List"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="10" y1="6" x2="21" y2="6"></line>
            <line x1="10" y1="12" x2="21" y2="12"></line>
            <line x1="10" y1="18" x2="21" y2="18"></line>
            <path d="M4 6h1v4H4z"></path>
            <path d="M4 12h1v4H4z"></path>
            <path d="M4 18h1v4H4z"></path>
          </svg>
        </button>
        <button
          onClick={handleAddLink}
          className={`p-1.5 rounded hover:bg-gray-100 ${
            editor.isActive('link') ? 'bg-gray-100' : ''
          }`}
          title="Add Link"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
        </button>
      </div>
      <EditorContent editor={editor} className="prose max-w-none p-4" />
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