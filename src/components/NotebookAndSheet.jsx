import NotesforNotes from "./NotesforNotes";
import "react-quill/dist/quill.snow.css";
import Excel from "./Excel";
import TodoforTodo from "./TodoforTodo";

const NotebookAndDocumentSheet = () => {
  return (
    <div className="   w-[90vw] mx-auto min-h-screen p-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Main NotePage section - 8 columns on large screens */}
        <div className="lg:col-span-8 overflow-hidden">
          <NotesforNotes inNotebookSheet={true} />
        </div>

        {/* Todo section - 4 columns on large screens */}
        <div className="lg:col-span-4 overflow-hidden">
          <TodoforTodo inNotebookSheet={true} />
        </div>
      </div>
      <div className="overflow-hidden mt-4">
        <Excel />
      </div>
    </div>
  );
};

export default NotebookAndDocumentSheet;
