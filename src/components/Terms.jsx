import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  useTheme,
  useMediaQuery,
  IconButton,
  Drawer,
} from "@mui/material";
import { FiMenu, FiX } from "react-icons/fi";
import { useNavigate, Link } from "react-router-dom";
import { Chrome, ChromeIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import GavelIcon from "@mui/icons-material/Gavel";
import SecurityIcon from "@mui/icons-material/Security";
import DescriptionIcon from "@mui/icons-material/Description";
import BlockIcon from "@mui/icons-material/Block";
import PaymentIcon from "@mui/icons-material/Payment";
import UpdateIcon from "@mui/icons-material/Update";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import EmailIcon from "@mui/icons-material/Email";

const Terms = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [activeSection, setActiveSection] = useState("1. Acceptance of Terms");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: `By installing and using AllMyTab's browser extension, you acknowledge that you have read, understood, and agree to be bound by these Terms of Use. If you do not agree to these terms, please uninstall the extension and discontinue its use.

These terms constitute a legally binding agreement between you and AllMyTab regarding your use of our AI-powered browser extension and related services.`,
    },
    {
      title: "2. User Accounts",
      content: `While most features are available without an account, some premium features may require registration. If you create an account, you agree to:
• Provide accurate information
• Keep your credentials secure
• Update your information as needed
• Accept responsibility for account activities
• Notify us of unauthorized access

You must be at least 13 years old to use our extension.`,
    },
    {
      title: "3. Service Usage",
      content: `Our browser extension is designed to enhance your browsing experience. You agree to:
• Use the extension for lawful purposes only
• Not attempt to reverse engineer the extension
• Not interfere with the extension's functionality
• Not use the extension to collect unauthorized data
• Respect other users' privacy

We reserve the right to disable access for users who violate these terms.`,
    },
    {
      title: "4. Data and Privacy",
      content: `Your privacy is important to us. By using our extension, you acknowledge that:
• We process browsing data as described in our Privacy Policy
• You maintain control over your browsing data
• We implement security measures to protect your information
• You can opt-out of data collection features
• We may use anonymized data to improve our AI

For complete information, please refer to our Privacy Policy.`,
    },
    {
      title: "5. Prohibited Activities",
      content: `The following activities are strictly prohibited:
• Attempting to bypass extension security measures
• Using the extension for malicious purposes
• Distributing modified versions of the extension
• Scraping or collecting data from other users
• Interfering with our AI systems
• Using the extension to violate others' privacy

Violations may result in immediate termination of access.`,
    },
    {
      title: "6. Payments and Billing",
      content: `For premium features:
• Payments are processed securely through trusted partners
• Subscriptions auto-renew unless cancelled
• Refunds are provided according to store policies
• Premium features may vary by platform
• Failed payments may limit premium access
• Prices may change with notice

Detailed pricing is available on our website.`,
    },
    {
      title: "7. Intellectual Property",
      content: `All aspects of our extension are protected by intellectual property rights:
• Our AI technology, code, and branding are our property
• Users retain rights to their browsing data
• You may not modify or redistribute our extension
• Feedback may be used for improvements
• Third-party services have their own IP rights

Unauthorized use of our intellectual property is prohibited.`,
    },
    {
      title: "8. Limitation of Liability",
      content: `To the extent permitted by law:\n\n 
• The extension is provided "as is"\n\
• We're not liable for browsing decisions\n\
• Our liability is limited to subscription costs\n\
• We don't guarantee AI accuracy\n\
• Service availability may vary\n\
• Third-party website content is not our responsibility\n\

These limitations protect our ability to provide innovative services.`,
    },
    {
      title: "9. Modifications to Terms",
      content: `We may update these terms:
• Changes will be announced via the extension
• Continued use means acceptance
• Major changes require explicit consent
• Users may opt-out by uninstalling
• Previous versions are available on request

Please review terms periodically for updates.`,
    },
    {
      title: "10. Contact Information",
      content: `For questions about these terms:
• Email: support@AllMyTab.ai
• Visit: www.AllMyTab.ai/contact
• GitHub: github.com/AllMyTab

We aim to respond to inquiries within 24 hours.`,
    },
  ];

  // Intersection Observer callback
  const handleIntersection = useCallback((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
        setActiveSection(entry.target.id);
      }
    });
  }, []);

  useEffect(() => {
    // Create observer for sections
    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin: "-20% 0px -60% 0px",
      threshold: [0.3],
    });

    // Observe all section elements
    sections.forEach((section) => {
      const element = document.getElementById(section.title);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [handleIntersection]);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const currentProgress = (window.pageYOffset / totalScroll) * 100;
      setScrollProgress(currentProgress);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSectionClick = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = -80;
      const y =
        element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
    setActiveSection(sectionId);
    if (isMobile) setDrawerOpen(false);
  };

  const NavigationContent = () => (
    <Box sx={{ p: 3, width: isMobile ? "100%" : "250px" }}>
      <Typography
        variant="h6"
        sx={{ mb: 3, fontWeight: 700, color: "#6366f1" }}
      >
        Quick Navigation
      </Typography>
      {sections.map((section) => (
        <Box
          key={section.title}
          onClick={() => handleSectionClick(section.title)}
          sx={{
            mb: 2,
            cursor: "pointer",
            position: "relative",
            transition: "all 0.3s ease",
            "&:hover": {
              "& .MuiTypography-root": { color: "#6366f1" },
              "& .MuiBox-root": {},
              transform: "translateX(8px)",
            },
          }}
        >
          <Typography
            variant="body2"
            sx={{
              py: 1,
              pl: 2,
              fontWeight: activeSection === section.title ? 600 : 400,
              color: activeSection === section.title ? "#1a237e" : "#666",
              transition: "all 0.3s ease",
            }}
          >
            {section.title}
          </Typography>
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              height: "2px",
              width: activeSection === section.title ? "100%" : "0%",
              bgcolor: "#6366f1",
              transition: "width 0.3s ease",
            }}
          />
          {activeSection === section.title && (
            <Box
              sx={{
                position: "absolute",
                left: 0,
                top: "50%",
                transform: "translateY(-50%)",
                width: "4px",
                height: "70%",
                bgcolor: "#6366f1",
                borderRadius: "0 2px 2px 0",
              }}
            />
          )}
        </Box>
      ))}
    </Box>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-b border-gray-200/80 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-indigo-600">
                AllMyTab
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-600 hover:text-indigo-600">
                Home
              </Link>
              <Link to="/docs" className="text-gray-600 hover:text-indigo-600">
                About
              </Link>
              <Link
                to="/search"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Launch App
              </Link>
            </div>
          </div>
        </div>
      </nav>
      {/* Progress Bar */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          zIndex: 1000,
          background: `linear-gradient(to right, #6366f1 ${scrollProgress}%, transparent 0)`,
        }}
      />

      {/* Header */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #6366f1 0%, #3949ab 100%)",
          color: "white",
          pt: { xs: 10, md: 15 },
          pb: { xs: 8, md: 12 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ position: "relative", zIndex: 2 }}>
            <Typography
              variant={isMobile ? "h3" : "h2"}
              component="h1"
              sx={{
                fontWeight: 800,
                textAlign: "center",
                mb: 3,
              }}
            >
              Terms of Use
            </Typography>
            <Typography
              variant="h6"
              sx={{
                textAlign: "center",
                opacity: 0.9,
                maxWidth: "800px",
                mx: "auto",
              }}
            >
              Please read these terms carefully before using our services. These
              terms outline your rights and responsibilities while using
              AllMyTab.
            </Typography>
          </Box>
        </Container>
        {/* Decorative Elements */}
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "5%",
            width: "300px",
            height: "300px",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
            transform: "translateY(-50%)",
            borderRadius: "50%",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: "-10%",
            right: "10%",
            width: "200px",
            height: "200px",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />
      </Box>

      {/* Mobile Navigation Toggle */}
      {isMobile && (
        <IconButton
          onClick={() => setDrawerOpen(true)}
          sx={{
            position: "fixed",
            right: 16,
            bottom: 16,
            bgcolor: "#6366f1",
            color: "white",
            boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
            zIndex: 1000,
            "&:hover": { bgcolor: "#3949ab" },
          }}
        >
          <MenuIcon />
        </IconButton>
      )}

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          "& .MuiDrawer-paper": {
            width: "80%",
            maxWidth: "300px",
            bgcolor: "white",
            boxShadow: "0 0 20px rgba(0,0,0,0.1)",
          },
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "flex-end", p: 1 }}>
          <IconButton onClick={() => setDrawerOpen(false)}>
            <ChevronRightIcon />
          </IconButton>
        </Box>
        <NavigationContent />
      </Drawer>

      {/* Main Content */}
      <Container
        maxWidth="lg"
        sx={{
          py: 6,
          mt: { xs: -6, md: -12 },
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "200px",
            background:
              "linear-gradient(180deg, rgba(26,35,126,0.03) 0%, rgba(26,35,126,0) 100%)",
            zIndex: -1,
          },
        }}
      >
        <Box sx={{ display: "flex", gap: 4, position: "relative" }}>
          {/* Sidebar Navigation */}
          {!isMobile && (
            <Box sx={{ width: "250px", flexShrink: 0 }}>
              <Box
                sx={{
                  position: "sticky",
                  top: 100,
                  maxHeight: "calc(100vh - 120px)",
                  overflowY: "auto",
                  transition: "all 0.3s ease",
                  scrollBehavior: "smooth",
                  "&::-webkit-scrollbar": {
                    width: "4px",
                  },
                  "&::-webkit-scrollbar-track": {
                    background: "transparent",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: "rgba(0,0,0,0.1)",
                    borderRadius: "4px",
                  },
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    bgcolor: "white",
                    borderRadius: 2,
                    border: "1px solid rgba(0,0,0,0.1)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  }}
                >
                  <NavigationContent />
                </Paper>
              </Box>
            </Box>
          )}

          {/* Content */}
          <Box sx={{ flex: 1 }}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                bgcolor: "white",
                borderRadius: 2,
                border: "1px solid rgba(0,0,0,0.1)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              }}
            >
              {sections.map((section) => (
                <Box
                  key={section.title}
                  id={section.title}
                  sx={{
                    mb: 6,
                    scrollMarginTop: "100px",
                    "&:not(:last-child)": {
                      pb: 4,
                      borderBottom: "1px solid rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                    <Box
                      sx={{
                        mr: 2,
                        p: 1,
                        borderRadius: 1,
                        bgcolor: "rgba(26,35,126,0.1)",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {section.title.includes("Acceptance") && (
                        <GavelIcon sx={{ color: "#6366f1" }} />
                      )}
                      {section.title.includes("User Accounts") && (
                        <PersonIcon sx={{ color: "#6366f1" }} />
                      )}
                      {section.title.includes("Service Usage") && (
                        <SettingsIcon sx={{ color: "#6366f1" }} />
                      )}
                      {section.title.includes("Data") && (
                        <SecurityIcon sx={{ color: "#6366f1" }} />
                      )}
                      {section.title.includes("Prohibited") && (
                        <BlockIcon sx={{ color: "#6366f1" }} />
                      )}
                      {section.title.includes("Payments") && (
                        <PaymentIcon sx={{ color: "#6366f1" }} />
                      )}
                      {section.title.includes("Intellectual") && (
                        <DescriptionIcon sx={{ color: "#6366f1" }} />
                      )}
                      {section.title.includes("Limitation") && (
                        <GavelIcon sx={{ color: "#6366f1" }} />
                      )}
                      {section.title.includes("Modifications") && (
                        <UpdateIcon sx={{ color: "#6366f1" }} />
                      )}
                      {section.title.includes("Contact") && (
                        <EmailIcon sx={{ color: "#6366f1" }} />
                      )}
                    </Box>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 700, color: "#6366f1" }}
                    >
                      {section.title}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "#444",
                      lineHeight: 1.7,
                      pl: 7,
                    }}
                  >
                    {section.content}
                  </Typography>
                </Box>
              ))}
            </Paper>
          </Box>
        </Box>
      </Container>
      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto justify-center text-center px-4">
          <p className="text-3xl mb-10 font-bold">AllMyTab</p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 ">
            {/* Product Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/features" className="hover:text-white">
                    Features
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" className="hover:text-white">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/about" className="hover:text-white">
                    About
                  </Link>
                </li>
                <li>
                  <Link to="/blog" className="hover:text-white">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/privacy" className="hover:text-white">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-white">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-gray-800 mt-12 pt-8 flex justify-between items-center">
            <p>© 2024 AllMyTab. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white">
                Twitter
              </a>
              <a href="#" className="hover:text-white">
                GitHub
              </a>
              <a href="#" className="hover:text-white">
                Discord
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Terms;
