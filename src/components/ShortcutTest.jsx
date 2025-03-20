import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Button, Form, Input, message } from "antd";

const ShortcutTest = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const [userBookmarks, setUserBookmarks] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");

  // Simple authentication check
  useEffect(() => {
    console.log("ShortcutTest component mounted");
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log(
        "Auth state changed:",
        currentUser ? "Logged in" : "Logged out"
      );
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        loadBookmarks(currentUser.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadBookmarks = async (userId) => {
    try {
      console.log("Loading bookmarks for user:", userId);
      const querySnapshot = await getDocs(
        collection(db, "users", userId, "shortcut")
      );
      const bookmarks = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("Loaded bookmarks:", bookmarks);
      setUserBookmarks(bookmarks);
    } catch (error) {
      console.error("Error loading bookmarks:", error);
      message.error("Failed to load bookmarks");
    }
  };

  const handleAddBookmark = async (values) => {
    if (!user) {
      message.error("You must be logged in to add bookmarks");
      return;
    }

    const { name, link } = values;
    console.log("Adding bookmark:", { name, link });

    try {
      const fullLink = link.startsWith("http") ? link : `https://${link}`;

      console.log("Using path:", `users/${user.uid}/shortcut`);
      const docRef = await addDoc(
        collection(db, "users", user.uid, "shortcut"),
        {
          name,
          link: fullLink,
          createdAt: new Date(),
        }
      );

      console.log("Bookmark added with ID:", docRef.id);
      message.success("Bookmark added successfully!");

      // Add to local state
      setUserBookmarks([
        ...userBookmarks,
        { id: docRef.id, name, link: fullLink, createdAt: new Date() },
      ]);

      // Reset form
      form.resetFields();
    } catch (error) {
      console.error("Error adding bookmark:", error);
      setErrorMsg(`Error: ${error.message}`);
      message.error("Failed to add bookmark");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Shortcut Test</h2>

      {user ? (
        <div className="mb-4">
          <p className="text-green-600 mb-2">✓ Logged in as: {user.email}</p>
        </div>
      ) : (
        <p className="text-red-600 mb-4">
          Not logged in. Please log in to add bookmarks.
        </p>
      )}

      <div className="mb-6">
        <h3 className="font-semibold mb-2">Add Bookmark</h3>
        <Form form={form} layout="vertical" onFinish={handleAddBookmark}>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please enter a name" }]}
          >
            <Input placeholder="Google" />
          </Form.Item>

          <Form.Item
            name="link"
            label="URL"
            rules={[{ required: true, message: "Please enter a URL" }]}
          >
            <Input placeholder="google.com" />
          </Form.Item>

          {errorMsg && <div className="text-red-500 mb-2">{errorMsg}</div>}

          <Button
            type="primary"
            htmlType="submit"
            disabled={!user}
            className="w-full bg-blue-500"
          >
            Add Bookmark
          </Button>
        </Form>
      </div>

      <div>
        <h3 className="font-semibold mb-2">
          Your Bookmarks ({userBookmarks.length})
        </h3>
        {userBookmarks.length > 0 ? (
          <ul className="list-disc pl-4">
            {userBookmarks.map((bookmark) => (
              <li key={bookmark.id} className="mb-1">
                <a
                  href={bookmark.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {bookmark.name}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No bookmarks yet.</p>
        )}
      </div>
    </div>
  );
};

export default ShortcutTest;
