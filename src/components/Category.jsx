import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import {
  Card,
  List,
  Button,
  Modal,
  Form,
  Input,
  Space,
  message,
  Typography,
  Tooltip,
  Dropdown,
  Menu,
  Checkbox,
  Row,
  Col,
  Badge,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EllipsisOutlined,
  UnorderedListOutlined,
  AppstoreOutlined,
  PictureOutlined,
  CloudOutlined,
  FullscreenOutlined,
  LinkOutlined,
  GlobalOutlined,
  ArrowsAltOutlined,
} from "@ant-design/icons";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { RxGear } from "react-icons/rx";

const { Title } = Typography;

const Category = ({ data = [] }) => {
  const [user, setUser] = useState(null);
  const [bookmarks, setBookmarks] = useState(data);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = React.useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState(null);
  const [form] = Form.useForm();
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedBookmarks, setSelectedBookmarks] = useState([]);
  const [viewMode, setViewMode] = useState("list");
  const [showUrl, setShowUrl] = useState(false);
  const [iconSize, setIconSize] = useState(28);
  const [gridColumns, setGridColumns] = useState(5);
  const [editModeBookmarks, setEditModeBookmarks] = useState([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const getFaviconUrl = (url) => {
    try {
      if (!url) return "https://www.google.com/favicon.ico";

      // Clean the URL and ensure it has a protocol
      let cleanUrl = url.trim();
      if (!cleanUrl.match(/^https?:\/\//i)) {
        cleanUrl = `http://${cleanUrl}`;
      }

      const urlObj = new URL(cleanUrl);
      const domain = urlObj.hostname;

      // Special handling for WhatsApp
      if (domain.includes("whatsapp.com")) {
        return "https://static.whatsapp.net/rsrc.php/v3/yP/r/rYZqPCBaG70.png";
      }

      // Try multiple favicon services in order
      return [
        // Google t3 service (high quality)
        `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(
          domain
        )}&size=128`,
        // Google s2 service (fallback)
        `https://www.google.com/s2/favicons?domain=${encodeURIComponent(
          domain
        )}&sz=64`,
        // DuckDuckGo service (another fallback)
        `https://icons.duckduckgo.com/ip3/${domain}.ico`,
        // Default favicon path
        `${urlObj.protocol}//${domain}/favicon.ico`,
        // Final fallback
        "https://www.google.com/favicon.ico",
      ][0]; // Start with the first option
    } catch (error) {
      console.error("Error generating favicon URL:", error);
      return "https://www.google.com/favicon.ico";
    }
  };

  const handleFaviconError = async (event, url) => {
    const img = event.target;
    const currentSrc = img.src;

    try {
      // Parse the original URL to get the domain
      const urlObj = new URL(url);
      const domain = urlObj.hostname;

      // List of fallback URLs
      const fallbackUrls = [
        `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(
          domain
        )}&size=128`,
        `https://www.google.com/s2/favicons?domain=${encodeURIComponent(
          domain
        )}&sz=64`,
        `https://icons.duckduckgo.com/ip3/${domain}.ico`,
        `${urlObj.protocol}//${domain}/favicon.ico`,
        "https://www.google.com/favicon.ico",
      ];

      // Find the index of the current failed URL
      const currentIndex = fallbackUrls.indexOf(currentSrc);

      // Try the next URL in the list
      if (currentIndex < fallbackUrls.length - 1) {
        img.src = fallbackUrls[currentIndex + 1];
      } else {
        // If all URLs fail, use the default Google favicon
        img.src = "https://www.google.com/favicon.ico";
      }
    } catch (error) {
      console.error("Error handling favicon fallback:", error);
      img.src = "https://www.google.com/favicon.ico";
    }
  };

  const showLoading = () => {
    setOpen(true);
    setLoading(true);

    // Simple loading mock. You should add cleanup logic in real world.
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  const handleSelect = (id) => {
    setSelectedBookmarks((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    if (user) {
      const unsubscribe = onSnapshot(
        collection(db, "users", user.uid, "bookmarks"),
        (snapshot) => {
          const bookmarkData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            position: doc.data().position || 0,
          }));
          const sortedBookmarks = bookmarkData.sort(
            (a, b) => a.position - b.position
          );
          setBookmarks(sortedBookmarks);
          setLoading(false);
        }
      );
      return () => unsubscribe();
    } else {
      setBookmarks([]);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isEditMode) {
      // Copy bookmarks with their positions to editModeBookmarks
      setEditModeBookmarks(
        bookmarks.map((bookmark, index) => ({
          ...bookmark,
          position: bookmark.position || index,
        }))
      );
    }
  }, [isEditMode, bookmarks]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    if (isEditMode) {
      const items = Array.from(editModeBookmarks);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);

      // Update positions for all items in edit mode
      const updatedItems = items.map((item, index) => ({
        ...item,
        position: index,
      }));

      setEditModeBookmarks(updatedItems);
      setHasUnsavedChanges(true);
    } else {
      const items = Array.from(bookmarks);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);

      // Update positions for immediate visual feedback
      const updatedItems = items.map((item, index) => ({
        ...item,
        position: index,
      }));

      setBookmarks(updatedItems);

      // Update database immediately if not in edit mode
      if (user) {
        const batch = writeBatch(db);
        updatedItems.forEach((bookmark) => {
          const bookmarkRef = doc(
            db,
            "users",
            user.uid,
            "bookmarks",
            bookmark.id
          );
          batch.update(bookmarkRef, { position: bookmark.position });
        });
        batch.commit().catch((error) => {
          console.error("Error updating positions:", error);
          message.error("Failed to update order");
          setBookmarks(bookmarks); // Revert on error
        });
      }
    }
  };

  const handleViewChange = (mode) => {
    setViewMode(mode);
    message.success(`Switched to ${mode} view`);
  };

  const handleShowUrlClick = () => {
    setShowUrl(!showUrl);
  };

  const handleIconSizeChange = (size) => {
    setIconSize(size);
    message.success(`Icon size updated`);
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalVisible(false);
    setEditingBookmark(null);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAddBookmark = async (values) => {
    try {
      if (!user) {
        message.error("Please login first");
        return;
      }

      // Get the highest position
      const maxPosition = bookmarks.reduce(
        (max, bookmark) => Math.max(max, bookmark.position || 0),
        -1
      );

      const bookmarkData = {
        name: values.title,
        link: values.url,
        createdAt: new Date().toISOString(),
        logoUrl: getFaviconUrl(values.url),
        position: maxPosition + 1, // Add at the end
      };

      if (editingBookmark) {
        const bookmarkRef = doc(
          db,
          "users",
          user.uid,
          "bookmarks",
          editingBookmark.id
        );
        await updateDoc(bookmarkRef, bookmarkData);
        message.success("Bookmark updated successfully!");
      } else {
        await addDoc(
          collection(db, "users", user.uid, "bookmarks"),
          bookmarkData
        );
        message.success("Bookmark added successfully!");
      }

      setIsModalVisible(false);
      form.resetFields();
      setEditingBookmark(null);
    } catch (error) {
      console.error("Error adding/updating bookmark:", error);
      message.error("Failed to add/update bookmark");
    }
  };

  const handleDeleteBookmark = async (id) => {
    try {
      await deleteDoc(doc(db, "users", user.uid, "bookmarks", id));

      // Update positions for remaining bookmarks
      const remainingBookmarks = bookmarks
        .filter((b) => b.id !== id)
        .map((bookmark, index) => ({
          ...bookmark,
          position: index,
        }));

      const batch = writeBatch(db);
      remainingBookmarks.forEach((bookmark) => {
        const bookmarkRef = doc(
          db,
          "users",
          user.uid,
          "bookmarks",
          bookmark.id
        );
        batch.update(bookmarkRef, { position: bookmark.position });
      });
      await batch.commit();

      message.success("Bookmark deleted successfully!");
    } catch (error) {
      console.error("Error deleting bookmark:", error);
      message.error("Failed to delete bookmark");
    }
  };

  const handleBulkDelete = async () => {
    try {
      const batch = writeBatch(db);

      // Delete selected bookmarks
      for (const bookmarkId of selectedBookmarks) {
        const bookmarkRef = doc(db, "users", user.uid, "bookmarks", bookmarkId);
        batch.delete(bookmarkRef);
      }

      // Update positions for remaining bookmarks
      const remainingBookmarks = bookmarks
        .filter((b) => !selectedBookmarks.includes(b.id))
        .map((bookmark, index) => ({
          ...bookmark,
          position: index,
        }));

      remainingBookmarks.forEach((bookmark) => {
        const bookmarkRef = doc(
          db,
          "users",
          user.uid,
          "bookmarks",
          bookmark.id
        );
        batch.update(bookmarkRef, { position: bookmark.position });
      });

      await batch.commit();
      setSelectedBookmarks([]);
      message.success("Selected bookmarks deleted successfully!");
    } catch (error) {
      console.error("Error deleting bookmarks:", error);
      message.error("Failed to delete bookmarks");
    }
  };

  const handleSelectAll = () => {
    if (selectedBookmarks.length === bookmarks.length) {
      setSelectedBookmarks([]);
    } else {
      setSelectedBookmarks(bookmarks.map((bookmark) => bookmark.id));
    }
  };

  const handleDeleteSelected = async () => {
    try {
      const batch = writeBatch(db);

      // Delete selected bookmarks
      for (const bookmarkId of selectedBookmarks) {
        const bookmarkRef = doc(db, "users", user.uid, "bookmarks", bookmarkId);
        batch.delete(bookmarkRef);
      }

      // Update positions for remaining bookmarks
      const remainingBookmarks = bookmarks
        .filter((b) => !selectedBookmarks.includes(b.id))
        .map((bookmark, index) => ({
          ...bookmark,
          position: index,
        }));

      remainingBookmarks.forEach((bookmark) => {
        const bookmarkRef = doc(
          db,
          "users",
          user.uid,
          "bookmarks",
          bookmark.id
        );
        batch.update(bookmarkRef, { position: bookmark.position });
      });

      await batch.commit();
      setSelectedBookmarks([]);
      message.success("Selected bookmarks deleted successfully!");
    } catch (error) {
      console.error("Error deleting bookmarks:", error);
      message.error("Failed to delete bookmarks");
    }
  };

  const handleSaveChanges = async () => {
    try {
      if (!user) return;

      const batch = writeBatch(db);

      // Update positions in Firebase
      editModeBookmarks.forEach((bookmark) => {
        const bookmarkRef = doc(
          db,
          "users",
          user.uid,
          "bookmarks",
          bookmark.id
        );
        batch.update(bookmarkRef, { position: bookmark.position });
      });

      await batch.commit();

      // Update main bookmarks state with new positions
      setBookmarks(editModeBookmarks);
      setHasUnsavedChanges(false);
      message.success("Changes saved successfully");
    } catch (error) {
      console.error("Error saving changes:", error);
      message.error("Failed to save changes");
    }
  };

  const handleCancelChanges = () => {
    // Reset edit mode bookmarks to current bookmarks state
    setEditModeBookmarks(
      bookmarks.map((bookmark, index) => ({
        ...bookmark,
        position: bookmark.position || index,
      }))
    );
    setSelectedBookmarks([]);
    setHasUnsavedChanges(false);
    setIsEditMode(false);
  };

  const EditModePanel = () => {
    const isAllSelected = selectedBookmarks.length === editModeBookmarks.length;
    const [panelViewMode, setPanelViewMode] = useState("list");

    const renderBookmarkItem = (bookmark, provided) => {
      return (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`${
            panelViewMode === "list"
              ? "flex items-center space-x-2 w-full"
              : "flex flex-col items-center p-1"
          } border-b rounded-lg cursor-move transition-all
            ${
              selectedBookmarks.includes(bookmark.id)
                ? "bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700"
                : "bg-white dark:bg-[#513a7a] border-gray-200 dark:border-gray-600"
            }
            hover:shadow-md p-1 relative`}
          onClick={() => handleSelect(bookmark.id)}
        >
          <div className={`absolute top-1 right-2 flex gap-2`}>
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setEditingBookmark(bookmark);
                form.setFieldsValue({
                  title: bookmark.name,
                  url: bookmark.link,
                });
                setIsModalVisible(true);
              }}
              className="text-gray-500 hover:text-indigo-500 dark:text-gray-400 dark:hover:text-blue-400"
            />
          </div>
          <span
            {...provided.dragHandleProps}
            className="cursor-move text-gray-400"
          >
            ⋮⋮
          </span>
          <Checkbox
            checked={selectedBookmarks.includes(bookmark.id)}
            className={panelViewMode === "list" ? "flex-shrink-0" : "mb-2"}
            onClick={(e) => e.stopPropagation()}
          />
          <img
            src={bookmark.logoUrl}
            alt=""
            className={`w-5 h-5 ${
              panelViewMode === "list" ? "flex-shrink-0" : "mb-1 mt-1"
            }`}
            onError={(e) => handleFaviconError(e, bookmark.link)}
          />
          <div
            className={`${
              panelViewMode === "list" ? "flex-grow" : "text-center"
            }`}
          >
            <div className="truncate text-sm dark:text-white">
              {bookmark.name}
            </div>
            {/* <div className="text-[12px] text-gray-500 dark:text-gray-400 truncate">
              {bookmark.link}
            </div> */}
          </div>
        </div>
      );
    };

    return (
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity ${
          isEditMode ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-[#513a7a] rounded-lg shadow-xl p-6 w-[90%] max-w-2xl">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex justify-between items-center border-b dark:border-gray-600 pb-2">
              <div className="flex items-center space-x-2">
                <Title level={4} className="dark:text-white m-0">
                  Edit Mode
                </Title>
                {hasUnsavedChanges && (
                  <Badge
                    status="processing"
                    text="Unsaved changes"
                    className="dark:text-gray-300"
                  />
                )}
              </div>
              <Space>
                <Button.Group>
                  <Button
                    type={
                      panelViewMode === "list" ? "bg-indigo-500" : "default"
                    }
                    icon={<UnorderedListOutlined />}
                    onClick={() => setPanelViewMode("list")}
                  />
                  <Button
                    type={
                      panelViewMode === "grid" ? "bg-indigo-500" : "default"
                    }
                    icon={<AppstoreOutlined />}
                    onClick={() => setPanelViewMode("grid")}
                  />
                </Button.Group>
                <Button
                  type="primary"
                  onClick={handleSaveChanges}
                  disabled={!hasUnsavedChanges}
                >
                  Save Changes
                </Button>
                <Button onClick={handleCancelChanges}>Cancel</Button>
              </Space>
            </div>

            {/* Selection Controls */}
            <Row gutter={16} className="mb-2">
              <Col span={4}>
                <Button
                  type="primary"
                  onClick={handleSelectAll}
                  className="w-full"
                >
                  {isAllSelected ? "Deselect All" : "Select All"}
                </Button>
              </Col>
              <Col span={6}>
                <Button
                  danger
                  disabled={selectedBookmarks.length === 0}
                  onClick={handleDeleteSelected}
                  className="w-full"
                >
                  Delete Selected ({selectedBookmarks.length})
                </Button>
              </Col>
            </Row>

            {/* Bookmark List/Grid */}
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="bookmarks">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`${
                      panelViewMode === "list"
                        ? "flex flex-col space-y-1"
                        : "grid grid-cols-2 md:grid-cols-4 gap-3"
                    }`}
                  >
                    {editModeBookmarks.map((bookmark, index) => (
                      <Draggable
                        key={bookmark.id}
                        draggableId={bookmark.id}
                        index={index}
                      >
                        {(provided) => renderBookmarkItem(bookmark, provided)}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>
      </div>
    );
  };

  const { SubMenu } = Menu;

  const renderBookmarks = () => {
    const renderActions = (bookmark) => (
      <Dropdown
        overlay={
          <Menu>
            <Menu.Item key="edit" icon={<EditOutlined />}>
              <Button
                type="text"
                onClick={() => showEditModal(bookmark)}
                className="dark:text-white w-full text-left"
              >
                Edit
              </Button>
            </Menu.Item>

            <Menu.Item key="delete" icon={<DeleteOutlined />} danger>
              <Button
                type="text"
                danger
                onClick={() => handleDeleteBookmark(bookmark.id)}
                className="w-full text-left"
              >
                Delete
              </Button>
            </Menu.Item>

            <Menu.Item key="open" icon={<GlobalOutlined />}>
              <Button
                type="text"
                onClick={() => window.open(bookmark.link, "_blank")}
                className="dark:text-white w-full text-left"
              >
                Open
              </Button>
            </Menu.Item>
          </Menu>
        }
        trigger={["click"]}
      >
        <Button type="text" icon={<EllipsisOutlined />} className="absolute" />
      </Dropdown>
    );

    if (isEditMode) {
      return (
        <div className="space-y-4">
          

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="bookmarks">
              {(provided) => (
                <div
                  className="space-y-2"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {bookmarks.map((bookmark, index) => (
                    <Draggable
                      key={bookmark.id}
                      draggableId={bookmark.id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="p-3 border rounded-lg shadow-sm hover:shadow-md bg-white dark:bg-[#513a7a] flex items-center gap-3"
                        >
                          <Checkbox
                            checked={selectedBookmarks.includes(bookmark.id)}
                            onChange={() => handleSelect(bookmark.id)}
                          />
                          <img
                            src={bookmark.logoUrl}
                            alt={bookmark.name}
                            style={{ width: iconSize, height: iconSize }}
                            className="object-contain"
                            onError={(e) =>
                              handleFaviconError(e, bookmark.link)
                            }
                          />
                          <div className="flex-grow">
                            <div className="font-medium dark:text-white">
                              {bookmark.name}
                            </div>
                            {showUrl && (
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {bookmark.link}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="text"
                              icon={<EditOutlined />}
                              onClick={() => showEditModal(bookmark)}
                              className="dark:text-white"
                            />
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => handleDeleteBookmark(bookmark.id)}
                            />
                            <Button
                              type="text"
                              icon={<GlobalOutlined />}
                              onClick={() =>
                                window.open(bookmark.link, "_blank")
                              }
                              className="dark:text-white"
                            />
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      );
    } else if (viewMode === "list") {
      return (
        <List
          dataSource={bookmarks}
          renderItem={(bookmark) => (
            <List.Item
              key={bookmark.id}
              actions={[
                <Tooltip title="Edit">
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => showEditModal(bookmark)}
                    className="dark:text-white"
                  />
                </Tooltip>,
                <Tooltip title="Delete">
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteBookmark(bookmark.id)}
                  />
                </Tooltip>,
                // <Tooltip title="Open in new tab">
                //   <Button
                //     type="text"
                //     icon={<GlobalOutlined />}
                //     onClick={() => window.open(bookmark.link, "_blank")}
                //     className="dark:text-white"
                //   />
                // </Tooltip>,
              ]}
            >
              <List.Item.Meta
                avatar={
                  <div className="flex gap-2 items-center ">
                     
                  
                  <img
                    src={bookmark.logoUrl}
                    alt="Logo"
                    style={{ width: `${iconSize}px`, height: `${iconSize}px` }}
                    onError={(e) => handleFaviconError(e, bookmark.link)}
                  />
                  <a
                    href={bookmark.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="dark:text-white">{bookmark.name}</div>
                  </a>
                  </div>
                }
                // title={
                 
                // }
                description={
                  showUrl ? (
                    <span className="dark:text-gray-500">{bookmark.link}</span>
                  ) : (
                    ""
                  )
                }
              />
            </List.Item>
          )}
        />
      );
    } else if (viewMode === "grid") {
      return (
        <div>
          <div className="">
            {viewMode === "grid" && (
              <div
                className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4`}
              >
                {bookmarks.map((bookmark) => (
                  <div
                    key={bookmark.id}
                    className="rounded-lg transition-transform duration-300 ease-in-out p-2 cursor-pointer text-center transform hover:scale-105 relative"
                  >
                    <img
                      src={bookmark.logoUrl}
                      alt={bookmark.name}
                      style={{
                        width: `${iconSize}px`,
                        height: `${iconSize}px`,
                      }}
                      className="mb-1 object-contain"
                      onError={(e) => handleFaviconError(e, bookmark.link)}
                    />

                    <a
                      href={bookmark.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <p
                        className="dark:text-white text-sm truncate"
                        style={{
                          maxWidth: `${iconSize * 2}px`,
                        }}
                      >
                        <span className="sm:max-w-[15ch] md:max-w-[25ch] text-[12px] lg:max-w-[35ch] block overflow-hidden text-ellipsis">
                          {bookmark.name.length > 10
                            ? `${bookmark.name.slice(0, 10)}...`
                            : bookmark.name}
                        </span>
                      </p>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    } else if (viewMode === "icon") {
      return (
        <div>
          {/* Edit Button and Dropdown */}

          <div
            style={{
              display: "flex",

              flexWrap: "wrap",

              justifyContent: "center",

              alignItems: "center",
            }}
          >
            {bookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                style={{
                  width: "auto",

                  padding: "10px",

                  borderRadius: "5px",

                  textAlign: "center",

                  cursor: "pointer",

                  margin: "5px",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.transform = "scale(1.1)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                <img
                  src={bookmark.logoUrl}
                  alt={bookmark.name}
                  style={{ width: `${iconSize}px`, height: `${iconSize}px` }}
                  onError={(e) => handleFaviconError(e, bookmark.link)}
                />
              </div>
            ))}
          </div>
        </div>
      );
    } else if (viewMode === "cloud") {
      return (
        <div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "3px",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {bookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                style={{
                  width: "auto",
                  maxWidth: "150px",
                  padding: "1.5px",
                  borderRadius: "3px",
                  border: "1px solid #ccc",
                  transition: "transform 0.3s ease-in-out",
                  cursor: "pointer",
                  margin: "1px",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.transform = "scale(1.1)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                <img
                  src={bookmark.logoUrl}
                  alt={bookmark.name}
                  style={{ width: iconSize, height: iconSize }}
                  className="ml-0.5"
                  onError={(e) => handleFaviconError(e, bookmark.link)}
                />
                <p
                  className="dark:text-white"
                  style={{
                    marginTop: "-1px",
                    marginLeft: "3px",
                    marginRight: "3px",
                  }}
                >
                  {bookmark.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      );
    }
  };

  const viewMenu = (
    <Menu className="w-40">
      {/* View Options */}
      <SubMenu key="view" title="Display">
        <Menu.Item
          key="list"
          icon={<UnorderedListOutlined />}
          onClick={() => handleViewChange("list")}
        >
          List View
        </Menu.Item>

        <Menu.Item
          key="grid"
          icon={<AppstoreOutlined />}
          onClick={() => handleViewChange("grid")}
        >
          Grid View
        </Menu.Item>

        <Menu.Item
          key="icon"
          icon={<PictureOutlined />}
          onClick={() => handleViewChange("icon")}
        >
          Icon-Only View
        </Menu.Item>

        <Menu.Item
          key="cloud"
          icon={<CloudOutlined />}
          onClick={() => handleViewChange("cloud")}
        >
          Cloud View
        </Menu.Item>
      </SubMenu>

      <Menu.Divider />

      {/* URL Toggle */}
      <SubMenu key="details" title="Details">
        <Menu.Item key="toggle-url" type="text" onClick={handleShowUrlClick}>
          <div className="flex items-center justify-between w-full gap-2 -mb-2">
            <img src="/link.png" alt="" className="h-10" />
            <span className="-mt-1.5">{showUrl ? "Hide URL" : "Show URL"}</span>
          </div>
        </Menu.Item>
      </SubMenu>

      <Menu.Divider />

      {/* Icon Size Options */}
      <SubMenu key="space-options" title="Size">
        <Menu.Item
          key="icon-sizes-small"
          onClick={() => handleIconSizeChange(20)}
          icon={<FullscreenOutlined />}
        >
          Small
        </Menu.Item>

        <Menu.Item
          key="icon-sizes-medium"
          onClick={() => handleIconSizeChange(28)}
          icon={<FullscreenOutlined />}
        >
          Medium
        </Menu.Item>

        <Menu.Item
          key="icon-sizes-large"
          onClick={() => handleIconSizeChange(38)}
          icon={<FullscreenOutlined />}
        >
          Large
        </Menu.Item>
      </SubMenu>

      {/* Edit Mode Toggle */}
      <Menu.Divider />

      <div className="">
        <button
          type="text"
          onClick={() => {setIsEditMode(!isEditMode);
             setIsModalVisible(false)}}
          className={`flex justify-start px-3 py-1 hover:bg-zinc-400/10 rounded-[0.2rem] w-full text-left ${isEditMode?"text-red-500 hover:text-red-600":"text-indigo-500 hover:text-indigo-600"}`}
          icon={<EditOutlined />}
          
        >
          {isEditMode ? "Close" : "Edit"}
        </button>
      </div>
    </Menu>
  );

  return (
    <div className="relative">
      <EditModePanel />
      <div className="dark:text-white max-w-sm rounded-lg bg-white dark:bg-[#28283A]">
        <Card
          title={
            <div className="flex justify-between items-center">
              {/* <Title level={4} className="dark:text-white bg-gray-800 m-0">
                My Bookmarks {isEditMode && "(Edit Mode)"}
              </Title> */}
              <div className="flex justify-between w-full items-center">
                <div>
                  <button
                    className=" px-2 py-1 w-fit rounded-md hover:text-indigo-500 hover:bg-gray-100 dark:bg-gray-800 dark:text-white"
                    onClick={() => setIsModalVisible(true)}
                  >
                    <PlusOutlined className="w-7 h-7 px-2  transition-all  " />
                  </button>
                </div>
                <div>
                  <Dropdown overlay={viewMenu} trigger={["click"]}>
                    <button className="hover:bg-gray-100  px-4 py-3 hover:text-indigo-500 rounded-md">
                      <RxGear className=" w-4 h-4   transition-all " />
                    </button>
                  </Dropdown>
                </div>
              </div>
            </div>
          }
          className="dark:bg-[#28283A] border-none"
        >
          {renderBookmarks()}
        </Card>

        <Modal
          title={editingBookmark ? "Edit Bookmark" : "Add New Bookmark"}
          open={isModalVisible}
          onCancel={handleCancel}
          footer={null}
        >
          <Form form={form} layout="vertical" onFinish={handleAddBookmark}>
            <Form.Item
              name="title"
              label="Title"
              rules={[{ required: true, message: "Please enter a title" }]}
            >
              <Input placeholder="Enter bookmark title" />
            </Form.Item>

            <Form.Item
              name="url"
              label="URL"
              rules={[
                { required: true, message: "Please enter a URL" },
                { type: "url", message: "Please enter a valid URL" },
              ]}
            >
              <Input placeholder="https://example.com" />
            </Form.Item>

            <Form.Item className="text-right">
              <Space>
                <Button onClick={handleCancel}>Cancel</Button>
                <Button type="primary" htmlType="submit">
                  {editingBookmark ? "Update" : "Add"}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default Category;
