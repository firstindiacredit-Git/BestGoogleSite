import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Chip,
  InputBase,
  IconButton,
  useTheme,
  useMediaQuery,
  Avatar,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { Link } from "react-router-dom";
import { Chrome, ChromeIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FiMenu, FiX } from "react-icons/fi";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectCoverflow } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import FeaturedPlayListIcon from "@mui/icons-material/FeaturedPlayList";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: "24px",
  padding: "10px 24px",
  textTransform: "none",
  fontWeight: 600,
  fontSize: "1rem",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 6px 20px rgba(99, 102, 241, 0.2)",
  },
  transition: "all 0.2s ease-in-out",
}));

const CategoryButton = styled(Button)(({ theme }) => ({
  borderRadius: "20px",
  padding: "6px 16px",
  textTransform: "none",
  fontSize: "0.9rem",
  color: theme.palette.text.primary,
  "&:hover": {
    backgroundColor: "rgba(99, 102, 241, 0.08)",
  },
  "&.active": {
    backgroundColor: "#6366f1",
    color: "white",
    "&:hover": {
      backgroundColor: "#4f46e5",
    },
  },
}));

const Blogs = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = [
    "All",
    "Business Finance",
    "Expense Management",
    "Bookkeeping",
    "Tax Tips",
    "Business Growth",
    "Financial Planning",
  ];

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setIsLoading(true);
        const blogsRef = collection(db, "blogs");
        const q = query(blogsRef, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);

        const fetchedBlogs = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          title: doc.data().title,
          excerpt: doc.data().summary,
          content: doc.data().content,
          category: doc.data().category || "Business Finance",
          author: doc.data().author,
          readTime: doc.data().readTime || "5 min read",
          date: new Date(doc.data().createdAt?.toDate()).toLocaleDateString(),
          image: doc.data().featuredImage,
          featured: doc.data().featured || false,
        }));

        setBlogs(fetchedBlogs);
      } catch (error) {
        console.error("Error fetching blogs:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const testimonials = [
    {
      id: 1,
      content:
        "First India Credit has revolutionized how we handle our business finances. Their insights are game-changing!",
      author: {
        name: "Rajesh Kumar",
        role: "CEO",
        company: "TechStart Solutions",
        avatar:
          "https://images.pexels.com/photos/28114093/pexels-photo-28114093/free-photo-of-meta-gaming.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      },
    },
    {
      id: 2,
      content:
        "The financial guidance we've received has been exceptional. A true partner in our growth journey!",
      author: {
        name: "Priya Singh",
        role: "Finance Director",
        company: "Global Innovations",
        avatar:
          "https://images.pexels.com/photos/28114093/pexels-photo-28114093/free-photo-of-meta-gaming.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      },
    },
    {
      id: 3,
      content:
        "Their expertise in business finance has helped us scale efficiently. Highly recommended!",
      author: {
        name: "Amit Patel",
        role: "Founder",
        company: "Digital Dynamics",
        avatar:
          "https://images.pexels.com/photos/7862484/pexels-photo-7862484.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      },
    },
    {
      id: 4,
      content:
        "Their expertise in business finance has helped us scale efficiently. Highly recommended!",
      author: {
        name: "Sinod Kumar",
        role: "Founder",
        company: "Digital Dynamics",
        avatar:
          "https://images.pexels.com/photos/16004754/pexels-photo-16004754/free-photo-of-woman-and-letters.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      },
    },
    {
      id: 5,
      content:
        "Their expertise in business finance has helped us scale efficiently. Highly recommended!",
      author: {
        name: "Pranjal Tiwari",
        role: "Founder",
        company: "Digital Dynamics",
        avatar:
          "https://images.pexels.com/photos/28173991/pexels-photo-28173991/free-photo-of-red-avatar.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      },
    },
    {
      id: 6,
      content:
        "Their expertise in business finance has helped us scale efficiently. Highly recommended!",
      author: {
        name: "Sharik",
        role: "Founder",
        company: "Digital Dynamics",
        avatar:
          "https://ui-avatars.com/api/?name=Sharik&background=6366f1&color=fff",
      },
    },
  ];

  const filteredPosts = blogs.filter((post) => {
    const matchesCategory =
      selectedCategory === "All" || post.category === selectedCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && !post.featured;
  });

  const featuredPosts = blogs.filter(
    (post) =>
      post.featured &&
      (selectedCategory === "All" || post.category === selectedCategory) &&
      (post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Add loading and error states to your JSX
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 bg-white/20 backdrop-blur-md  border-b border-gray-200/50`}
      >
        <nav className="container mx-auto px-4">
          <div className="flex items-center justify-between   h-16">
            {/* Logo */}
            <Link to="/" className="flex px-6 w-44 items-center space-x-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="4rem"
                fill="#6366f1"
                viewBox="0 0 412.4 95.9"
              >
                <defs> </defs>
                <g id="Layer_2" data-name="Layer 2">
                  <g id="Layer_1-2" data-name="Layer 1">
                    <g id="Layer_2-2" data-name="Layer 2">
                      <g id="Layer_1-2-2" data-name="Layer 1-2">
                        <path
                          class="cls-1"
                          d="M40.8,9.3c-3.8,0-9-.8-12.9-4.9A48.89,48.89,0,0,1,47.8,0,47.39,47.39,0,0,1,66.1,3.6c-4.5.8-9,2-13.3,3.2-1.3.4-2.6.7-3.9,1.1a22.66,22.66,0,0,1-8.1,1.4Z"
                        />
                        <path
                          class="cls-1"
                          d="M47.9,0V.2A47.44,47.44,0,0,1,65.7,3.7c-4.4.8-8.7,2-12.9,3.2-1.3.4-2.6.7-3.9,1.1a28.91,28.91,0,0,1-8.1,1.2c-3.7,0-8.8-.8-12.6-4.7A47.52,47.52,0,0,1,47.9.2V0m0,0h0A48.33,48.33,0,0,0,27.7,4.4c3.3,3.5,8.1,5,13.1,5A29.07,29.07,0,0,0,49,8.2c5.8-1.6,11.7-3.5,17.7-4.4A48.58,48.58,0,0,0,47.9,0Z"
                        />
                        <path
                          class="cls-1"
                          d="M28.5,29.2c-8.8,0-15.5-2.4-20.7-7.3a48.68,48.68,0,0,1,11.1-12c6,5.3,13.9,7.7,24.9,7.7a168.12,168.12,0,0,0,18.5-1.4A169.86,169.86,0,0,1,81,14.8h1.6A48.67,48.67,0,0,1,86.1,19h-3c-7.4.3-15.8,2.5-24.7,4.8-10.1,2.7-20.5,5.4-29.9,5.4Z"
                        />
                        <path
                          class="cls-1"
                          d="M18.8,10.1c6,5.2,14,7.7,24.9,7.7a168.12,168.12,0,0,0,18.5-1.4A169.86,169.86,0,0,1,80.9,15h1.5c1.2,1.3,2.3,2.6,3.4,4H83c-7.4.3-15.8,2.5-24.7,4.8-10,2.6-20.4,5.3-29.8,5.3-8.7,0-15.4-2.3-20.6-7.2A51,51,0,0,1,18.8,10.1m.1-.3A48.21,48.21,0,0,0,7.7,22c5.8,5.5,13,7.4,20.9,7.4,17.6,0,38.6-9.4,54.5-10.1h3.3a53.25,53.25,0,0,0-3.8-4.5H81c-12.1,0-25.2,2.8-37.2,2.8-9.4-.1-18.1-1.8-24.9-7.8Z"
                        />
                        <path
                          class="cls-1"
                          d="M16.8,48.6A50,50,0,0,1,.1,45.8,46.76,46.76,0,0,1,2.3,33.5C6.6,37.8,13.2,40,22.5,40a129.51,129.51,0,0,0,17-1.5l.5-.1a137.92,137.92,0,0,0,21.1-6.1c9.4-3.2,19.1-6.5,28.9-6.8a16.27,16.27,0,0,1,1.1,2.3c-11.3,1.6-21.8,5.9-32,10a173.17,173.17,0,0,1-24.2,8.4,72.7,72.7,0,0,1-18.1,2.4Z"
                        />
                        <path
                          class="cls-1"
                          d="M90,25.6a20,20,0,0,1,1,2.1c-11.3,1.6-21.7,5.9-31.9,10C51.3,40.8,43.2,44,34.9,46a69.69,69.69,0,0,1-18.1,2.5A47,47,0,0,1,.2,45.7a48.71,48.71,0,0,1,2.1-12C6.7,38,13.3,40,22.5,40a129.51,129.51,0,0,0,17-1.5l.5-.1c7.2-1.3,14.3-3.7,21.2-6.1,9.3-3.1,19-6.3,28.8-6.7m.2-.3c-17.1.6-33,9.8-50.2,12.9a137,137,0,0,1-17.5,1.6c-7.8,0-15.3-1.5-20.2-6.6A45.88,45.88,0,0,0,0,45.9a48.3,48.3,0,0,0,16.8,2.9A71.26,71.26,0,0,0,35,46.3c19-4.5,36.3-15.5,56.4-18.4-.4-.9-.8-1.8-1.2-2.6Z"
                        />
                        <path
                          class="cls-1"
                          d="M17.2,66.1A46.12,46.12,0,0,1,2.8,63.9a56.07,56.07,0,0,1-2.4-10A65.88,65.88,0,0,0,21,57.3c23.8,0,46.5-12.9,66-25a16.18,16.18,0,0,1,5-2.7,53.44,53.44,0,0,1,1.8,5.2,72.53,72.53,0,0,0-11,3.2c-2,1.2-4,2.5-6,3.7C58.7,53.2,37.9,66.1,17.2,66.1Z"
                        />
                        <path
                          class="cls-1"
                          d="M92,29.8a42,42,0,0,1,1.7,5A71.35,71.35,0,0,0,82.8,38c-2,1.2-4,2.5-6,3.7C58.6,53.1,37.9,66,17.2,66A46,46,0,0,1,2.9,63.8,45.69,45.69,0,0,1,.6,54.1a64.7,64.7,0,0,0,20.5,3.3c23.8,0,46.6-12.9,66.1-25A17.16,17.16,0,0,1,92,29.8m.2-.3A17.19,17.19,0,0,0,87,32.2c-20.9,13-42.9,24.9-65.9,24.9A66.56,66.56,0,0,1,.3,53.7,46.65,46.65,0,0,0,2.7,64a45.19,45.19,0,0,0,14.5,2.2c23.1,0,45.9-15.8,65.8-28A61.24,61.24,0,0,1,94.1,35c-.6-1.9-1.2-3.7-1.9-5.5Z"
                        />
                        <path
                          class="cls-1"
                          d="M47.9,95.8a48.45,48.45,0,0,1-12.6-1.7c9.6-.2,17.3-3.5,22.8-9.8,2.8-3.3,5.7-6.9,8.4-10.3,8.8-11,17.9-22.3,29.1-29,.1,1.1.1,2.1.1,2.9a44.53,44.53,0,0,1-1.3,10.9C87,63,82.7,70.8,78,79.1c-1.9,3.4-3.9,7-6.1,10.2a47.73,47.73,0,0,1-24,6.5Z"
                        />
                        <path
                          class="cls-1"
                          d="M95.5,45.3a26.23,26.23,0,0,1,.1,2.7,43.73,43.73,0,0,1-1.3,10.8c-7.5,4.1-12,12.3-16.4,20.3-1.9,3.4-3.8,6.9-6,10.1a48.28,48.28,0,0,1-24,6.5,45.78,45.78,0,0,1-11.7-1.5c9.3-.4,16.7-3.7,22-9.8,2.8-3.3,5.7-6.9,8.4-10.3,8.7-10.9,17.8-22.2,28.9-28.8m.3-.5c-15,8.8-26,25.6-37.8,39.4C51.8,91.3,43.4,94,34.5,94A47.35,47.35,0,0,0,48,95.9h0a47.46,47.46,0,0,0,24.1-6.6C79.4,78.6,83.9,64.8,94.6,59a45.33,45.33,0,0,0,1.3-11c0-1.1-.1-2.1-.1-3.2Z"
                        />
                        <path
                          class="cls-1"
                          d="M25.3,90.1A47.84,47.84,0,0,1,6.6,72a66.26,66.26,0,0,0,15.7,2,53.25,53.25,0,0,0,27.8-7.6c3.4-2.4,6.7-4.8,10-7.2,11.4-8.4,22.2-16.4,34.7-20.6.2,1.2.4,2.5.6,4C78.7,51.7,62.5,63.7,45.9,79.2A41.71,41.71,0,0,1,25.3,90.1Z"
                        />
                        <path
                          class="cls-1"
                          d="M94.7,38.6c.2,1.1.4,2.4.6,3.8C78.6,51.5,62.4,63.5,45.8,79A40.22,40.22,0,0,1,25.3,89.9,47.26,47.26,0,0,1,6.8,72.1,63.63,63.63,0,0,0,22.2,74a52.76,52.76,0,0,0,27.9-7.7c3.4-2.4,6.7-4.8,10-7.2,11.4-8.3,22.1-16.2,34.6-20.5m.2-.3C78.6,43.8,64.9,55.9,50,66.2a52,52,0,0,1-27.7,7.6,66,66,0,0,1-15.9-2,48,48,0,0,0,19,18.4,41.39,41.39,0,0,0,20.7-11C61.4,64.8,77.6,52.3,95.6,42.5c-.2-1.4-.4-2.8-.7-4.2Z"
                        />
                        <path
                          class="cls-1"
                          d="M113.5,66.1V15.4h22.6c12.1,0,18.3,4.3,18.3,12.9a9.94,9.94,0,0,1-2.2,6.6,11.74,11.74,0,0,1-5.8,4l-.5.1.5.1a12.78,12.78,0,0,1,7.2,4.3,11.77,11.77,0,0,1,2.6,7.9c0,5-1.8,8.9-5.5,11.5-3.1,2.2-7.4,3.3-12.7,3.3ZM126.7,56h10.4a6.56,6.56,0,0,0,4.4-1.7,6.19,6.19,0,0,0,1.9-4.6,4.92,4.92,0,0,0-2.1-4.3,9,9,0,0,0-4.5-1.3h-10L126.7,56Zm-.1-20.3h9.5c4.1,0,6.1-1.8,6.1-5.2,0-3.1-2.1-4.7-6.1-4.7h-9.5Z"
                        />
                        <path
                          class="cls-1"
                          d="M136.2,15.6c12.1,0,18.2,4.3,18.2,12.8a9.51,9.51,0,0,1-2.2,6.5,11.56,11.56,0,0,1-5.8,3.9l-.9.3,1,.2a12.53,12.53,0,0,1,7.1,4.3,11.68,11.68,0,0,1,2.6,7.8c0,5-1.8,8.8-5.4,11.3-3.1,2.2-7.4,3.3-12.6,3.3H113.7V15.6h22.5m-9.7,20.2h9.6c4.1,0,6.2-1.8,6.2-5.4,0-3.2-2.1-4.9-6.2-4.9h-9.6V35.8m0,20.4H137a6.62,6.62,0,0,0,4.5-1.7,5.91,5.91,0,0,0,1.9-4.7,4.84,4.84,0,0,0-2.2-4.4,8.21,8.21,0,0,0-4.6-1.3H126.5V56.2m9.7-40.9H113.4V66.2h24.7c5.3,0,9.6-1.1,12.7-3.4,3.7-2.6,5.5-6.5,5.5-11.5a12.3,12.3,0,0,0-2.7-8,13,13,0,0,0-7.3-4.3,12,12,0,0,0,5.9-4,10.2,10.2,0,0,0,2.2-6.7c.2-8.6-6-13-18.2-13Zm-9.5,20.2V25.8h9.4c4,0,6,1.5,6,4.6q0,5.1-6,5.1Zm.1,20.4V44.3h9.9a7.58,7.58,0,0,1,4.4,1.3,4.64,4.64,0,0,1,2.1,4.2,5.88,5.88,0,0,1-1.8,4.5,6.46,6.46,0,0,1-4.4,1.6H126.8Z"
                        />
                        <path
                          class="cls-1"
                          d="M159.7,66.1V28.2h12.1v6.4l.2-.8a9.18,9.18,0,0,1,3.5-4.7,9.45,9.45,0,0,1,5.6-1.9h0a7.51,7.51,0,0,1,2.6.5V38.4a11.27,11.27,0,0,0-3.2-.5h-.3a7.56,7.56,0,0,0-6.3,3.3,12.59,12.59,0,0,0-2,7.3V66.2l-12.2-.1Z"
                        />
                        <path
                          class="cls-1"
                          d="M181.2,27.1v.2a6.37,6.37,0,0,1,2.4.4V38.2a15.67,15.67,0,0,0-3-.5h-.3a7.87,7.87,0,0,0-6.4,3.3,12.59,12.59,0,0,0-2,7.3V66h-12V28.3h11.8v7.1l.5-1.5a9,9,0,0,1,3.5-4.7,9.16,9.16,0,0,1,5.5-1.9v-.2m0,0h0a10.07,10.07,0,0,0-9.3,6.7V28.1H159.6V66.3h12.5V48.4a12.08,12.08,0,0,1,2-7.2,7.54,7.54,0,0,1,6.2-3.2h.3a12.76,12.76,0,0,1,3.3.6v-11a6.46,6.46,0,0,0-2.7-.5Z"
                        />
                        <path
                          class="cls-1"
                          d="M207.9,67.4h-.7c-5.9,0-10.8-1.9-14.5-5.6s-5.5-8.6-5.5-14.7,1.9-10.9,5.6-14.6,8.6-5.6,14.6-5.6,10.8,1.9,14.4,5.8,5.4,8.8,5.4,14.8a19.15,19.15,0,0,1-19.3,19.9ZM207,36.2a7.31,7.31,0,0,0-6.2,3.6,14.74,14.74,0,0,0-1.8,7.4,14.74,14.74,0,0,0,1.8,7.4,6.92,6.92,0,0,0,6.1,3.7h.1a7.46,7.46,0,0,0,5.8-2.7,9.09,9.09,0,0,0,2.3-6.3V45.2a9.33,9.33,0,0,0-2.3-6.2,7.26,7.26,0,0,0-5.7-2.7Z"
                        />
                        <path
                          class="cls-1"
                          d="M207.5,26.8v.3c5.9,0,10.7,1.9,14.2,5.7s5.4,8.8,5.4,14.7a19.37,19.37,0,0,1-5.6,14.2,19.13,19.13,0,0,1-13.6,5.5h-.7c-5.9,0-10.7-1.9-14.4-5.6S187.3,53,187.3,47s1.9-10.8,5.5-14.5,8.5-5.5,14.5-5.5l.2-.2M207,58.3h.2a7.25,7.25,0,0,0,5.8-2.8,9.43,9.43,0,0,0,2.4-6.4V45a9.59,9.59,0,0,0-2.3-6.3,7.25,7.25,0,0,0-5.8-2.8h-.4a7.35,7.35,0,0,0-6.3,3.6,14.12,14.12,0,0,0-1.8,7.5,14.49,14.49,0,0,0,1.8,7.4,7.3,7.3,0,0,0,6.4,3.9m.5-31.5c-6.1,0-11,1.9-14.7,5.6s-5.6,8.6-5.6,14.7,1.8,11,5.5,14.7,8.6,5.6,14.6,5.6h.7a19.31,19.31,0,0,0,19.5-20c0-6.1-1.8-11-5.4-14.9-3.8-3.8-8.6-5.7-14.6-5.7ZM207,58.1a6.87,6.87,0,0,1-6-3.6,15.47,15.47,0,0,1-1.8-7.3,13.78,13.78,0,0,1,1.8-7.4,7.05,7.05,0,0,1,6.1-3.5h.3A7.21,7.21,0,0,1,213,39a9.26,9.26,0,0,1,2.3,6.1v4.1a9.33,9.33,0,0,1-2.3,6.2,7.41,7.41,0,0,1-5.7,2.7H207Z"
                        />
                        <path
                          class="cls-1"
                          d="M239.7,66.1,228.5,28.2h12.7c1.1,4.4,2.2,8.9,3.4,13.3a64,64,0,0,1,2.1,13.7h.2a87.78,87.78,0,0,1,2.3-13.6c1.1-4.5,2.3-9,3.4-13.3H267l3.5,13.3a89.85,89.85,0,0,1,2.3,13.6h.2a70.77,70.77,0,0,1,2-13.7c1.2-4.4,2.3-8.8,3.4-13.3h12.8L280,66.1H265.8c-1.2-4.4-2.4-8.8-3.5-13.1a76.33,76.33,0,0,1-2.4-13.5l-.1-1.2-.1,1.2a102,102,0,0,1-2.5,13.4c-1.1,4.4-2.3,8.9-3.4,13.2Z"
                        />
                        <path
                          class="cls-1"
                          d="M241.1,28.3c1.1,4.4,2.2,8.8,3.4,13.2a64,64,0,0,1,2.1,13.7h.5a87.78,87.78,0,0,1,2.3-13.6c1.1-4.4,2.2-8.9,3.4-13.3h14.1l1.9,7.4,1.5,5.8a89.85,89.85,0,0,1,2.3,13.6h.5a70.77,70.77,0,0,1,2-13.7c1.2-4.4,2.3-8.8,3.4-13.2H291L280,66H266c-1.2-4.3-2.3-8.7-3.4-13a76.33,76.33,0,0,1-2.4-13.5L260,37l-.3,2.4a102,102,0,0,1-2.5,13.4c-1.1,4.4-2.2,8.8-3.4,13.1h-14L228.7,28.2l12.4.1m50.3-.2H278.3c-1.1,4.5-2.3,8.9-3.4,13.4a70.77,70.77,0,0,0-2,13.7,91.13,91.13,0,0,0-2.3-13.7c-1.2-4.5-2.3-9-3.5-13.4H252.6c-1.2,4.5-2.3,9-3.4,13.4a89.05,89.05,0,0,0-2.3,13.7,64,64,0,0,0-2.1-13.7c-1.2-4.4-2.3-8.9-3.4-13.4h-13l11.3,38.2H254c1.2-4.4,2.3-8.9,3.4-13.3a102,102,0,0,0,2.5-13.4,76.33,76.33,0,0,0,2.4,13.5c1.1,4.4,2.3,8.8,3.5,13.2h14.4l11.2-38.2Z"
                        />
                        <path
                          class="cls-1"
                          d="M310.9,67.5c-11.5,0-17.5-4.8-17.8-14.2h11.6a5.49,5.49,0,0,0,1.4,4.3c1.2,1.3,3.2,1.9,6,1.9,3.6,0,5.4-1.3,5.4-3.8,0-1.5-2-2.7-6.1-3.8-5.8-1.5-9.5-2.7-11-3.5-3.9-2-5.9-4.9-5.9-8.6,0-4.6,1.9-8,5.6-10.1,3-1.8,7.1-2.6,12-2.6,4.7,0,8.6,1,11.5,3.1a11.73,11.73,0,0,1,5.2,10H317.5v-.7a3.38,3.38,0,0,0-2.2-3.6,9.78,9.78,0,0,0-4.1-.9h-.5a8,8,0,0,0-3,.6,2.82,2.82,0,0,0-1.8,2.5c0,1.5,2,2.8,6.3,3.8,5.8,1.4,9.6,2.6,11.3,3.5,4,2.1,6.1,5.2,6.1,9.3a11.09,11.09,0,0,1-6.1,10.4,30.07,30.07,0,0,1-12.6,2.4Z"
                        />
                        <path
                          class="cls-1"
                          d="M312,27.1q7,0,11.4,3a11.3,11.3,0,0,1,5.1,9.8h-11v-.6a3.63,3.63,0,0,0-2.2-3.8,9.9,9.9,0,0,0-4.2-.9h-.4a7.31,7.31,0,0,0-3,.6,2.94,2.94,0,0,0-1.9,2.6c0,1.6,2.1,2.9,6.3,4,5.8,1.4,9.6,2.6,11.3,3.5,4,2.1,6,5.2,6,9.2a10.72,10.72,0,0,1-6,10.2c-3.2,1.7-7.3,2.6-12.4,2.6h-.1c-11.5,0-17.3-4.6-17.7-14h11.3a5.63,5.63,0,0,0,1.4,4.2c1.2,1.3,3.3,1.9,6.1,1.9,3.6,0,5.5-1.3,5.5-3.9,0-1.5-2-2.8-6.2-4-5.8-1.5-9.5-2.7-11-3.5-3.9-1.9-5.9-4.8-5.9-8.5a10.87,10.87,0,0,1,5.5-10A28,28,0,0,1,312,27.1m0-.3c-5,0-9.1.9-12.1,2.7-3.8,2.1-5.7,5.6-5.7,10.2q0,5.7,6,8.7c1.5.8,5.2,2,11.1,3.5,4,1.1,6,2.3,6,3.7,0,2.4-1.8,3.6-5.2,3.6-5,0-7.4-2.1-7.2-6.2H293c.3,9.7,6.3,14.5,17.9,14.5h.1c5.1,0,9.3-.9,12.5-2.6a11.06,11.06,0,0,0,6.2-10.5c0-4.1-2-7.2-6.1-9.4-1.7-.9-5.5-2-11.3-3.5-4.1-1-6.2-2.3-6.2-3.7a2.59,2.59,0,0,1,1.7-2.4,7.17,7.17,0,0,1,2.9-.6h.4a9.78,9.78,0,0,1,4.1.9,3.3,3.3,0,0,1,2.1,3.5V40h11.5a12.08,12.08,0,0,0-5.2-10.2,21.2,21.2,0,0,0-11.6-3Z"
                        />
                        <path
                          class="cls-1"
                          d="M351.4,67.2a19.14,19.14,0,0,1-14.1-5.5c-3.6-3.7-5.4-8.5-5.4-14.3a21.16,21.16,0,0,1,5.5-14.8c3.7-3.9,8.5-5.8,14.3-5.8h.7a17.11,17.11,0,0,1,13.4,6.4,22.32,22.32,0,0,1,4.9,14.9l-.1,2H343.7v.1a11.3,11.3,0,0,0,2.3,5.9,6.82,6.82,0,0,0,5.4,2.7h.3a7.71,7.71,0,0,0,4.2-1.3,5.54,5.54,0,0,0,2.4-3.4H370a16.68,16.68,0,0,1-6.8,9.8,20.78,20.78,0,0,1-11.4,3.3Zm-.1-31.9a6.61,6.61,0,0,0-5.1,2.3,8.51,8.51,0,0,0-2.3,5.4v.1h14.9V43a7.64,7.64,0,0,0-2.1-5.4,7.14,7.14,0,0,0-5.1-2.3Z"
                        />
                        <path
                          class="cls-1"
                          d="M352.4,26.9h0a16.92,16.92,0,0,1,13.3,6.4,22.06,22.06,0,0,1,4.9,14.8l-.1,1.9H343.6v.3a11.64,11.64,0,0,0,2.3,6,7.11,7.11,0,0,0,5.5,2.8h.3a8.32,8.32,0,0,0,4.3-1.3,6.12,6.12,0,0,0,2.5-3.4H370a16.29,16.29,0,0,1-6.7,9.5A20.69,20.69,0,0,1,352,67.2h-.6c-5.7,0-10.5-1.8-14-5.5S332,53.3,332,47.5a20.74,20.74,0,0,1,5.5-14.7A18.83,18.83,0,0,1,351.7,27h.1a1.27,1.27,0,0,1,.6-.1m-1.1,8.5v-.3a6.82,6.82,0,0,0-5.2,2.3,8.06,8.06,0,0,0-2.3,5.5v.3h15.1V43a7.88,7.88,0,0,0-2.1-5.5,6.82,6.82,0,0,0-5.2-2.3h-.2l-.1.2m1.1-8.8h-.7a19,19,0,0,0-14.4,5.9,20.87,20.87,0,0,0-5.6,14.9c0,5.9,1.8,10.7,5.5,14.4s8.4,5.6,14.2,5.6h.6A21.12,21.12,0,0,0,363.4,64a16.55,16.55,0,0,0,6.9-10h-12a6,6,0,0,1-2.4,3.4,7.65,7.65,0,0,1-4.1,1.3h-.3a6.49,6.49,0,0,1-5.3-2.7,10.42,10.42,0,0,1-2.2-5.9h26.9l.1-2.2A22.32,22.32,0,0,0,366.1,33a18.36,18.36,0,0,0-13.7-6.4Zm-1.1,8.8h.2a6.82,6.82,0,0,1,5,2.2,7.57,7.57,0,0,1,2.1,5.3H344a8,8,0,0,1,2.3-5.3,7,7,0,0,1,5-2.2Z"
                        />
                        <path
                          class="cls-1"
                          d="M375.8,79.5V69.8c3.5,0,5.5,0,6.2-.1,2.9-.5,4.3-1.7,4.3-3.7a6.47,6.47,0,0,0-.4-2L372.8,28.3h13c1.3,4.5,2.7,8.9,4,13.4a78.37,78.37,0,0,1,2.9,13.6h.2a64.72,64.72,0,0,1,2.5-13.7c1.3-4.4,2.7-8.9,4-13.3h12.8l-14,40.6c-1.7,4.8-3.7,7.9-6,9.2-1.8,1-5.6,1.5-11.2,1.5h-5.2Z"
                        />
                        <path
                          class="cls-1"
                          d="M385.7,28.3c1.3,4.4,2.7,8.9,4,13.3a78.37,78.37,0,0,1,2.9,13.6h.5a64.72,64.72,0,0,1,2.5-13.7c1.3-4.4,2.7-8.8,4-13.2h12.5l-14,40.4c-1.7,4.8-3.7,7.9-6,9.1-1.8,1-5.6,1.5-11.1,1.5h-5V69.9c3.5,0,5.4,0,6.1-.1,2.9-.5,4.4-1.8,4.4-3.8a7.79,7.79,0,0,0-.4-2.1l-13-35.5h12.6m26.7-.3h-13c-1.4,4.4-2.7,8.9-4.1,13.4a64.72,64.72,0,0,0-2.5,13.7,72.7,72.7,0,0,0-2.9-13.7c-1.4-4.5-2.7-9-4.1-13.4H372.6L385.8,64a4.48,4.48,0,0,1,.4,2q0,2.85-4.2,3.6c-.6.1-2.8.1-6.3.1v9.9h5.2c5.6,0,9.4-.5,11.3-1.5,2.4-1.3,4.4-4.3,6.1-9.2l14.1-40.8Z"
                        />
                      </g>
                    </g>
                  </g>
                </g>
              </svg>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              {/* <Link to="#features" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors px-3 py-1 rounded-sm hover:bg-white/60">
                Features
              </Link> */}
              <Link
                to="/pricing"
                className="text-gray-700 hover:text-indigo-600 font-medium transition-colors px-3 py-1 rounded-sm hover:bg-white/60 link-hover"
              >
                Pricing
              </Link>
              <Link
                to="/about"
                className="text-gray-700 hover:text-indigo-600 font-medium transition-colors px-3 py-1 rounded-sm hover:bg-white/60"
              >
                About
              </Link>
              <Link
                to="/faq"
                className="text-gray-700 hover:text-indigo-600 font-medium transition-colors px-3 py-1 rounded-sm hover:bg-white/60"
              >
                FAQ
              </Link>
              {/* <Link to="#contact" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors px-3 py-1 rounded-sm hover:bg-white/60">
                Contact
              </Link> */}
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <a
                href="https://chrome.google.com/webstore"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-sm hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 border border-indigo-500/50 flex items-center gap-2"
              >
                <Chrome />
                Add to Chrome
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-sm hover:bg-white/50 transition-colors shadow-lg shadow-indigo-500/10 hover:shadow-xl hover:shadow-indigo-500/20 transform hover:-translate-y-0.5"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <FiX className="w-6 h-6 text-gray-600" />
              ) : (
                <FiMenu className="w-6 h-6 text-gray-600" />
              )}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden backdrop-blur-lg bg-white/70 border-b border-indigo-500/50 shadow-lg shadow-indigo-500/10"
            >
              <div className="container mx-auto px-4 py-4 space-y-4">
                <Link
                  to="#features"
                  className="block text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  Features
                </Link>
                <Link
                  to="#pricing"
                  className="block text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  Pricing
                </Link>
                <Link
                  to="#about"
                  className="block text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  About
                </Link>
                <Link
                  to="#contact"
                  className="block text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  Contact
                </Link>
                <div className="pt-4 space-y-2">
                  <a
                    href="https://chrome.google.com/webstore"
                    target="_blank"
                    rel="noopener noref errer"
                    className="block w-full px-4 py-2 text-center bg-indigo-600 text-white font-medium rounded-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transform hover:-translate-y-0.5 border border-indigo-500 border-indigo-500/50 flex items-center justify-center gap-2"
                  >
                    <Chrome />
                    Add to Chrome
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
      {/* Hero Section */}
      <Box
        sx={{
          background: "#6366f1",
          pt: { xs: 20, md: 24 },
          pb: { xs: 10, md: 14 },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: "2.5rem", md: "3.5rem" },
                    fontWeight: 800,
                    color: "#fff",
                    lineHeight: 1.2,
                    mb: 3,
                  }}
                >
                  Design & grow your
                  <Box
                    component="span"
                    sx={{
                      color: "#fff",
                      display: "block",
                    }}
                  >
                    business knowledge
                  </Box>
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: "white",
                    mb: 4,
                    fontSize: "1.125rem",
                    fontWeight: 400,
                  }}
                >
                  Discover expert insights, tips, and strategies to help your
                  business thrive in today's digital landscape.
                </Typography>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <StyledButton
                    variant="contained"
                    color="primary"
                    endIcon={<ArrowForwardIcon />}
                  >
                    Start Reading
                  </StyledButton>
                  <StyledButton
                    variant="outlined"
                    sx={{ backgroundColor: "#fff" }}
                  >
                    <p style={{ color: "#6366f1" }}> Browse Topics</p>
                  </StyledButton>
                </Box>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Box
                  component="img"
                  src="/Blogmain.jpg"
                  alt="Blog Hero"
                  sx={{
                    width: "100%",
                    maxWidth: 600,
                    height: "auto",
                    borderRadius: "10px",
                  }}
                />
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Featured Categories Section */}
      <Container
        maxWidth="lg"
        sx={{ mt: -8, mb: 8, position: "relative", zIndex: 2 }}
      >
        <Paper
          elevation={2}
          sx={{
            p: 4,
            borderRadius: 3,
            backgroundColor: "white",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              mb: 3,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <FeaturedPlayListIcon color="primary" />
            Popular Categories
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            {categories.map((category) => (
              <CategoryButton
                key={category}
                className={selectedCategory === category ? "active" : ""}
                onClick={() => setSelectedCategory(category)}
                startIcon={category === "All" ? <TrendingUpIcon /> : null}
              >
                {category}
              </CategoryButton>
            ))}
          </Box>
        </Paper>
      </Container>

      {/* Add Testimonials Section before Featured Posts */}
      <Container maxWidth="lg" sx={{ mt: 12, mb: 8 }}>
        <Typography
          variant="h4"
          sx={{
            mb: 6,
            fontWeight: 700,
            textAlign: "center",
            position: "relative",
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: -12,
              left: "50%",
              transform: "translateX(-50%)",
              width: 60,
              height: 4,
              bgcolor: "#6366f1",
              borderRadius: 2,
            },
          }}
        >
          What Our Readers Say
        </Typography>

        <Swiper
          modules={[Autoplay, Pagination, EffectCoverflow]}
          effect="coverflow"
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={isMobile ? 1 : 3}
          coverflowEffect={{
            rotate: 50,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: false,
          }}
          pagination={{ clickable: true }}
          autoplay={{
            delay: 2000,
            disableOnInteraction: false,
          }}
          className="testimonial-swiper"
        >
          {testimonials.map((testimonial) => (
            <SwiperSlide key={testimonial.id}>
              <motion.div whileHover={{ y: -5 }} className="p-6">
                <Paper
                  elevation={2}
                  sx={{
                    p: 4,
                    height: "100%",
                    bgcolor: "rgba(255, 255, 255, 0.8)",
                    backdropFilter: "blur(10px)",
                    borderRadius: 2,
                    position: "relative",
                  }}
                >
                  <FormatQuoteIcon
                    sx={{
                      fontSize: 40,
                      color: "#6366f1",
                      opacity: 0.3,
                      position: "absolute",
                      top: 16,
                      left: 16,
                    }}
                  />
                  <Typography
                    variant="body1"
                    sx={{
                      mb: 4,
                      fontStyle: "italic",
                      color: "#4B5563",
                      minHeight: 80,
                    }}
                  >
                    "{testimonial.content}"
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar
                      src={testimonial.author.avatar}
                      alt={testimonial.author.name}
                      sx={{
                        width: 56,
                        height: 56,
                        border: "2px solid #6366f1",
                      }}
                    />
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {testimonial.author.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {testimonial.author.role} at{" "}
                        {testimonial.author.company}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </Container>

      {/* Featured Articles */}
      {featuredPosts.length > 0 && (
        <Container maxWidth="lg" sx={{ mt: 12, mb: 8 }}>
          <Box sx={{ mb: 6, textAlign: "center" }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                position: "relative",
                display: "inline-block",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  bottom: -12,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 80,
                  height: 4,
                  background:
                    "linear-gradient(90deg, #6366f1 0%, #4f46e5 100%)",
                  borderRadius: 2,
                },
              }}
            >
              Featured Articles
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {featuredPosts.map((post, index) => (
              <Grid item xs={12} key={post.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      display: "flex",
                      overflow: "hidden",
                      borderRadius: 4,
                      backgroundColor: "white",
                      border: "1px solid",
                      borderColor: "rgba(0, 0, 0, 0.08)",
                      "&:hover": {
                        boxShadow: "0 8px 40px rgba(0, 0, 0, 0.08)",
                        transform: "translateY(-4px)",
                        "& img": {
                          transform: "scale(1.1) rotate(2deg)",
                        },
                      },
                      transition: "all 0.3s ease-in-out",
                    }}
                  >
                    {/* Image Container */}
                    <Box
                      sx={{
                        width: "40%",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        component="img"
                        src={post.image}
                        alt={post.title}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transition: "transform 0.5s ease",
                        }}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          top: 16,
                          left: 16,
                          zIndex: 1,
                        }}
                      >
                        <Chip
                          label="FEATURED"
                          size="small"
                          sx={{
                            borderRadius: "20px",
                            backgroundColor: "#6366f1",
                            color: "white",
                            fontWeight: 600,
                            mb: 1,
                          }}
                        />
                        <Chip
                          label={post.category}
                          size="small"
                          sx={{
                            borderRadius: "20px",
                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                            color: "#6366f1",
                            fontWeight: 600,
                            backdropFilter: "blur(4px)",
                          }}
                        />
                      </Box>
                    </Box>

                    {/* Content Container */}
                    <Box sx={{ width: "60%", p: 4 }}>
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 700,
                          mb: 2,
                          color: "#1f2937",
                        }}
                      >
                        {post.title}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          mb: 3,
                          color: "#6b7280",
                          fontSize: "1.1rem",
                        }}
                      >
                        {post.excerpt}
                      </Typography>

                      {/* Author and Meta Info */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          mt: 4,
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 2 }}
                        >
                          <Avatar
                            src={`https://ui-avatars.com/api/?name=${post.author}&background=6366f1&color=fff`}
                            sx={{
                              width: 48,
                              height: 48,
                              border: "2px solid white",
                              boxShadow: "0 0 0 2px #6366f1",
                            }}
                          />
                          <Box>
                            <Typography
                              variant="subtitle1"
                              sx={{ fontWeight: 600, color: "#1f2937" }}
                            >
                              {post.author}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#6b7280",
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              <AccessTimeIcon sx={{ fontSize: 14 }} />
                              {post.readTime}
                            </Typography>
                          </Box>
                        </Box>
                        <Typography
                          variant="caption"
                          sx={{ color: "#6b7280", fontWeight: 500 }}
                        >
                          {post.date}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      )}

      {/* Regular Posts */}
      <Container maxWidth="lg" sx={{ mt: 8, mb: 8 }}>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 700 }}>
          Latest Articles
        </Typography>
        <Grid container spacing={4}>
          {filteredPosts.map((post) => (
            <Grid item xs={12} md={4} key={post.id}>
              <motion.div whileHover={{ y: -8 }} transition={{ duration: 0.2 }}>
                <Paper
                  sx={{
                    overflow: "hidden",
                    borderRadius: 3,
                    backgroundColor: "white",
                    "&:hover img": {
                      transform: "scale(1.05)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      position: "relative",
                      paddingTop: "56.25%", // 16:9 aspect ratio
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      component="img"
                      src={post.image}
                      alt={post.title}
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transition: "transform 0.3s ease-in-out",
                      }}
                    />
                  </Box>
                  <Box sx={{ p: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                      }}
                    >
                      <Chip
                        label={post.category}
                        size="small"
                        sx={{
                          borderRadius: "12px",
                          backgroundColor: "rgba(99, 102, 241, 0.1)",
                          color: "#6366f1",
                          fontWeight: 600,
                        }}
                      />
                      <Typography variant="caption" sx={{ color: "#6b7280" }}>
                        {post.date}
                      </Typography>
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        mb: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {post.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {post.excerpt}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Avatar
                          src={`https://ui-avatars.com/api/?name=${post.author}&background=6366f1&color=fff`}
                          sx={{ width: 32, height: 32 }}
                        />
                        <Typography variant="body2" fontWeight={500}>
                          {post.author}
                        </Typography>
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          color: "#6b7280",
                        }}
                      >
                        <AccessTimeIcon sx={{ fontSize: 16 }} />
                        {post.readTime}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </div>
  );
};

export default Blogs;
