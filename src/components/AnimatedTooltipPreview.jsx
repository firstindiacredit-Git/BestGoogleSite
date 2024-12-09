import React, { useState, useEffect, useCallback } from "react";
import { db } from "../firebase";
import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  updateDoc,
  getDocs,
} from "firebase/firestore";
import { useAuth } from "../hooks/AuthContext";

const defaultPeople = [
  {
    id: 1,
    name: "Youtube",
    designation: "YouTube all Fav",
    image: "youtube.png",
    link: "https://youtube.com/",
  },
  {
    id: 2,
    name: "Gmail",
    designation: "Google All Mails",
    image: "googlemail.png",
    link: "https://mail.google.com/",
  },
  {
    id: 3,
    name: "Github",
    designation: "Github Easy Access",
    image: "github.png",
    link: "https://github.com/",
  },
];

const AnimatedTooltip = React.memo(({ items, handleEdit, handleDelete }) => {
  // ... keep AnimatedTooltip component as is ...
});

const AnimatedTooltipPreview = () => {
  const { user } = useAuth();
  const [bookmarkState, setBookmarkState] = useState({
    people: defaultPeople,
    newBookmark: { name: "", link: "" },
    showModal: false,
    editMode: false,
    editingBookmarkId: null,
    errorMessage: "",
    successMessage: "",
  });

  // Fetch bookmarks only when user changes
  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!user?.uid) return;

      try {
        const bookmarksSnapshot = await getDocs(
          collection(db, "users", user.uid, "bookmarks") // Changed from "addbookmarks" to "bookmarks"
        );
        const bookmarksData = bookmarksSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setBookmarkState((prev) => ({
          ...prev,
          people: [...defaultPeople, ...bookmarksData],
        }));
      } catch (error) {
        console.error("Error fetching bookmarks:", error);
        setBookmarkState((prev) => ({
          ...prev,
          errorMessage: "Failed to fetch bookmarks. Please try again.",
        }));
      }
    };

    fetchBookmarks();
  }, [user?.uid]);

  const saveBookmark = useCallback(
    async (e) => {
      e.preventDefault();
      if (!user?.uid) return;

      const { newBookmark, editMode, editingBookmarkId } = bookmarkState;

      if (!newBookmark.name || !newBookmark.link) {
        setBookmarkState((prev) => ({
          ...prev,
          errorMessage: "Please fill in both fields.",
        }));
        return;
      }

      try {
        if (editMode && editingBookmarkId) {
          const bookmarkRef = doc(
            db,
            "users",
            user.uid,
            "bookmarks",
            editingBookmarkId
          ); // Changed from "addbookmarks" to "bookmarks"
          await updateDoc(bookmarkRef, {
            name: newBookmark.name,
            link: newBookmark.link,
            updatedAt: new Date().toISOString(),
          });

          setBookmarkState((prev) => ({
            ...prev,
            people: prev.people.map((bookmark) =>
              bookmark.id === editingBookmarkId
                ? {
                    ...bookmark,
                    name: newBookmark.name,
                    link: newBookmark.link,
                  }
                : bookmark
            ),
            successMessage: "Bookmark updated successfully!",
            showModal: false,
            editMode: false,
            editingBookmarkId: null,
            newBookmark: { name: "", link: "" },
          }));
        } else {
          const bookmarksRef = collection(db, "users", user.uid, "bookmarks"); // Changed from "addbookmarks" to "bookmarks"
          const newBookmarkData = {
            name: newBookmark.name,
            link: newBookmark.link,
            image: "default.png",
            createdAt: new Date().toISOString(),
          };

          const docRef = await addDoc(bookmarksRef, newBookmarkData);
          const addedBookmark = {
            id: docRef.id,
            ...newBookmarkData,
          };

          setBookmarkState((prev) => ({
            ...prev,
            people: [...prev.people, addedBookmark],
            successMessage: "Bookmark added successfully!",
            showModal: false,
            newBookmark: { name: "", link: "" },
          }));
        }

        setTimeout(() => {
          setBookmarkState((prev) => ({ ...prev, successMessage: "" }));
        }, 3000);
      } catch (error) {
        console.error("Error saving bookmark:", error);
        setBookmarkState((prev) => ({
          ...prev,
          errorMessage: "Failed to save bookmark. Please try again.",
        }));
      }
    },
    [user?.uid, bookmarkState]
  );

  const handleDelete = useCallback(
    async (id) => {
      if (!user?.uid) return;

      try {
        // Check if the bookmark is a default bookmark
        const isDefaultBookmark = defaultPeople.some(
          (person) => person.id === id
        );
        if (isDefaultBookmark) {
          setBookmarkState((prev) => ({
            ...prev,
            errorMessage: "Cannot delete default bookmarks.",
          }));
          return;
        }

        const bookmarkRef = doc(db, "users", user.uid, "bookmarks", id); // Changed from "addbookmarks" to "bookmarks"
        await deleteDoc(bookmarkRef);

        setBookmarkState((prev) => ({
          ...prev,
          people: prev.people.filter((person) => person.id !== id),
          successMessage: "Bookmark deleted successfully!",
        }));

        setTimeout(() => {
          setBookmarkState((prev) => ({ ...prev, successMessage: "" }));
        }, 3000);
      } catch (error) {
        console.error("Error deleting bookmark:", error);
        setBookmarkState((prev) => ({
          ...prev,
          errorMessage: "Failed to delete bookmark. Please try again.",
        }));
      }
    },
    [user?.uid]
  );

  // ... keep the rest of the component as is ...
};

export default React.memo(AnimatedTooltipPreview);
