import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { FaSun, FaMoon, FaHome, FaArrowLeft } from "react-icons/fa";
import { IoIosLogOut } from "react-icons/io";
import { RiUserLine, RiAdminLine } from "react-icons/ri";
import { MdAddHomeWork } from "react-icons/md";
import { Modal, Input, Button, Dropdown, message, Alert } from "antd";
import {
  MenuOutlined,
  HomeOutlined,
  PlusOutlined,
  AppstoreOutlined,
  EditOutlined,
  DeleteOutlined,
  StarOutlined,
  StarFilled,
} from "@ant-design/icons";
import { CiEdit } from "react-icons/ci";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { FaCrown } from "react-icons/fa";

const Header = ({ isDarkMode, toggleTheme, onPageNameChange, goBack }) => {
  const [showButtons, setShowButtons] = useState(false);
  const [user, setUser] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState("free");
  const [isAdmin, setIsAdmin] = useState(false);
  const [panel, setPanel] = useState(false);
  const [showHomeDropdown, setShowHomeDropdown] = useState(false);
  const [pages, setPages] = useState(() => {
    const savedPages = localStorage.getItem("customPages");
    return savedPages ? JSON.parse(savedPages) : [];
  });
  const [currentPageName, setCurrentPageName] = useState("Home");
  const navigate = useNavigate();
  const location = useLocation();
  const MAX_PAGES = 3; // Maximum allowed pages for free users
  const [showAdminBanner, setShowAdminBanner] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const pageId = urlParams.get("pageId");
    if (pageId) {
      const page = pages.find((p) => p.id.toString() === pageId);
      if (page) {
        setCurrentPageName(page.name);
      }
    } else {
      setCurrentPageName("Home");
    }
  }, [location.search, pages]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        const userData = userDoc.data();
        setSubscriptionStatus(userData?.subscriptionStatus || "free");
        setIsAdmin(userData?.role === "admin");
        setShowAdminBanner(userData?.showAdminBanner !== false);

        setUser({
          displayName: currentUser.displayName,
          email: currentUser.email,
          photoURL: currentUser.photoURL,
          username: currentUser.username || null,
        });
      } else {
        setUser(null);
        setSubscriptionStatus("free");
        setIsAdmin(false);
        setShowAdminBanner(true);
      }
    });

    return () => unsubscribe();
  }, []);

  const togglePanel = () => setPanel(!panel);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      localStorage.setItem("imageTrue", false);
      window.location.reload();
    } catch (error) {
      console.error("Sign out error:", error.message);
    }
  };

  const createNewPage = () => {
    if (!user) {
      message.error("Please sign in to create pages");
      return;
    }

    if (pages.length >= MAX_PAGES) {
      message.error("You can only create up to 3 pages");
      return;
    }

    const newPageNumber = pages.length + 1;
    const newPage = {
      id: Date.now(),
      name: `My Page ${newPageNumber}`,
      widgets: [],
    };

    const updatedPages = [...pages, newPage];
    setPages(updatedPages);
    localStorage.setItem("customPages", JSON.stringify(updatedPages));
    navigate(`/NewSearchPage?pageId=${newPage.id}`);
    setShowHomeDropdown(false);
  };

  const handlePageClick = (pageId) => {
    navigate(`/NewSearchPage?pageId=${pageId}`);
    setShowHomeDropdown(false);
  };

  const deletePage = (pageId, event) => {
    event.stopPropagation();
    const pageToDelete = pages.find((page) => page.id === pageId);

    Modal.confirm({
      title: "Delete Page",
      content: `Are you sure you want to delete "${pageToDelete.name}"?`,
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        const updatedPages = pages.filter((page) => page.id !== pageId);
        setPages(updatedPages);
        localStorage.setItem("customPages", JSON.stringify(updatedPages));

        // Reset default page if the deleted page was default
        if (pageId.toString() === defaultPageId?.toString()) {
          const currentUser = auth.currentUser;
          if (currentUser) {
            const userDocRef = doc(db, "users", currentUser.uid);
            await setDoc(
              userDocRef,
              {
                defaultPageId: "",
              },
              { merge: true }
            );
            setDefaultPageId("");
          }
        }

        const urlParams = new URLSearchParams(window.location.search);
        const currentPageId = urlParams.get("pageId");
        if (currentPageId === pageId.toString()) {
          navigate("/search");
        }
      },
    });
  };

  const handlePageNameEdit = (pageId, currentName, event) => {
    event.stopPropagation();
    Modal.confirm({
      title: "Edit Page Name",
      content: (
        <Input
          defaultValue={currentName}
          id="pageNameInput"
          placeholder="Enter new page name"
        />
      ),
      onOk() {
        const newName = document.getElementById("pageNameInput").value;
        if (newName.trim()) {
          const updatedPages = pages.map((page) =>
            page.id === pageId ? { ...page, name: newName.trim() } : page
          );
          setPages(updatedPages);
          localStorage.setItem("customPages", JSON.stringify(updatedPages));
          onPageNameChange && onPageNameChange(pageId, newName.trim());
        }
      },
    });
  };

  const Back = () => {
    navigate("/search");
  };

  const setDefaultPage = async (pageId) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      message.error("Please sign in to set a default page");
      return;
    }

    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      setDefaultPageId(pageId.toString());

      await setDoc(
        userDocRef,
        {
          defaultPageId: pageId,
        },
        { merge: true }
      );

      message.success("Default page updated successfully");
    } catch (error) {
      console.error("Error setting default page:", error);
      message.error("Failed to set default page");
      setDefaultPageId(null);
    }
  };

  const [defaultPageId, setDefaultPageId] = useState(null);

  useEffect(() => {
    const fetchDefaultPage = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setDefaultPageId(userDoc.data().defaultPageId);
        }
      } catch (error) {
        console.error("Error fetching default page:", error);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchDefaultPage();
      } else {
        setDefaultPageId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const items = useMemo(
    () => [
      {
        key: "home",
        label: (
          <Link to="/search" className="flex items-center gap-2">
            <HomeOutlined />
            Home
          </Link>
        ),
      },
      { type: "divider" },
      ...pages.map((page) => ({
        key: page.id,
        label: (
          <div className="flex items-center justify-between gap-2">
            <span onClick={() => handlePageClick(page.id)}>{page.name}</span>
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDefaultPage(page.id);
                }}
                className="p-1 hover:bg-gray-100 rounded"
                title={
                  defaultPageId === page.id.toString()
                    ? "Default page"
                    : "Set as default"
                }
              >
                {defaultPageId === page.id.toString() ? (
                  <StarFilled className="text-yellow-500" />
                ) : (
                  <StarOutlined className="text-gray-500 hover:text-yellow-500" />
                )}
              </button>
              <button
                onClick={(e) => handlePageNameEdit(page.id, page.name, e)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <EditOutlined className="text-gray-500" />
              </button>
              <button
                onClick={(e) => deletePage(page.id, e)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <DeleteOutlined className="text-red-500" />
              </button>
            </div>
          </div>
        ),
      })),
      { type: "divider" },
      {
        key: "new",
        label: (
          <button
            onClick={createNewPage}
            className="flex items-center gap-2 w-full"
            disabled={pages.length >= MAX_PAGES}
          >
            <PlusOutlined />
            New Page
            {pages.length >= MAX_PAGES && (
              <span className="text-xs text-red-500 ml-2">
                (Maximum limit reached)
              </span>
            )}
          </button>
        ),
      },
    ],
    [
      pages,
      handlePageClick,
      handlePageNameEdit,
      deletePage,
      defaultPageId,
      setDefaultPage,
    ]
  );

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        !event.target.closest(".menu-buttons") &&
        !event.target.closest(".menu-icon")
      ) {
        setShowButtons(false);
      }

      if (
        !event.target.closest(".user-panel") &&
        !event.target.closest(".user-avatar")
      ) {
        setPanel(false);
      }
    };

    const handleScroll = () => {
      setShowButtons(false);
      setPanel(false);
    };

    document.addEventListener("click", handleOutsideClick);
    document.addEventListener("scroll", handleScroll);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
      document.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <header className=" bg-gray-200/20 backdrop-blur-sm dark:bg-[#513a7a]/10 border-b border dark:border-gray-800/20 border-gray-200/20  sticky top-0 z-50">
        {isAdmin && showAdminBanner && (
          <div className="bg-red-500/90 backdrop-blur-sm text-white py-1 px-4 text-center sticky top-0 z-50">
            <Alert
              message={
                <div className="flex items-center justify-center gap-2">
                  <RiAdminLine className="text-xl" />
                  <span className="font-semibold">Admin Mode Active</span>
                  <span className="text-sm">
                    - Please proceed with caution. Changes can affect system
                    functionality.
                  </span>
                </div>
              }
              type="error"
              showIcon={false}
              className="bg-transparent border-none text-white p-0"
              closable
            />
          </div>
        )}
        <div className="flex p-2 justify-between items-center">
          <div className="flex  items-center space-x-2">
            {user ? (
              <div className="relative flex items-center gap-2">
                {goBack ? (
                  <button
                    className="bg-indigo-500 py-1.5 px-4 flex items-center gap-2 rounded home-button"
                    onClick={Back}
                  >
                    <FaArrowLeft className="h-2 w-3 text-white" />
                    <span className="text-white">Back</span>
                  </button>
                ) : (
                  <Dropdown
                    menu={{ items }}
                    trigger={["click"]}
                    placement="bottomLeft"
                    overlayClassName="mt-1"
                  >
                    <button className="bg-indigo-500 border-none hover:bg-indigo-600 flex items-center gap-2 px-2 py-1 rounded-md transition-all duration-200">
                      <MenuOutlined className="text-white" />
                      <span className="text-white">{currentPageName}</span>
                    </button>
                  </Dropdown>
                )}
                <div
                  className={` p-2 rounded-lg text-sm flex items-center justify-center gap-2 
                      ${
                        subscriptionStatus === "pro"
                          ? "text-yellow-500"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                >
                  {/* <span>
                  {subscriptionStatus !== "pro" && (
                    <button
                      type="button"
                      onClick={() => navigate("/premium")}
                      className="text-gray-900 flex items-center gap-2 cursor-pointer bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500  hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-amber-800  shadow-amber-400/20 font-medium shadow-md rounded-lg text-sm px-5 py-2 text-center transition-all duration-500"
                    >
                      <FaCrown className="w-5 h-5" />
                      Go Premium
                    </button>
                  )}
                </span> */}
                </div>
              </div>
            ) : (
              <div className="w-36  "></div>
            )}
          </div>

          <div className="flex items-center">
            <Link
              to="/"
              className="text-xl font-bold text-gray-800 dark:text-white"
            >
              <svg
                width="50"
                viewBox="0 0 1423 753"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M801.592 238.734L884.831 21.7064H951.894L1035.13 238.734H969.081L950.883 192.565H885.505L867.644 238.734H801.592ZM893.93 147.07H942.458L918.194 83.3774L893.93 147.07ZM1058.78 238.734V21.7064H1122.13V190.206H1219.86V238.734H1058.78ZM1236.82 238.734V21.7064H1300.18V190.206H1397.91V238.734H1236.82Z"
                  fill="#879BFC"
                />
                <path
                  d="M808.332 476.734V259.706H870.003L923.923 369.905L977.506 259.706H1038.84V476.734H975.484V368.22L940.773 439.664H906.736L871.688 368.22V476.734H808.332ZM1134.17 476.734V397.202L1055.99 259.706H1122.04L1165.85 341.597L1209.66 259.706H1275.71L1197.53 397.202V476.734H1134.17Z"
                  fill="#5E79FC"
                />
                <path
                  d="M855.849 714.734V544.886H794.852V497.706H980.202V544.886H919.205V714.734H855.849ZM961.535 714.734L1044.77 497.706H1111.84L1195.08 714.734H1129.02L1110.83 668.565H1045.45L1027.59 714.734H961.535ZM1053.87 623.07H1102.4L1078.14 559.377L1053.87 623.07ZM1218.72 714.734V497.706H1338.02C1360.04 497.706 1376.77 502.874 1388.23 513.208C1399.69 523.543 1405.42 538.371 1405.42 557.692C1405.42 568.926 1403.29 578.362 1399.02 586C1394.97 593.639 1389.58 599.705 1382.84 604.198C1392.05 607.793 1399.35 613.073 1404.75 620.037C1410.36 626.777 1413.17 636.887 1413.17 650.367C1413.17 670.812 1406.88 686.651 1394.3 697.884C1381.72 709.118 1363.86 714.734 1340.72 714.734H1218.72ZM1279.72 584.315H1320.83C1336.33 584.315 1344.09 577.351 1344.09 563.421C1344.09 556.457 1342.18 551.177 1338.36 547.582C1334.76 543.988 1328.36 542.19 1319.15 542.19H1279.72V584.315ZM1279.72 670.587H1323.53C1332.07 670.587 1338.36 668.79 1342.4 665.195C1346.44 661.601 1348.47 655.647 1348.47 647.334C1348.47 640.37 1346.44 635.09 1342.4 631.495C1338.36 627.901 1331.62 626.103 1322.18 626.103H1279.72V670.587Z"
                  fill="#3A5BFF"
                />
                <path
                  d="M1360.88 486.681L1346.43 486.681L1346.43 470.845L1360.88 470.845L1360.88 486.681ZM1361.95 435.617C1361.95 444.819 1359.77 452.095 1355.42 457.445C1351 462.795 1344.36 465.47 1335.52 465.47C1329.53 465.47 1324.57 464.221 1320.65 461.725C1316.72 459.228 1313.83 455.733 1311.98 451.239C1310.05 446.745 1309.09 441.502 1309.09 435.51C1309.09 431.729 1309.38 428.341 1309.95 425.345C1310.45 422.349 1311.34 419.495 1312.62 416.785L1326.74 416.785C1324.75 420.993 1323.75 425.773 1323.75 431.123C1323.75 435.688 1324.6 439.148 1326.32 441.502C1328.03 443.784 1331.1 444.926 1335.52 444.926C1339.66 444.926 1342.65 443.82 1344.51 441.609C1346.36 439.397 1347.29 435.902 1347.29 431.123C1347.29 428.555 1347 426.058 1346.43 423.633C1345.79 421.207 1344.9 418.889 1343.76 416.678L1358.52 416.678C1359.74 419.388 1360.59 422.313 1361.09 425.452C1361.66 428.519 1361.95 431.907 1361.95 435.617ZM1361.95 381.704C1361.95 391.833 1359.7 399.323 1355.21 404.174C1350.71 408.953 1344.15 411.343 1335.52 411.343C1326.96 411.343 1320.43 408.917 1315.94 404.067C1311.37 399.216 1309.09 391.762 1309.09 381.704C1309.09 371.574 1311.37 364.084 1315.94 359.234C1320.43 354.312 1326.96 351.851 1335.52 351.851C1344.15 351.851 1350.71 354.276 1355.21 359.127C1359.7 363.977 1361.95 371.503 1361.95 381.704ZM1347.29 381.704C1347.29 378.422 1346.36 376.068 1344.51 374.642C1342.65 373.144 1339.66 372.395 1335.52 372.395C1331.45 372.395 1328.49 373.144 1326.64 374.642C1324.71 376.068 1323.75 378.422 1323.75 381.704C1323.75 384.914 1324.71 387.232 1326.64 388.659C1328.49 390.085 1331.45 390.799 1335.52 390.799C1339.66 390.799 1342.65 390.085 1344.51 388.659C1346.36 387.232 1347.29 384.914 1347.29 381.704ZM1360.88 344.313L1310.16 344.313L1310.16 325.695L1314.23 325.16C1312.73 322.949 1311.52 320.488 1310.59 317.777C1309.59 314.995 1309.09 311.963 1309.09 308.682C1309.09 305.401 1309.55 302.833 1310.48 300.978C1311.41 299.123 1312.76 297.625 1314.55 296.484C1312.91 294.201 1311.59 291.633 1310.59 288.78C1309.59 285.855 1309.09 282.431 1309.09 278.508C1309.09 272.587 1310.66 268.236 1313.8 265.454C1316.87 262.672 1321.57 261.281 1327.92 261.281L1360.88 261.281L1360.88 281.076L1330.28 281.076C1327.99 281.076 1326.39 281.54 1325.46 282.467C1324.46 283.394 1323.96 284.928 1323.96 287.068C1323.96 289.85 1324.96 292.133 1326.96 293.916C1327.89 293.773 1328.78 293.702 1329.63 293.702C1330.42 293.702 1331.31 293.702 1332.31 293.702L1360.88 293.702L1360.88 312.32L1329.95 312.32C1327.89 312.32 1326.39 312.677 1325.46 313.39C1324.46 314.103 1323.96 315.459 1323.96 317.456C1323.96 318.811 1324.32 320.131 1325.03 321.415C1325.75 322.699 1326.6 323.84 1327.6 324.839L1360.88 324.839L1360.88 344.313Z"
                  fill="#3C59EB"
                />
                <rect
                  x="0.267578"
                  y="12.4219"
                  width="641.647"
                  height="639.233"
                  rx="81"
                  fill="#3A5BFF"
                />
                <g filter="url(#filter0_d_51_79)">
                  <rect
                    x="83.0908"
                    y="95.165"
                    width="606.543"
                    height="606.543"
                    rx="81"
                    fill="#5E79FC"
                  />
                </g>
                <g filter="url(#filter1_d_51_79)">
                  <rect
                    x="198.479"
                    y="190.381"
                    width="526.799"
                    height="530.197"
                    rx="81"
                    fill="#879BFC"
                  />
                </g>
                <defs>
                  <filter
                    id="filter0_d_51_79"
                    x="55.0908"
                    y="71.165"
                    width="662.543"
                    height="662.543"
                    filterUnits="userSpaceOnUse"
                    color-interpolation-filters="sRGB"
                  >
                    <feFlood flood-opacity="0" result="BackgroundImageFix" />
                    <feColorMatrix
                      in="SourceAlpha"
                      type="matrix"
                      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                      result="hardAlpha"
                    />
                    <feOffset dy="4" />
                    <feGaussianBlur stdDeviation="14" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix
                      type="matrix"
                      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0"
                    />
                    <feBlend
                      mode="normal"
                      in2="BackgroundImageFix"
                      result="effect1_dropShadow_51_79"
                    />
                    <feBlend
                      mode="normal"
                      in="SourceGraphic"
                      in2="effect1_dropShadow_51_79"
                      result="shape"
                    />
                  </filter>
                  <filter
                    id="filter1_d_51_79"
                    x="170.479"
                    y="166.381"
                    width="582.799"
                    height="586.197"
                    filterUnits="userSpaceOnUse"
                    color-interpolation-filters="sRGB"
                  >
                    <feFlood flood-opacity="0" result="BackgroundImageFix" />
                    <feColorMatrix
                      in="SourceAlpha"
                      type="matrix"
                      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                      result="hardAlpha"
                    />
                    <feOffset dy="4" />
                    <feGaussianBlur stdDeviation="14" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix
                      type="matrix"
                      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0"
                    />
                    <feBlend
                      mode="normal"
                      in2="BackgroundImageFix"
                      result="effect1_dropShadow_51_79"
                    />
                    <feBlend
                      mode="normal"
                      in="SourceGraphic"
                      in2="effect1_dropShadow_51_79"
                      result="shape"
                    />
                  </filter>
                </defs>
              </svg>
            </Link>
          </div>

          <div className="flex items-center justify-between w-fit gap-4 space-x-4">
            <div
              onClick={toggleTheme}
              className="flex items-center text-sm dark:hover:bg-gray-800/20 transition-all hover:bg-gray-200/80 p-2 cursor-pointer rounded-md"
            >
              {isDarkMode ? (
                <FaSun className="w-5 h-5 text-white" />
              ) : (
                <FaMoon className="w-5 h-5 " />
              )}
            </div>
            {user ? (
              <div className="relative">
                <div
                  onClick={togglePanel}
                  className="flex items-center cursor-pointer user-avatar"
                >
                  <img
                    src={user.photoURL || "/default-avatar.png"}
                    alt="User Avatar"
                    className="h-8 w-8 rounded-full border border-gray-300 dark:border-gray-500"
                  />
                </div>

                {panel && (
                  <div className="absolute right-0 mt-2 w-60 py-2 bg-white shadow-lg rounded-lg text-sm dark:bg-[#513a7a] user-panel">
                    <div className="px-4 py-2 text-center dark:text-white">
                      <p className="font-bold">
                        {user.username || user.displayName || "User"}
                      </p>
                      <p>{user.email}</p>
                      <div
                        className={`mt-2 text-sm flex items-center justify-center gap-2 
                      ${
                        subscriptionStatus === "pro"
                          ? "text-yellow-500"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                      >
                        <FaCrown
                          className={`${
                            subscriptionStatus === "pro" ? "animate-pulse" : ""
                          }`}
                        />
                        <span>
                          {subscriptionStatus === "pro"
                            ? "Pro Member"
                            : "Free User"}
                        </span>
                      </div>
                    </div>
                    <hr className="my-2 border-gray-200 dark:border-gray-600" />
                    <Link to="/Profile">
                      <button className="w-full flex items-center justify-center gap-2 px-4 py-2 text-center text-sm text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-600 rounded transition-colors duration-200">
                        <RiUserLine />
                        <span>Profile</span>
                      </button>
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 text-center text-sm text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-600 rounded transition-colors duration-200"
                    >
                      <IoIosLogOut />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link
                  to="/signin"
                  className="px-2 py-1 border  text-white bg-green-500 border-green-500 dark:border-green-500 rounded hover:bg-green-600  transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-2 py-1 border text-white bg-blue-500 border-blue-500 dark:border-gray-500 rounded hover:bg-blue-600 transition-colors duration-200"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
