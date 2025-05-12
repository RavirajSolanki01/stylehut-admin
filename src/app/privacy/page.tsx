"use client";
import { CentralLoader } from "@/components/Loader";
import Layout from "@/components/Layouts";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Head from "next/head";
import { useEffect, useState } from "react";
import Underline from "@tiptap/extension-underline";
import {
  FaBold,
  FaHeading,
  FaUnderline,
  FaListOl,
  FaListUl,
  FaItalic,
  FaSave,
} from "react-icons/fa";
import apiService from "@/services/base.services";
import { toast } from "react-toastify";
// import TextAlign from "@tiptap/extension-text-align";

// Add page-specific styles
const editorStyles = `
  .tiptap-editor {
    min-height: 500px;
    border: 1px solid #e2e8f0;
    border-radius: 0.375rem;
    padding: 1rem;
    background: white;
    box-sizing: border-box;
  }

  
  .tiptap-editor h1 {
    font-size: 2rem;
    font-weight: 700;
  }
  .tiptap-editor h2 {
    font-size: 1.5rem;
    font-weight: 600;
  }
  .tiptap-editor h3 {
    font-size: 1.25rem;
    font-weight: 500;
  }
  .tiptap-editor h4 {
    font-size: 1rem;
    font-weight: 400;
  }
  .tiptap-editor h5 {
    font-size: 0.875rem;
    font-weight: 300;
  }
  .tiptap-editor h6 {
    font-size: 0.75rem;
    font-weight: 200;
  }
  .tiptap-editor ul {
    list-style-type: disc;
    margin-left: 1.5rem;
  }

  .tiptap-editor ul li {
    margin-bottom: 0.5rem;
  }
  .tiptap-editor ol {
    list-style-type: decimal;
    margin-left: 1.5rem;
  }

  .tiptap-editor ol li {
    margin-bottom: 0.5rem;
  }
`;
const editorStyles2 = `
   
   .custom_data h1 {
    font-size: 2rem;
    font-weight: 700;
  }
   .custom_data h2 {
    font-size: 1.5rem;
    font-weight: 600;
  }
   .custom_data h3 {
    font-size: 1.25rem;
    font-weight: 500;
  }
   .custom_data h4 {
    font-size: 1rem;
    font-weight: 400;
  }
   .custom_data h5 {
    font-size: 0.875rem;
    font-weight: 300;
  }
   .custom_data h6 {
    font-size: 0.75rem;
    font-weight: 200;
  }
   .custom_data ul {
    list-style-type: disc;
    margin-left: 1.5rem;
  }

   .custom_data ul li {
    margin-bottom: 0.5rem;
  }
   .custom_data ol {
    list-style-type: decimal;
    margin-left: 1.5rem;
  }

   .custom_data ol li {
    margin-bottom: 0.5rem;
  }
`;
export default function Privacy() {
  const [isLoading, setIsLoading] = useState(false);
  const [headingLevel, setHeadingLevel] = useState(1);
  const [content, setContent] = useState("");
  const [currentId, setCurrentId] = useState(0);
  const [isEditing, setIsEditing] = useState(false);

  const fetchTerms = async () => {
    try {
      const response: any = await apiService.get("/terms", { withAuth: true });
      const data = response.data;
      console.log(data?.data[0]?.description, ">><< DATSA IS HERE");
      setContent(data?.data[0]?.description);
      setCurrentId(data?.data[0]?.id);
      // return data;
    } catch (error) {
      console.error("Error fetching terms:", error);
      return null;
    }
  };

  const handleSave = async () => {
    try {
      const response = currentId
        ? await apiService.put(
            "/terms",
            { description: editor?.getHTML(), id: currentId },
            { withAuth: true },
          )
        : await apiService.post(
            "/terms",
            { description: editor?.getHTML() },
            { withAuth: true },
          );
      const data = response.data;
      if (data) {
        toast.success("Terms and Conditions updated successfully");
        setIsEditing(false);
        fetchTerms();
      }
    } catch (error) {
      console.error("Error saving terms:", error);
    }
  };
  useEffect(() => {
    fetchTerms();
  }, []);

  const editor = useEditor(
    {
      extensions: [StarterKit, Underline],
      content: content && content,
      editorProps: {
        attributes: {
          class: "tiptap-editor",
        },
      },
      immediatelyRender: false,
    },
    [content],
  );

  if (!editor) return null;

  setTimeout(() => {
    setIsLoading(false);
  }, 1000);

  return (
    <div className="min-h-[500px] rounded-md border border-gray-300 p-4">
      <Head>
        <title>Terms and Conditions</title>
      </Head>
      <CentralLoader loading={isLoading} />

      <Layout>
        {!isEditing ? (
          <>
            <div className="flex flex-col gap-4">
              <button
                onClick={() => setIsEditing(true)}
                className="ml-auto rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              >
                Update
              </button>
              <style jsx global>
                {editorStyles2}
              </style>
              <div
                className="custom_data"
                dangerouslySetInnerHTML={{ __html: content }}
              ></div>
            </div>
          </>
        ) : (
          <>
            <div className="relative flex w-full">
              <button className={`p-2`} title="Heading 1">
                <FaHeading />
              </button>
              <select
                title="Heading Level"
                value={headingLevel}
                onChange={(e) => {
                  const level = Number(e.target.value) as 1 | 2 | 3 | 4 | 5 | 6;
                  setHeadingLevel(level);
                  editor.chain().focus().toggleHeading({ level }).run();
                }}
                className="absolute left-0 top-0 h-full cursor-pointer opacity-0"
              >
                {[1, 2, 3, 4, 5, 6].map((level) => (
                  <option key={level} value={level}>
                    H{level}
                  </option>
                ))}
              </select>
              <button
                title="Bold"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-2 ${editor.isActive("bold") ? "bg-gray-300" : ""}`}
              >
                <FaBold />
              </button>
              <button
                title="Italic"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-2 ${editor.isActive("italic") ? "bg-gray-300" : ""}`}
              >
                <FaItalic />
              </button>
              <button
                title="underline"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={`p-2 ${
                  editor.isActive("underline") ? "bg-gray-300" : ""
                }`}
              >
                <FaUnderline />
              </button>
              <button
                title="Bullet List"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-2 ${
                  editor.isActive("bulletList") ? "bg-gray-300" : ""
                }`}
              >
                <FaListUl />
              </button>
              <button
                title="Ordered List"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-2 ${
                  editor.isActive("orderedList") ? "bg-gray-300" : ""
                }`}
              >
                <FaListOl />
              </button>

              <div className="ml-auto flex gap-2">
                <button
                  className={`rounded-md bg-blue-500 p-2 px-5 text-white hover:bg-blue-600`}
                  title="Save"
                  onClick={handleSave}
                >
                  Save
                </button>
                <button
                  className={`rounded-md bg-red-500 p-2 px-5 text-white hover:bg-red-600`}
                  title="Cancel"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
            <>
              <style jsx global>
                {editorStyles}
              </style>
              <EditorContent editor={editor} />
            </>
          </>
        )}
      </Layout>
    </div>
  );
}
