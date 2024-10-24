import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import galleryupload from "/galleryupload.png";
import remove from "/remove.png";
import { TbGridDots } from "react-icons/tb";
import ShowLinks from "./ShowLinks";
import { auth, db } from "../firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import AnimatedTooltipPreview from "./AnimatedTooltipPreview";
import { arrayMove } from "@dnd-kit/sortable";

function NewSearchPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState("");
  const [showButtons, setShowButtons] = useState(false);
  const [items, setItems] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedBackgroundImage = localStorage.getItem("backgroundImage");
    const storedTheme = localStorage.getItem("themeMode");

    if (storedBackgroundImage) {
      setBackgroundImage(storedBackgroundImage);
    }
    if (storedTheme === "dark") {
      setIsDarkMode(true);
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      localStorage.setItem("themeMode", newMode ? "dark" : "light");
      return newMode;
    });
  };

  useEffect(() => {
    const authInstance = getAuth();
    const unsubscribe = onAuthStateChanged(authInstance, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const saveItems = async (newItems) => {
    setItems(newItems);
    if (user) {
      const positions = newItems.map((item, index) => ({
        id: item.id,
        position: index,
      }));
      const docRef = doc(db, "Widgets", user.uid);
      try {
        await setDoc(docRef, { items: positions }, { merge: true });
      } catch (error) {
        console.error("Error saving items:", error);
      }
    }
  };

  useEffect(() => {
    const fetchWidgets = async () => {
      if (user) {
        const docRef = doc(db, "Widgets", user.uid);
        try {
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const savedItems = docSnap.data().items || [];
            const sortedItems = savedItems.sort(
              (a, b) => a.position - b.position
            );
            setItems(sortedItems.map((item) => ({ id: item.id })));
          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.error("Error fetching widgets:", error);
        }
      }
    };

    fetchWidgets();
  }, [user]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setItems((prevItems) => {
        const oldIndex = prevItems.findIndex((item) => item.id === active.id);
        const newIndex = prevItems.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(prevItems, oldIndex, newIndex);
        saveItems(newItems);
        return newItems;
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result;
        setBackgroundImage(imageData);
        localStorage.setItem("backgroundImage", imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeBackground = () => {
    setBackgroundImage("");
    localStorage.removeItem("backgroundImage");
  };

  const handleIconClick = () => {
    setShowButtons((prev) => !prev);
  };

  // Placeholder functions for the new components
  const handleCalculatorClick = () => {
    console.log("Calculator clicked");
    // Implement your calculator logic here
  };

  const handleNotepadClick = () => {
    console.log("Notepad clicked");
    // Implement your notepad logic here
  };

  const handleImageUploaderClick = () => {
    console.log("Image Uploader clicked");
    // Implement your image uploader logic here
  };

  const handlePopularBookmarksClick = () => {
    console.log("Popular Bookmarks clicked");
    // Implement your popular bookmarks logic here
  };

  const handleWeatherClick = () => {
    console.log("Weather clicked");
    // Implement your weather logic here
  };

  const handleCalendarClick = () => {
    console.log("Calendar clicked");
    // Implement your calendar logic here
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.id = "google-cse";
    script.src = "https://cse.google.com/cse.js?cx=80904074a37154829";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div
      className={`${
        isDarkMode ? "bg-gray-900 text-white" : "bg-zinc-100 text-black"
      } min-h-screen h-full`}
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

      <div className="mt-4">
        <div
          onClick={handleIconClick}
          className="cursor-pointer flex m-2 mr-3 justify-end"
        >
          <TbGridDots className="w-8 h-8 hover:border border-slate-400 p-1 m-2 shadow-lg rounded-full" />
        </div>

        <div className="flex flex-col items-center mt-[1vh]">
          <img
            src={isDarkMode ? "GoogleBlack.png" : "GoogleWhite.png"}
            alt="Google Logo"
            className="mb-4 h-16"
          />
          <div className="gcse-searchbox-only" />
          <AnimatedTooltipPreview />
        </div>
        <h1 className="text-2xl py-3 font-bold text-center">COMPONENTS</h1>

        <div>
          <ShowLinks items={items} />
        </div>

        {/* Buttons section for various features */}
        <div className="flex flex-col space-y-2 items-center mt-4">
          <button
            onClick={handleCalculatorClick}
            className="text-xs p-2 w-full rounded grid items-center justify-center bg-blue-500 text-white"
          >
            Calculator
          </button>
          <button
            onClick={handleNotepadClick}
            className="text-xs p-2 w-full rounded grid items-center justify-center bg-green-500 text-white"
          >
            Notepad
          </button>
          <button
            onClick={handleImageUploaderClick}
            className="text-xs p-2 w-full rounded grid items-center justify-center bg-yellow-500 text-white"
          >
            Image Uploader
          </button>
          <button
            onClick={handlePopularBookmarksClick}
            className="text-xs p-2 w-full rounded grid items-center justify-center bg-purple-500 text-white"
          >
            Popular Bookmarks
          </button>
          <button
            onClick={handleWeatherClick}
            className="text-xs p-2 w-full rounded grid items-center justify-center bg-red-500 text-white"
          >
            Weather
          </button>
          <button
            onClick={handleCalendarClick}
            className="text-xs p-2 w-full rounded grid items-center justify-center bg-orange-500 text-white"
          >
            Calendar
          </button>
        </div>
      </div>
    </div>
  );
}

export default NewSearchPage;
