import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Avatar,
  Chip,
  Divider,
  IconButton,
  Button,
  Grid,
  Tooltip,
  TextField,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import {
  Twitter as TwitterIcon,
  Facebook as FacebookIcon,
  LinkedIn as LinkedInIcon,
  Bookmark as BookmarkIcon,
  Share as ShareIcon,
  MoreHoriz as MoreHorizIcon,
  FavoriteBorder as FavoriteBorderIcon,
  ChatBubbleOutline as ChatBubbleOutlineIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { motion } from "framer-motion";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

// Medium-inspired typography styling
const StyledContent = styled("div")(({ theme }) => ({
  "& img": {
    maxWidth: "100%",
    height: "auto",
    marginBottom: theme.spacing(4),
  },
  "& p": {
    fontFamily: "'Source Serif Pro', 'Georgia', serif",
    fontSize: "21px",
    lineHeight: 1.58,
    letterSpacing: "-0.003em",
    marginBottom: theme.spacing(3),
    color: "rgba(41, 41, 41, 1)",
  },
  "& h2": {
    fontFamily: "'Source Serif Pro', 'Georgia', serif",
    fontSize: "28px",
    fontWeight: 700,
    marginTop: theme.spacing(6),
    marginBottom: theme.spacing(2),
    color: "rgba(41, 41, 41, 1)",
    letterSpacing: "-0.016em",
  },
  "& h3": {
    fontFamily: "'Source Serif Pro', 'Georgia', serif",
    fontSize: "24px",
    fontWeight: 600,
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(2),
    color: "rgba(41, 41, 41, 1)",
    letterSpacing: "-0.012em",
  },
  "& blockquote": {
    borderLeft: "3px solid rgba(41, 41, 41, 1)",
    paddingLeft: theme.spacing(2),
    margin: theme.spacing(3, 0),
    fontFamily: "'Source Serif Pro', 'Georgia', serif",
    fontSize: "21px",
    fontStyle: "italic",
    color: "rgba(41, 41, 41, 0.9)",
    letterSpacing: "-0.003em",
  },
  "& ul, & ol": {
    paddingLeft: theme.spacing(4),
    marginBottom: theme.spacing(3),
    "& li": {
      fontFamily: "'Source Serif Pro', 'Georgia', serif",
      fontSize: "21px",
      marginBottom: theme.spacing(1),
      color: "rgba(41, 41, 41, 1)",
      letterSpacing: "-0.003em",
    },
  },
  "& a": {
    color: "#03a87c",
    textDecoration: "underline",
    textDecorationColor: "rgba(3, 168, 124, 0.4)",
    "&:hover": {
      textDecorationColor: "rgba(3, 168, 124, 1)",
    },
  },
  "& code": {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    padding: "3px 4px",
    borderRadius: "3px",
    fontFamily: "monospace",
  },
}));

// Floating social share bar
const FloatingSocialBar = styled(Box)(({ theme }) => ({
  position: "fixed",
  left: "2rem",
  top: "50%",
  transform: "translateY(-50%)",
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1.5),
  [theme.breakpoints.down("lg")]: {
    display: "none",
  },
}));

const SocialButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: "transparent",
  color: "rgba(117, 117, 117, 1)",
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  transition: "all 0.2s",
}));

const ClapsButton = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(0.5),
  cursor: "pointer",
  "&:hover": {
    "& .clap-icon": {
      backgroundColor: "rgba(3, 168, 124, 0.1)",
      color: "#03a87c",
    },
  },
}));

const RelatedArticleCard = styled(Box)(({ theme }) => ({
  width: 260,
  padding: theme.spacing(2),
  cursor: "pointer",
  borderRadius: theme.spacing(1),
  transition: "all 0.2s",
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.03)",
  },
}));

const BlogDetail = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([
    {
      id: "1",
      title: "How to Improve Your Business Strategy in 2023",
      author: "Jane Smith",
      imageUrl: "https://source.unsplash.com/random/400x300/?business",
    },
    {
      id: "2",
      title: "10 Financial Tips for Small Business Owners",
      author: "John Doe",
      imageUrl: "https://source.unsplash.com/random/400x300/?finance",
    },
    {
      id: "3",
      title: "The Future of Remote Work: Trends to Watch",
      author: "Sarah Johnson",
      imageUrl: "https://source.unsplash.com/random/400x300/?remote",
    },
  ]);
  const [claps, setClaps] = useState(0);
  const [comment, setComment] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const docRef = doc(db, "blogs", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setBlog({
            id: docSnap.id,
            ...docSnap.data(),
            createdAt: docSnap
              .data()
              .createdAt?.toDate()
              .toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              }),
          });
        } else {
          setError("Blog not found");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
    window.scrollTo(0, 0);
  }, [id]);

  const handleClap = () => {
    setClaps((prev) => prev + 1);
  };

  if (loading)
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#fff",
        }}
      >
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [1, 0.8, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Typography
            variant="h5"
            sx={{
              color: "#03a87c",
              fontWeight: 600,
            }}
          >
            Loading...
          </Typography>
        </motion.div>
      </Box>
    );

  if (error)
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#fff",
        }}
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );

  if (!blog) return null;

  return (
    <Box
      sx={{
        bgcolor: "#fff",
        minHeight: "100vh",
      }}
    >
      {/* Floating Social Bar */}
      <FloatingSocialBar>
        <ClapsButton onClick={handleClap}>
          <IconButton
            className="clap-icon"
            sx={{
              border: "1px solid rgba(230, 230, 230, 1)",
              p: 1,
              color: "rgba(117, 117, 117, 1)",
            }}
          >
            <FavoriteBorderIcon fontSize="small" />
          </IconButton>
          <Typography variant="body2" color="text.secondary">
            {claps}
          </Typography>
        </ClapsButton>
        <Divider sx={{ width: "24px", mx: "auto" }} />
        <SocialButton size="small">
          <ChatBubbleOutlineIcon fontSize="small" />
        </SocialButton>
        <SocialButton size="small">
          <BookmarkIcon fontSize="small" />
        </SocialButton>
        <SocialButton size="small">
          <ShareIcon fontSize="small" />
        </SocialButton>
        <SocialButton size="small">
          <MoreHorizIcon fontSize="small" />
        </SocialButton>
      </FloatingSocialBar>

      {/* Top Navigation */}
      <Box
        sx={{
          borderBottom: "1px solid rgba(230, 230, 230, 1)",
          py: 1.5,
          px: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{
            color: "rgba(41, 41, 41, 1)",
              "&:hover": {
              bgcolor: "rgba(0, 0, 0, 0.03)",
              },
            fontWeight: 400,
            textTransform: "none",
            }}
          >
          <Typography variant="body2">Back to Articles</Typography>
          </Button>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Tooltip title="Save">
            <IconButton size="small">
              <BookmarkIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="More options">
            <IconButton size="small">
              <MoreHorizIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        </Box>

      <Container maxWidth="md" sx={{ pt: 6, pb: 10 }}>
        {/* Article Header */}
        <Box sx={{ mb: 6 }}>
          {/* Category - subtle tag */}
          <Box sx={{ mb: 2 }}>
            <Chip
              label={blog.category}
              size="small"
              sx={{
                bgcolor: "rgba(242, 242, 242, 1)",
                color: "rgba(117, 117, 117, 1)",
                fontWeight: 400,
                borderRadius: "4px",
                height: "24px",
                  }}
                />
              </Box>

              {/* Title */}
              <Typography
                variant="h1"
                sx={{
              fontFamily: "'Source Serif Pro', 'Georgia', serif",
              fontSize: { xs: "32px", sm: "36px", md: "42px" },
              fontWeight: 700,
              mb: 3,
              color: "rgba(41, 41, 41, 1)",
                  lineHeight: 1.2,
              letterSpacing: "-0.016em",
                }}
              >
                {blog.title}
              </Typography>

          {/* Subtitle if available */}
          {blog.subtitle && (
            <Typography
              variant="h2"
              sx={{
                fontFamily: "'Source Serif Pro', 'Georgia', serif",
                fontSize: "22px",
                fontWeight: 400,
                color: "rgba(41, 41, 41, 0.9)",
                mb: 4,
                lineHeight: 1.4,
                letterSpacing: "-0.003em",
              }}
            >
              {blog.subtitle}
            </Typography>
          )}

          {/* Author Info - Minimal version */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
              justifyContent: "space-between",
              mb: 5,
                }}
              >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Avatar
                src={`https://ui-avatars.com/api/?name=${blog.author}&background=03a87c&color=fff`}
                  sx={{ width: 48, height: 48 }}
                />
                <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 500,
                      color: "rgba(41, 41, 41, 1)",
                      fontSize: "14px",
                    }}
                  >
                    {blog.author}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddIcon fontSize="small" />}
                    sx={{
                      borderRadius: "99px",
                      borderColor: "#03a87c",
                      color: "#03a87c",
                      textTransform: "none",
                      fontWeight: 400,
                      fontSize: "13px",
                      py: 0.5,
                      "&:hover": {
                        borderColor: "#03a87c",
                        backgroundColor: "rgba(3, 168, 124, 0.05)",
                      },
                    }}
                  >
                    Follow
                  </Button>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    color: "rgba(117, 117, 117, 1)",
                    fontSize: "13px",
                  }}
                >
                  <Typography variant="body2" sx={{ fontSize: "13px" }}>
                    {blog.createdAt}
                  </Typography>
                  <Box component="span" sx={{ fontSize: "13px" }}>
                    ·
                  </Box>
                    <Box
                      component="span"
                      sx={{
                        display: "flex",
                      alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                    <Typography variant="body2" sx={{ fontSize: "13px" }}>
                        {Math.ceil(blog.content?.length / 1000) ||
                          blog.readTime ||
                          "5"}{" "}
                        min read
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
          </Box>
              </Box>

              {/* Featured Image */}
              {blog.imageUrl && (
                <Box
                  sx={{
                    width: "100%",
              mb: 6,
                  }}
                >
                  <Box
                    component="img"
                    src={blog.imageUrl}
                    alt={blog.title}
                    sx={{
                      width: "100%",
                      height: "auto",
                maxHeight: "600px",
                objectFit: "cover",
                    }}
                  />
                </Box>
              )}

              {/* Content */}
              <Box sx={{ textAlign: "left" }}>
          <StyledContent dangerouslySetInnerHTML={{ __html: blog.content }} />
              </Box>

              {/* Tags */}
              {blog.tags && blog.tags.length > 0 && (
          <Box sx={{ mt: 6, mb: 6 }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 1,
                    }}
                  >
                    {blog.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        sx={{
                    bgcolor: "rgba(242, 242, 242, 1)",
                    color: "rgba(117, 117, 117, 1)",
                    borderRadius: "4px",
                          "&:hover": {
                      bgcolor: "rgba(230, 230, 230, 1)",
                          },
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}

        {/* Clap and Comment Section - Mobile only */}
        <Box
          sx={{
            display: { xs: "flex", lg: "none" },
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid rgba(230, 230, 230, 1)",
            borderBottom: "1px solid rgba(230, 230, 230, 1)",
            py: 2,
            my: 4,
          }}
        >
          <ClapsButton
            onClick={handleClap}
            sx={{ display: "flex", alignItems: "center" }}
          >
            <IconButton
              className="clap-icon"
              sx={{
                color: "rgba(117, 117, 117, 1)",
              }}
            >
              <FavoriteBorderIcon fontSize="small" />
            </IconButton>
            <Typography variant="body2" color="text.secondary">
              {claps}
            </Typography>
          </ClapsButton>
          <Box sx={{ display: "flex", gap: 1 }}>
            <SocialButton size="small">
              <ChatBubbleOutlineIcon fontSize="small" />
            </SocialButton>
            <SocialButton size="small">
              <BookmarkIcon fontSize="small" />
            </SocialButton>
            <SocialButton size="small">
              <ShareIcon fontSize="small" />
            </SocialButton>
          </Box>
        </Box>

              {/* Author Bio */}
        <Box
          sx={{
            mt: 8,
            mb: 6,
            p: 3,
            borderTop: "1px solid rgba(230, 230, 230, 1)",
            borderBottom: "1px solid rgba(230, 230, 230, 1)",
          }}
        >
                <Box
                  sx={{
                    display: "flex",
              alignItems: "flex-start",
                    gap: 2,
                    mb: 2,
                  }}
                >
                  <Avatar
              src={`https://ui-avatars.com/api/?name=${blog.author}&background=03a87c&color=fff`}
                    sx={{ width: 64, height: 64 }}
                  />
            <Box sx={{ flex: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ color: "rgba(41, 41, 41, 1)", fontWeight: 500 }}
                >
                      Written by {blog.author}
                    </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{
                    borderRadius: "99px",
                    borderColor: "#03a87c",
                    color: "#03a87c",
                    textTransform: "none",
                    fontWeight: 400,
                    "&:hover": {
                      borderColor: "#03a87c",
                      backgroundColor: "rgba(3, 168, 124, 0.05)",
                    },
                  }}
                >
                  Follow
                </Button>
                </Box>
                <Typography
                  variant="body1"
                sx={{
                  color: "rgba(117, 117, 117, 1)",
                  fontSize: "16px",
                  lineHeight: 1.6,
                }}
                >
                  Expert in business finance and strategic planning with over 10
                  years of experience helping companies grow and succeed in
                  today's competitive market.
                </Typography>
              </Box>
          </Box>
        </Box>

        {/* Response Section */}
        <Box sx={{ mt: 6, mb: 8 }}>
          <Typography
            variant="h6"
            sx={{
              mb: 3,
              fontWeight: 500,
              color: "rgba(41, 41, 41, 1)",
              fontSize: "20px",
            }}
          >
            Responses
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="What are your thoughts?"
            variant="outlined"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: "4px",
                fontSize: "16px",
                "& fieldset": {
                  borderColor: "rgba(230, 230, 230, 1)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(117, 117, 117, 1)",
                },
              },
            }}
          />
          <Button
            variant="contained"
            sx={{
              bgcolor: "#03a87c",
              color: "white",
              textTransform: "none",
              borderRadius: "99px",
              px: 3,
              "&:hover": {
                bgcolor: "#038f69",
              },
            }}
          >
            Respond
          </Button>
        </Box>

        {/* Related Articles */}
        <Box sx={{ mt: 8 }}>
          <Typography
            variant="h6"
            sx={{
              mb: 3,
              fontWeight: 500,
              color: "rgba(41, 41, 41, 1)",
              fontSize: "20px",
            }}
          >
            More from {blog.author}
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: 3,
              overflowX: "auto",
              pb: 2,
              "&::-webkit-scrollbar": {
                height: "6px",
              },
              "&::-webkit-scrollbar-track": {
                backgroundColor: "rgba(0, 0, 0, 0.05)",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "rgba(0, 0, 0, 0.2)",
                borderRadius: "3px",
              },
            }}
          >
            {relatedPosts.map((post) => (
              <RelatedArticleCard key={post.id}>
                <Box
                  component="img"
                  src={post.imageUrl}
                  alt={post.title}
                  sx={{
                    width: "100%",
                    height: "140px",
                    objectFit: "cover",
                    borderRadius: 1,
                    mb: 2,
                  }}
                />
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    fontSize: "16px",
                    mb: 1,
                    color: "rgba(41, 41, 41, 1)",
                    lineHeight: 1.4,
                  }}
                >
                  {post.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "rgba(117, 117, 117, 1)",
                    fontSize: "14px",
                  }}
                >
                  {post.author}
                </Typography>
              </RelatedArticleCard>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default BlogDetail;
