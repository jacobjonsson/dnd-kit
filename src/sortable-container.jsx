import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Container } from "./container";

export function SortableContainer({ id, children, onAddItem }) {
  const {
    setNodeRef,
    listeners,
    attributes,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Container
      label={id}
      ref={setNodeRef}
      {...attributes}
      listeners={listeners}
      style={style}
      className={isDragging ? "opacity-50" : ""}
    >
      {children}

      <button
        type="button"
        onClick={onAddItem}
        className="flex items-center justify-center w-full px-4 py-4 border border-gray-400 border-dashed rounded"
      >
        Add
      </button>
    </Container>
  );
}
