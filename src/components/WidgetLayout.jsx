import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useAuth } from "../context/AuthContext.jsx";
import {
  getPageLayout,
  updatePageLayout,
  debouncedUpdatePageLayout,
  resetPageLayout,
} from "../firebase/widgetLayouts";
import { message } from "antd";

const WidgetLayout = ({ pageId, onLayoutChange }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [columns, setColumns] = useState(4);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLayout = async () => {
      if (user) {
        try {
          const layout = await getPageLayout(user.uid, pageId);
          setItems(layout.widgets);
          setColumns(layout.columns);
          if (onLayoutChange) {
            onLayoutChange(layout);
          }
        } catch (error) {
          console.error("Error loading layout:", error);
          message.error("Failed to load layout");
        }
      }
      setLoading(false);
    };

    loadLayout();
  }, [user, pageId, onLayoutChange]);

  const onDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;

    // If dropped in the same position, don't do anything
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    try {
      const columnsArray = distributeItems();
      const sourceColumnIndex = parseInt(source.droppableId);
      const destColumnIndex = parseInt(destination.droppableId);

      // Get source and destination items
      const sourceItems = [...columnsArray[sourceColumnIndex]];
      const destItems =
        sourceColumnIndex === destColumnIndex
          ? sourceItems
          : [...columnsArray[destColumnIndex]];

      // Remove the dragged item from source
      const [draggedItem] = sourceItems.splice(source.index, 1);

      // Update positions for source items
      sourceItems.forEach((item, idx) => {
        item.position = idx;
      });

      // Insert the dragged item at destination
      draggedItem.column = destColumnIndex;
      draggedItem.position = destination.index;
      destItems.splice(destination.index, 0, draggedItem);

      // Update positions for destination items
      destItems.forEach((item, idx) => {
        item.position = idx;
      });

      // Update the columns array
      columnsArray[sourceColumnIndex] = sourceItems;
      if (sourceColumnIndex !== destColumnIndex) {
        columnsArray[destColumnIndex] = destItems;
      }

      // Flatten and update all positions
      const updatedItems = columnsArray.flat().map((item, idx) => ({
        ...item,
        globalPosition: idx,
      }));

      // Update local state immediately
      setItems(updatedItems);

      if (user) {
        // Use debounced update for Firebase
        debouncedUpdatePageLayout(user.uid, pageId, {
          widgets: updatedItems,
          columns: columns,
        });
      }
    } catch (error) {
      console.error("Error updating layout:", error);
      message.error("Failed to update layout");
    }
  };

  const distributeItems = () => {
    const columnsArray = Array.from({ length: columns }, () => []);

    // Create a copy and sort by column and position
    const itemsToDistribute = [...items].sort((a, b) => {
      if (a.column === b.column) {
        return (a.position || 0) - (b.position || 0);
      }
      return (a.column || 0) - (b.column || 0);
    });

    // Distribute items to columns
    itemsToDistribute.forEach((item) => {
      // Ensure column is valid
      const targetColumn = Math.min(Math.max(0, item.column || 0), columns - 1);
      columnsArray[targetColumn].push({
        ...item,
        column: targetColumn,
        position: columnsArray[targetColumn].length,
      });
    });

    return columnsArray;
  };

  const handleResetLayout = async () => {
    try {
      if (user) {
        const defaultLayout = await resetPageLayout(user.uid, pageId);
        setItems(defaultLayout.widgets);
        setColumns(defaultLayout.columns);
        if (onLayoutChange) {
          onLayoutChange(defaultLayout);
        }
        message.success("Layout has been reset to default");
      }
    } catch (error) {
      console.error("Error resetting layout:", error);
      message.error("Failed to reset layout");
    }
  };

  if (loading) {
    return <div>Loading layout...</div>;
  }

  const columnsArray = distributeItems();

  return (
    <div className="widget-layout">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="widget-columns" style={{ display: "flex", gap: "1rem" }}>
          {columnsArray.map((column, columnIndex) => (
            <div
              key={columnIndex}
              className="widget-column"
              style={{ flex: 1, minWidth: 0 }}
            >
              <Droppable droppableId={columnIndex.toString()}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="widget-list"
                  >
                    {column.map((item, index) => (
                      <Draggable
                        key={item.id}
                        draggableId={item.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="widget-item"
                            style={{
                              ...provided.draggableProps.style,
                              marginBottom: "1rem",
                            }}
                          >
                            {/* Render your widget component here */}
                            <div className="widget-content">
                              <h3>{item.name}</h3>
                              {/* Add your widget content here */}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
      <button onClick={handleResetLayout} className="reset-layout-btn">
        Reset Layout
      </button>
    </div>
  );
};

export default WidgetLayout; 