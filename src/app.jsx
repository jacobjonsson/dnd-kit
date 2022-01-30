import { DndContext, DragOverlay, rectIntersection } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useState } from "react";
import { createPortal, unstable_batchedUpdates } from "react-dom";
import { Container } from "./container";
import { Item } from "./item";
import { SortableContainer } from "./sortable-container";
import { SortableItem } from "./sortable-item";

export function App() {
  const [items, setItems] = useState({});
  const [containers, setContainers] = useState([]);
  const [activeId, setActiveId] = useState(null);

  const findContainer = (id) => {
    if (id in items) {
      return id;
    }

    return Object.keys(items).find((key) => items[key].includes(id));
  };

  const onDragStart = ({ active }) => {
    setActiveId(active.id);
  };

  const onDragOver = ({ active, over }) => {
    const overId = over?.id;

    if (!overId || active.id in items) {
      return;
    }

    const overContainer = findContainer(overId);
    const activeContainer = findContainer(active.id);

    if (!overContainer || !activeContainer) {
      return;
    }

    if (activeContainer !== overContainer) {
      setItems((items) => {
        const activeItems = items[activeContainer];
        const overItems = items[overContainer];
        const overIndex = overItems.indexOf(overId);
        const activeIndex = activeItems.indexOf(active.id);

        let newIndex;

        if (overId in items) {
          newIndex = overItems.length + 1;
        } else {
          const isBelowOverItem =
            over &&
            active.rect.current.translated &&
            active.rect.current.translated.top >
              over.rect.top + over.rect.height;

          const modifier = isBelowOverItem ? 1 : 0;

          newIndex =
            overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
        }

        return {
          ...items,
          [activeContainer]: items[activeContainer].filter(
            (item) => item !== active.id
          ),
          [overContainer]: [
            ...items[overContainer].slice(0, newIndex),
            items[activeContainer][activeIndex],
            ...items[overContainer].slice(
              newIndex,
              items[overContainer].length
            ),
          ],
        };
      });
    }
  };

  const onDragEnd = ({ active, over }) => {
    if (active.id in items && over?.id) {
      setContainers((containers) => {
        const activeIndex = containers.indexOf(active.id);
        const overIndex = containers.indexOf(over.id);

        return arrayMove(containers, activeIndex, overIndex);
      });
    }

    const activeContainer = findContainer(active.id);

    if (!activeContainer) {
      setActiveId(null);
      return;
    }

    const overId = over?.id;
    if (!overId) {
      setActiveId(null);
      return;
    }

    const overContainer = findContainer(overId);
    if (overContainer) {
      const activeIndex = items[activeContainer].indexOf(active.id);
      const overIndex = items[overContainer].indexOf(overId);

      if (activeIndex !== overIndex) {
        setItems((items) => ({
          ...items,
          [overContainer]: arrayMove(
            items[overContainer],
            activeIndex,
            overIndex
          ),
        }));
      }
    }

    setActiveId(null);
  };

  const renderContainerDragOverlay = (id) => {
    return (
      <Container label={id}>
        {items[id].map((item) => (
          <Item>{item}</Item>
        ))}

        <button
          type="button"
          className="flex items-center justify-center w-full px-4 py-4 border border-gray-400 border-dashed rounded"
        >
          Add
        </button>
      </Container>
    );
  };

  const renderItemDragOverlay = (id) => {
    return <Item>{id}</Item>;
  };

  const onAddContainer = () => {
    let newContainerId;
    if (containers.length === 0) {
      newContainerId = "A";
    } else {
      const lastContainerId = Object.keys(items).sort().slice(-1)[0];
      newContainerId = String.fromCharCode(
        lastContainerId.charCodeAt(0) + 1
      ).toUpperCase();
    }

    unstable_batchedUpdates(() => {
      setItems((prev) => ({ ...prev, [newContainerId]: [] }));
      setContainers((prev) => [...prev, newContainerId]);
    });
  };

  const onAddItem = (containerId) => {
    setItems((prev) => {
      const containerItems = prev[containerId];
      let newItemId;
      if (containerItems.length === 0) {
        newItemId = `${containerId}1`;
      } else {
        const topId = containerItems
          .map((item) => item.substring(1))
          .sort()
          .slice(-1)[0];
        newItemId = `${containerId}${parseInt(topId) + 1}`;
      }

      return {
        ...prev,
        [containerId]: [...prev[containerId], newItemId],
      };
    });
  };

  return (
    <div className="max-w-4xl py-4 mx-auto space-y-4">
      <DndContext
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
        collisionDetection={rectIntersection}
      >
        <SortableContext
          items={containers}
          strategy={verticalListSortingStrategy}
        >
          {containers.map((container) => (
            <SortableContainer
              onAddItem={() => onAddItem(container)}
              key={container}
              id={container}
            >
              <SortableContext
                items={items[container]}
                strategy={verticalListSortingStrategy}
              >
                {items[container].map((item) => (
                  <SortableItem key={item} id={item} />
                ))}
              </SortableContext>
            </SortableContainer>
          ))}
        </SortableContext>

        {createPortal(
          <DragOverlay>
            {activeId
              ? containers.includes(activeId)
                ? renderContainerDragOverlay(activeId)
                : renderItemDragOverlay(activeId)
              : null}
          </DragOverlay>,
          document.body
        )}
      </DndContext>

      <button
        type="button"
        onClick={onAddContainer}
        className="flex items-center justify-center w-full px-4 py-8 border border-gray-400 border-dashed rounded"
      >
        Add
      </button>
    </div>
  );
}
