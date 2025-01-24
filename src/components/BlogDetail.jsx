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
  Paper,
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
} from "@mui/icons-material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { motion } from "framer-motion";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

const StyledContent = styled("div")(({ theme }) => ({
  "& img": {
    maxWidth: "100%",
    height: "auto",
    borderRadius: theme.spacing(2),
    marginBottom: theme.spacing(3),
  },
  "& p": {
    fontSize: "1.2rem",
    lineHeight: 1.8,
    marginBottom: theme.spacing(3),
    color: "#374151",
  },
  "& h2": {
    fontSize: "2rem",
    fontWeight: 700,
    marginTop: theme.spacing(6),
    marginBottom: theme.spacing(3),
    color: "#111827",
  },
  "& h3": {
    fontSize: "1.5rem",
    fontWeight: 600,
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(2),
    color: "#1F2937",
  },
  "& blockquote": {
    borderLeft: "4px solid #6366f1",
    paddingLeft: theme.spacing(0),
    margin: theme.spacing(0, 0),
    fontSize: "1.25rem",
    fontStyle: "italic",
    color: "#4B5563",
  },
  "& ul, & ol": {
    paddingLeft: theme.spacing(4),
    marginBottom: theme.spacing(3),
    "& li": {
      fontSize: "1.2rem",
      marginBottom: theme.spacing(1),
      color: "#374151",
    },
  },
}));

const SocialButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: "#fff",
  color: "#6366f1",
  "&:hover": {
    backgroundColor: "#6366f1",
    color: "white",
  },
  transition: "all 0.2s",
}));

const BlogDetail = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
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
            createdAt: docSnap.data().createdAt?.toDate().toLocaleDateString(),
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
              color: "#6366f1",
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
        pt: { xs: 2, md: 4 },
        pb: { xs: 4, md: 6 },
      }}
    >
      <Container maxWidth="lg">
        {/* Back Button */}
        <Box sx={{ mb: 4, display: "flex", justifyContent: "flex-start" }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{
              color: "#6366f1",
              "&:hover": {
                bgcolor: "rgba(99, 102, 241, 0.08)",
              },
              fontWeight: 600,
            }}
          >
            <Typography variant="body1" className="border-b-2 border-blue-500">
              Back to Articles
            </Typography>
          </Button>
        </Box>

        <Grid container justifyContent="center">
          <Grid item xs={12} md={10} lg={8}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 6 },
                borderRadius: 3,
                bgcolor: "white",
                textAlign: "center",
              }}
            >
              {/* Category */}
              <Box
                sx={{ display: "flex", justifyContent: "flex-start", mb: 3 }}
              >
                <Chip
                  label={blog.category}
                  sx={{
                    bgcolor: "rgba(99, 102, 241, 0.1)",
                    color: "#6366f1",
                    fontWeight: 600,
                  }}
                />
              </Box>

              {/* Title */}
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
                  fontWeight: 800,
                  mb: 4,
                  color: "#111827",
                  justifyContent: "flex-start",
                  alignItems: "start",
                  lineHeight: 1.2,
                }}
              >
                {blog.title}
              </Typography>

              {/* Author Info */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  mb: 4,
                  gap: 2,
                }}
              >
                <Avatar
                  src={`https://ui-avatars.com/api/?name=${blog.author}&background=6366f1&color=fff`}
                  sx={{ width: 48, height: 48 }}
                />
                <Box>
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    color="#111827"
                  >
                    {blog.author}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 2,
                      color: "#6B7280",
                    }}
                  >
                    <Typography variant="body2">{blog.createdAt}</Typography>
                    <Box
                      component="span"
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 0.5,
                      }}
                    >
                      <AccessTimeIcon sx={{ fontSize: 16 }} />
                      <Typography variant="body2">
                        {Math.ceil(blog.content?.length / 1000) ||
                          blog.readTime ||
                          "5"}{" "}
                        min read
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* Social Share */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-start",
                  gap: 1,
                  mb: 6,
                }}
              >
                <SocialButton size="small">
                  <TwitterIcon />
                </SocialButton>
                <SocialButton size="small">
                  <FacebookIcon />
                </SocialButton>
                <SocialButton size="small">
                  <LinkedInIcon />
                </SocialButton>
                <SocialButton size="small">
                  <ShareIcon />
                </SocialButton>
                <SocialButton size="small">
                  <BookmarkIcon />
                </SocialButton>
              </Box>

              {/* Featured Image */}
              {blog.imageUrl && (
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    maxWidth: "800px",
                    margin: "0 auto 6rem",
                  }}
                >
                  <Box
                    component="img"
                    src={blog.imageUrl}
                    alt={blog.title}
                    sx={{
                      width: "100%",
                      height: "auto",
                      borderRadius: 3,
                      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                </Box>
              )}

              {/* Content */}
              <Box sx={{ textAlign: "left" }}>
                <StyledContent
                  dangerouslySetInnerHTML={{ __html: blog.content }}
                />
              </Box>

              {/* Tags */}
              {blog.tags && blog.tags.length > 0 && (
                <Box sx={{ mt: 6, textAlign: "center" }}>
                  <Typography variant="h6" sx={{ mb: 2, color: "#111827" }}>
                    Related Topics
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 1,
                      justifyContent: "center",
                    }}
                  >
                    {blog.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        sx={{
                          bgcolor: "rgba(99, 102, 241, 0.1)",
                          color: "#6366f1",
                          "&:hover": {
                            bgcolor: "#6366f1",
                            color: "white",
                          },
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Author Bio */}
              <Box sx={{ mt: 8, p: 4, bgcolor: "#F3F4FF", borderRadius: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 2,
                    mb: 2,
                  }}
                >
                  <Avatar
                    src={`https://ui-avatars.com/api/?name=${blog.author}&background=6366f1&color=fff`}
                    sx={{ width: 64, height: 64 }}
                  />
                  <Box>
                    <Typography variant="h6" sx={{ color: "#111827" }}>
                      Written by {blog.author}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Professional content writer and business strategist
                    </Typography>
                  </Box>
                </Box>
                <Typography
                  variant="body1"
                  sx={{ color: "#4B5563", textAlign: "center" }}
                >
                  Expert in business finance and strategic planning with over 10
                  years of experience helping companies grow and succeed in
                  today's competitive market.
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default BlogDetail;
