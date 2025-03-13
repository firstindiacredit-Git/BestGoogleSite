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
import { Link, useNavigate } from "react-router-dom";
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
import VisibilityIcon from "@mui/icons-material/Visibility";
import CommentIcon from "@mui/icons-material/Comment";
import ShareIcon from "@mui/icons-material/Share";

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

const HeroSection = styled(Box)(({ theme }) => ({
  position: "relative",
  background: "linear-gradient(135deg, #F3F4FF 0%, #E8E9FF 100%)",
  borderRadius: "0 0 50px 50px",
  overflow: "hidden",
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: 0,
    left: "10%",
    right: "10%",
    height: "100px",
    background:
      "linear-gradient(to bottom, transparent, rgba(243,244,255,0.8))",
    borderRadius: "50%",
    transform: "translateY(50%)",
  },
}));

const CategoryCard = styled(Paper)(({ theme }) => ({
  borderRadius: "20px",
  overflow: "hidden",
  position: "relative",
  cursor: "pointer",
  height: "280px",
  transition: "transform 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-8px)",
    "& .overlay": {
      background: "rgba(99, 102, 241, 0.7)",
    },
    "& img": {
      transform: "scale(1.1)",
    },
  },
}));

const CurvedSection = styled(Box)(({ theme }) => ({
  position: "relative",
  "&::before": {
    content: '""',
    position: "absolute",
    top: "-50px",
    left: 0,
    right: 0,
    height: "50px",
    background: "inherit",
    borderRadius: "50% 50% 0 0",
  },
}));

const FullWidthSection = styled(Box)(({ theme }) => ({
  width: "100vw",
  marginLeft: "calc(-50vw + 50%)",
  marginRight: "calc(-50vw + 50%)",
  position: "relative",
  background: "linear-gradient(135deg, #F3F4FF 0%, #E8E9FF 100%)",
  padding: theme.spacing(8, 0),
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "100px",
    background: "linear-gradient(to bottom, white, transparent)",
  },
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "100px",
    background: "linear-gradient(to top, white, transparent)",
  },
}));

const Blogs = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [blogs, setBlogs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
      .swiper-container {
        overflow: visible !important;
        padding: 50px 0;
      }
      
      .swiper-slide {
        transition: all 0.3s ease;
        opacity: 0.4;
      }
      
      .swiper-slide-active {
        opacity: 1;
        transform: scale(1.1);
      }
      
      .swiper-pagination {
        position: relative;
        margin-top: 40px;
      }
      
      .swiper-pagination-bullet {
        width: 10px;
        height: 10px;
        background: #6366f1;
        opacity: 0.5;
        transition: all 0.3s ease;
      }
      
      .swiper-pagination-bullet-active {
        width: 20px;
        border-radius: 5px;
        opacity: 1;
      }
    `;
    document.head.appendChild(styleSheet);

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
          image: doc.data().imageUrl,
          featured: doc.data().featured || false,
          tags: doc.data().tags || [],
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

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  const categories = [
    "All",
    "Business Finance",
    "Expense Management",
    "Bookkeeping",
    "Tax Tips",
    "Business Growth",
    "Financial Planning",
  ];

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

  const handleReadMore = (blogId) => {
    navigate(`/blog/${blogId}`);
  };

  if (error) return <div>Error: {error}</div>;

  return (
    <Box sx={{ bgcolor: "#fff" }}>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 bg-white/20 backdrop-blur-md  border-b border-gray-200/50`}
      >
        <nav className="fixed flex items-center justify-between h-16 w-[55%] backdrop-blur-md px-10 rounded-full left-0 right-0 top-5 mx-auto bg-white/60  border-b border-gray-200/20 z-50">
          <div className="flex items-center">
            <Link
              to="/"
              className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600"
            >
              <img src="/LOGO.svg" alt="AllMyTab" className="w-28 h-28" />
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/pricing"
              className="text-gray-600 hover:text-indigo-600 transition-colors"
            >
              Pricing
            </Link>
            <Link
              to="/about"
              className="text-gray-600 hover:text-indigo-600 transition-colors"
            >
              About
            </Link>
            <Link
              to="/search"
              className="px-4 py-2 bg-[#3C5DFF] text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Launch App
            </Link>
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
                    className=" w-full px-4 py-2 text-center bg-indigo-600 text-white font-medium rounded-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transform hover:-translate-y-0.5 border border-indigo-500 border-indigo-500/50 flex items-center justify-center gap-2"
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
      <HeroSection>
        <Container
          maxWidth="lg"
          sx={{ pt: { xs: 12, md: 15 }, pb: { xs: 8, md: 10 } }}
        >
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box>
                <Typography
                  variant="overline"
                  sx={{
                    color: "#6366f1",
                    fontWeight: 600,
                    mb: 2,
                    display: "block",
                  }}
                >
                  AllMyTab
                </Typography>
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 800,
                    mb: 3,
                    background: "linear-gradient(45deg, #6366f1, #8b5cf6)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    lineHeight: 1.2,
                  }}
                >
                  Design & grow your business knowledge
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: "#4B5563",
                    mb: 4,
                    fontWeight: 400,
                    lineHeight: 1.6,
                  }}
                >
                  Discover expert insights, tips, and strategies to help your
                  business thrive in today's digital landscape.
                </Typography>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <StyledButton
                    variant="contained"
                    sx={{
                      background: "linear-gradient(45deg, #6366f1, #8b5cf6)",
                      color: "white",
                      "&:hover": {
                        background: "linear-gradient(45deg, #4f46e5, #7c3aed)",
                      },
                    }}
                  >
                    Start Reading
                  </StyledButton>
                  <StyledButton
                    variant="outlined"
                    sx={{
                      borderColor: "#6366f1",
                      color: "#6366f1",
                      "&:hover": {
                        borderColor: "#4f46e5",
                        background: "rgba(99, 102, 241, 0.05)",
                      },
                    }}
                  >
                    Browse Topics
                  </StyledButton>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  position: "relative",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: "-10%",
                    right: "-10%",
                    width: "200px",
                    height: "200px",
                    background: "linear-gradient(45deg, #6366f1, #8b5cf6)",
                    borderRadius: "50%",
                    opacity: 0.1,
                    zIndex: 0,
                  },
                }}
              >
                <Box
                  component="img"
                  src="/Blogmain.jpg"
                  alt="blog-hero"
                  sx={{
                    width: "100%",
                    height: "auto",
                    borderRadius: "30px",
                    boxShadow: "0 20px 40px rgba(99, 102, 241, 0.2)",
                    transform: "rotate(deg)",
                    position: "relative",
                    zIndex: 1,
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </HeroSection>

      {/* Categories Section
      <FullWidthSection sx={{ my: 8 }}>
        <Container maxWidth="xl">
          <Typography
            variant="h3"
            align="center"
            sx={{
              mb: 6,
              fontWeight: 700,
              background: "linear-gradient(45deg, #6366f1, #8b5cf6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              position: "relative",
              "&::after": {
                content: '""',
                position: "absolute",
                bottom: "-16px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "80px",
                height: "4px",
                background: "linear-gradient(45deg, #6366f1, #8b5cf6)",
                borderRadius: "2px",
              },
            }}
          >
            Explore Categories
          </Typography>

          <Swiper
            effect="coverflow"
            grabCursor={true}
            centeredSlides={true}
            slidesPerView="auto"
            loop={true}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            coverflowEffect={{
              rotate: 35,
              stretch: 0,
              depth: 100,
              modifier: 1.5,
              slideShadows: true,
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            modules={[Autoplay, Pagination, EffectCoverflow]}
            className="mySwiper"
            breakpoints={{
              320: {
                slidesPerView: 1,
                spaceBetween: 20,
              },
              640: {
                slidesPerView: 2,
                spaceBetween: 30,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 40,
              },
              1280: {
                slidesPerView: 4,
                spaceBetween: 50,
              },
            }}
          >
            {[
              {
                name: "Yoga Basics",
                image: "/blog-1.jpg",
                count: "12 Articles",
                description:
                  "Start your yoga journey with fundamental poses and practices",
              },
              {
                name: "Meditation",
                image: "/blog-2.jpg",
                count: "8 Articles",
                description:
                  "Find inner peace through guided meditation sessions",
              },
              {
                name: "Mindfulness",
                image: "/blog-3.jpg",
                count: "15 Articles",
                description:
                  "Learn to live in the present moment with mindfulness techniques",
              },
              {
                name: "Flexibility",
                image: "/blog-4.jpg",
                count: "10 Articles",
                description:
                  "Improve your flexibility with targeted stretching routines",
              },
              {
                name: "Stress Reduction",
                image: "/blog-1.jpg",
                count: "9 Articles",
                description:
                  "Effective techniques for managing stress and anxiety",
              },
              {
                name: "Yoga Classes",
                image: "/blog-2.jpg",
                count: "14 Articles",
                description: "Join our virtual and in-person yoga classes",
              },
              {
                name: "Breathing Techniques",
                image: "/blog-3.jpg",
                count: "7 Articles",
                description: "Master pranayama and breathing exercises",
              },
              {
                name: "Yoga Philosophy",
                image: "/blog-4.jpg",
                count: "11 Articles",
                description: "Explore the ancient wisdom of yoga traditions",
              },
              {
                name: "Asanas",
                image: "/blog-1.jpg",
                count: "16 Articles",
                description: "Deep dive into yoga poses and their benefits",
              },
              {
                name: "Wellness",
                image: "/blog-2.jpg",
                count: "13 Articles",
                description: "Holistic approaches to health and well-being",
              },
              {
                name: "Yoga Lifestyle",
                image: "/blog-3.jpg",
                count: "8 Articles",
                description: "Incorporate yoga principles into daily life",
              },
              {
                name: "Teacher Training",
                image: "/blog-4.jpg",
                count: "6 Articles",
                description: "Resources for aspiring yoga instructors",
              },
            ].map((category, index) => (
              <SwiperSlide key={category.name}>
                <CategoryCard elevation={3}>
                  <Box sx={{ position: "relative", height: "100%" }}>
                    <Box
                      component="img"
                      src={category.image}
                      alt={category.name}
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transition: "transform 0.5s ease",
                      }}
                    />
                    <Box
                      className="overlay"
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background:
                          "linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.8))",
                        transition: "all 0.3s ease",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-end",
                        p: 3,
                        "&:hover": {
                          background:
                            "linear-gradient(to bottom, rgba(99,102,241,0.8), rgba(139,92,246,0.9))",
                        },
                      }}
                    >
                      <Typography
                        variant="h5"
                        sx={{
                          color: "white",
                          fontWeight: 600,
                          mb: 1,
                          textShadow: "0 2px 4px rgba(0,0,0,0.2)",
                        }}
                      >
                        {category.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "rgba(255,255,255,0.9)",
                          mb: 2,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {category.description}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ color: "rgba(255,255,255,0.9)" }}
                        >
                          {category.count}
                        </Typography>
                        <Button
                          variant="contained"
                          size="small"
                          sx={{
                            bgcolor: "rgba(255,255,255,0.15)",
                            backdropFilter: "blur(4px)",
                            color: "white",
                            "&:hover": {
                              bgcolor: "rgba(255,255,255,0.25)",
                            },
                          }}
                          endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
                        >
                          Explore
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </CategoryCard>
              </SwiperSlide>
            ))}
          </Swiper>
        </Container>
      </FullWidthSection> */}

      {/* Featured Posts */}
      <Box sx={{ py: 5, mt: 5 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            align="center"
            sx={{
              mb: 6,
              fontWeight: 700,
              background: "linear-gradient(45deg, #6366f1, #8b5cf6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Featured Articles
          </Typography>
          <Grid container spacing={4}>
            {featuredPosts.map((post) => (
              <Grid item xs={12} md={4} key={post.id}>
                <motion.div
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => handleReadMore(post.id)}
                  style={{ cursor: "pointer" }}
                >
                  <Paper
                    sx={{
                      borderRadius: "20px",
                      overflow: "hidden",
                      height: "100%",
                      bgcolor: "white",
                      boxShadow: "0 10px 30px rgba(99, 102, 241, 0.1)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        boxShadow: "0 20px 40px rgba(99, 102, 241, 0.2)",
                        "& img": {
                          transform: "scale(1.1)",
                        },
                      },
                    }}
                  >
                    <Box
                      sx={{
                        position: "relative",
                        paddingTop: "66%",
                        overflow: "hidden",
                        cursor: "pointer",
                      }}
                    >
                      <Box
                        component="img"
                        src={post.image}
                        alt={post.title}
                        sx={{
                          position: "absolute",
                          top: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transition: "transform 0.5s ease",
                        }}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          p: 2,
                          background:
                            "linear-gradient(transparent, rgba(0,0,0,0.8))",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-end",
                        }}
                      >
                        <Chip
                          label={post.category}
                          sx={{
                            bgcolor: "#6366f1",
                            color: "white",
                            fontWeight: 600,
                          }}
                        />
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <IconButton
                            size="small"
                            sx={{
                              color: "white",
                              bgcolor: "rgba(255,255,255,0.1)",
                              "&:hover": {
                                bgcolor: "rgba(255,255,255,0.2)",
                              },
                            }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            sx={{
                              color: "white",
                              bgcolor: "rgba(255,255,255,0.1)",
                              "&:hover": {
                                bgcolor: "rgba(255,255,255,0.2)",
                              },
                            }}
                          >
                            <ShareIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </Box>
                    <Box sx={{ p: 3 }}>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 700,
                          mb: 2,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          cursor: "pointer",
                          "&:hover": {
                            color: "#6366f1",
                          },
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
                          mt: 2,
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
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 2 }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                              color: "text.secondary",
                            }}
                          >
                            <AccessTimeIcon sx={{ fontSize: 16 }} />
                            {post.readTime}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                              color: "text.secondary",
                            }}
                          >
                            {post.date}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Latest Articles */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Typography
          variant="h3"
          align="center"
          sx={{
            mb: 6,
            fontWeight: 700,
            background: "linear-gradient(45deg, #6366f1, #8b5cf6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Latest Articles
        </Typography>
        <Grid container spacing={4}>
          {filteredPosts.map((post) => (
            <Grid item xs={12} md={4} key={post.id}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <Paper
                  sx={{
                    overflow: "hidden",
                    borderRadius: 3,
                    backgroundColor: "white",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                    "&:hover": {
                      boxShadow: "0 8px 30px rgba(0, 0, 0, 0.2)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      position: "relative",
                      paddingTop: "66%",
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
                        transition: "all 0.5s ease-in-out",
                      }}
                    />
                  </Box>
                  <Box sx={{ p: 3 }}>
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
                        mt: 2,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        {post.date}
                      </Typography>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => handleReadMore(post.id)}
                        sx={{
                          textTransform: "none",
                          borderRadius: 2,
                          py: 1,
                        }}
                      >
                        Read More
                      </Button>
                    </Box>
                  </Box>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Blogs;
