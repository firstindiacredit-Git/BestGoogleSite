import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiLock, FiBook, FiEdit3, FiCheck, FiPlus, FiMinus, 
         FiGithub, FiTwitter, FiInstagram, FiLinkedin, FiMenu, FiX } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { FaClock, FaExclamationCircle, FaHandSparkles,  FaPizzaSlice, FaShieldVirus } from 'react-icons/fa';
import { FlashlightOnOutlined } from '@mui/icons-material';
import { Chrome } from 'lucide-react';
import "./Landing.css"
const FeatureCard = ({ icon: Icon, title, description }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="p-6 rounded-2xl bg-white hover:border-indigo-600 cursor-default backdrop-blur-lg border border-gray-200/50 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all group"
  >
    <div className="bg-gray-50 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-50">
      <Icon className="w-7 h-7 text-indigo-600" />
    </div>
    <h3 className="text-xl font-semibold mb-2 text-gray-900">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </motion.div>
);

const LandingPage = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY > 10;
      setIsScrolled(scrolled);
      console.log('Scroll position:', window.scrollY, 'isScrolled:', scrolled);
    };

    // Add event listener
    window.addEventListener('scroll', onScroll);
    
    // Initial check
    onScroll();

    // Cleanup
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-[200vh] relative">
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 bg-white/20 backdrop-blur-md  border-b border-gray-200/50`}
      >
        <nav className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-500 bg-clip-text text-transparent">
                BGS
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="#features" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors px-3 py-1 rounded-lg hover:bg-white/60">
                Features
              </Link>
              <Link to="#pricing" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors px-3 py-1 rounded-lg hover:bg-white/60">
                Pricing
              </Link>
              <Link to="#about" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors px-3 py-1 rounded-lg hover:bg-white/60">
                About
              </Link>
              <Link to="#contact" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors px-3 py-1 rounded-lg hover:bg-white/60">
                Contact
              </Link>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <a 
                href="https://chrome.google.com/webstore"
                target="_blank"
                rel="noopener noreferrer" 
                className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 border border-indigo-500/50 flex items-center gap-2"
              >
                <Chrome />
                Add to Chrome
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-white/50 transition-colors shadow-lg shadow-indigo-500/10 hover:shadow-xl hover:shadow-indigo-500/20 transform hover:-translate-y-0.5"
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
                <Link to="#features" className="block text-gray-600 hover:text-indigo-600 transition-colors">Features</Link>
                <Link to="#pricing" className="block text-gray-600 hover:text-indigo-600 transition-colors">Pricing</Link>
                <Link to="#about" className="block text-gray-600 hover:text-indigo-600 transition-colors">About</Link>
                <Link to="#contact" className="block text-gray-600 hover:text-indigo-600 transition-colors">Contact</Link>
                <div className="pt-4 space-y-2">
                  <a
                    href="https://chrome.google.com/webstore"
                    target="_blank"
                    rel="noopener noref errer"
                    className="block w-full px-4 py-2 text-center bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transform hover:-translate-y-0.5 border border-indigo-500 border-indigo-500/50 flex items-center justify-center gap-2"
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
       {/* <div className="relative overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-white pt-20 pb-16 sm:pb-24"> */}
       <div className="relative overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-white pt-20 pb-16 sm:pb-24">
      <div className="absolute inset-y-0 w-full h-full">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
      </div>
        <div className="container mx-auto px-4 pt-40  pb-32 ">
          <div className="max-w-4xl mx-auto text-center z-20 mb-20">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-7xl font-bold text-gray-900 mb-8 tracking-tight"
            >
              Your Ultimate
              <br />
              <span className="wavy-underline mt-3 text-indigo-600 bg-indigo-50 px-2 pb-2 rounded-lg">
                Browser Toolkit
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl md:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto"
            >
              All your digital needs in one place. Search, organize, and create with ease.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center gap-4 mb-20"
            >
              <a
                href="https://chrome.google.com/webstore"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-semibold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transform hover:-translate-y-0.5 border border-indigo-500/50 flex items-center gap-3"
              >
                <Chrome />
                Add to Chrome - It's Free
              </a>
              <button className="px-8 py-4 rounded-xl bg-white/50 backdrop-blur-sm text-gray-900 font-semibold hover:bg-white/60 transition-all shadow-lg shadow-indigo-500/10 hover:shadow-xl hover:shadow-indigo-500/20 transform hover:-translate-y-0.5 border hover:border-indigo-500 border-indigo-500/20">
                Learn More
              </button>
            </motion.div>

            {/* SearchPage Preview */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative mx-auto"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-white/40 backdrop-blur-sm rounded-2xl transform -skew-y-1" />              
                
                <img src={"/DashBoardPreview.png"} style={{borderRadius: "32px"}} className='block  border-indigo-500/50 relative  shadow-2xl overflow-hidden border  hover:scale-105 transition-all ring-1 ring-indigo-500/10' alt="Search Page" />
            
              <div className="absolute -top-8 -left-8 w-16 h-16 bg-indigo-500/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-8 -right-8 w-16 h-16 bg-purple-500/10 rounded-full blur-2xl" />
            </motion.div>
          </div>
        </div>

        {/* Decorative Dots */}
        {/* <div className="absolute top-40 left-10 w-24 h-24 opacity-20">
          <div className="grid grid-cols-3 gap-2">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-indigo-500" />
            ))}
          </div>
        </div> */}
      </div>

      {/* Divider Line */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-indigo-200/20 to-transparent" />

      {/* Features Grid */}
      <div id="features" className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={FiSearch}
            title="Smart Search"
            description="Advanced search capabilities powered by cutting-edge algorithms"
          />
          <FeatureCard
            icon={FiLock}
            title="Password Generator"
            description="Create unbreakable passwords with our secure generator"
          />
          <FeatureCard
            icon={FiBook}
            title="Digital Notebook"
            description="Organize your thoughts with our intuitive note-taking system"
          />
          <FeatureCard
            icon={FiEdit3}
            title="Spreadsheet Tools"
            description="Powerful spreadsheet features for data management"
          />
        </div>
      </div>

      {/* Divider Line */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-indigo-200/20 to-transparent" />

      {/* Problem Section */}
      <div className="container mx-auto px-4 py-20 bg-gradient-to-b from-transparent to-indigo-50/30">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            The Challenge Today's{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-500">
              Digital Generation
            </span>{' '}
            Faces
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            In today's fast-paced digital world, Gen Z struggles with information overload, scattered resources, and complex digital tools.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl bg-white backdrop-blur-lg border border-gray-200/50 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all"
          >
            <div className="bg-gray-50 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
              <FaExclamationCircle className="w-7 h-7 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">Information Overload</h3>
            <p className="text-gray-600">Overwhelmed by the sheer volume of digital content and tools available online.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl bg-white backdrop-blur-lg border border-gray-200/50 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all"
          >
            <div className="bg-gray-50 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
              <FaClock className="w-7 h-7 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">Time Wastage</h3>
            <p className="text-gray-600">Hours lost switching between different apps and platforms to accomplish tasks.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-2xl bg-white backdrop-blur-lg border border-gray-200/50 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all"
          >
            <div className="bg-gray-50 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
              <FaPizzaSlice className="w-7 h-7 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">Fragmented Experience</h3>
            <p className="text-gray-600">Disconnected tools and platforms creating a disjointed digital experience.</p>
          </motion.div>
        </div>
      </div>

      {/* Divider Line */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-indigo-200/20 to-transparent" />

      {/* Solution Section */}
      <div className="container mx-auto px-4 py-20 bg-gradient-to-b from-indigo-50/30 to-transparent">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Introducing Your{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-500">
              All-in-One Solution
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Best Google Site brings together everything you need in one seamless platform, designed specifically for the digital generation.
          </p>
        </motion.div>

        <div className='max-w-7xl mx-auto'>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className=" w-full flex justify-between"
          >
            <div className="flex  max-w-xs flex-col items-start gap-4">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <FaHandSparkles className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Integration</h3>
                <p className="text-gray-600">All your favorite tools and services, unified in one intelligent platform.</p>
              </div>
            </div>

            <div className="flex max-w-xs  flex-col items-start gap-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FlashlightOnOutlined className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Lightning Fast</h3>
                <p className="text-gray-600">Get things done quickly with our intuitive interface and powerful features.</p>
              </div>
            </div>

            <div className="flex max-w-xs flex-col  items-start gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaShieldVirus className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure & Private</h3>
                <p className="text-gray-600">Your data is protected with enterprise-grade security measures.</p>
              </div>
            </div>
          </motion.div>

          {/* <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden border border-indigo-500/50 shadow-2xl bg-white/80">
              <img 
                src="/solution-preview.png" 
                alt="Solution Preview" 
                className="w-full h-auto"
                style={{ borderRadius: "24px" }}
              />
            </div>
            <div className="absolute -top-6 -right-6 w-12 h-12 bg-indigo-500/10 rounded-full blur-xl" />
            <div className="absolute -bottom-6 -left-6 w-12 h-12 bg-purple-500/10 rounded-full blur-xl" />
          </motion.div> */}
        </div>
      </div>

      {/* Divider Line */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-indigo-200/20 to-transparent" />

      {/* Pricing Section */}
      <div className="backdrop-blur-lg bg-gradient-to-b from-indigo-200/30 to-transparent  border-y border-indigo-500/50 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4 drop-shadow-md">Simple, Transparent Pricing</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Choose the plan that works best for you</p>
          </motion.div>
          <div className="flex justify-center gap-10">
            {[
              {
                title: "Free",
                price: "0",
                features: [
                  "Basic search features",
                  "Limited storage",
                  "Community support",
                  "Basic tools access"
                ],
                popular: false
              },
              {
                title: "Pro",
                price: "04.99",
                features: [
                  "Advanced search",
                  "Unlimited storage",
                  "Priority support",
                  "All tools access"
                ],
                popular: true
              },
            ].map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className={`backdrop-blur-lg  ${
                  plan.popular ? 'bg-indigo-600/90 border-indigo-800/50 hover:border-indigo-800 border ' : 'bg-white/30 border-indigo-500/50 hover:border-indigo-500 border'
                } rounded-2xl p-8 border ${
                  plan.popular ? ' border-indigo-500/50 hover:border-indigo-500 border' : ' border-indigo-500/50'
                } relative shadow-lg shadow-indigo-500/10 hover:shadow-xl hover:shadow-indigo-500/20 transition-all`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm">Most Popular</span>
                  </div>
                )}
                <h3 className={`text-2xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                  {plan.title}
                </h3>
                <div className="mb-6">
                  <span className={`text-4xl font-bold ${plan.popular ? 'text-white' : 'text-indigo-600'}`}>
                    ${plan.price}
                  </span>
                  <span className={plan.popular ? 'text-white/80' : 'text-gray-600'}>/month</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <FiCheck className={plan.popular ? 'text-white' : 'text-indigo-600'} />
                      <span className={plan.popular ? 'text-white/80' : 'text-gray-600'}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-3 rounded-xl font-semibold transition-colors ${
                    plan.popular
                      ? 'bg-white text-indigo-600 hover:bg-gray-100'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  } shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transform hover:-translate-y-0.5 border border-indigo-500/50`}
                >
                  Get Started
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Divider Line */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-indigo-200/20 to-transparent" />

      {/* Testimonials Section */}
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4 drop-shadow-md">What Our Users Say</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Real feedback from real users</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: "Sarah Chen",
              role: "Digital Creator",
              image: "https://i.pravatar.cc/150?img=5",
              content: "This platform has completely transformed how I manage my online presence. The tools are intuitive and powerful!"
            },
            {
              name: "Alex Johnson",
              role: "Entrepreneur",
              image: "https://i.pravatar.cc/150?img=8",
              content: "The all-in-one solution I've been looking for. Saves me hours every week and keeps everything organized."
            },
            {
              name: "Maria Garcia",
              role: "Student",
              image: "https://i.pravatar.cc/150?img=3",
              content: "As a student, the free tier gives me all the tools I need. The password generator is a game-changer!"
            }
          ].map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="backdrop-blur-lg bg-white/30 p-6 rounded-2xl border border-indigo-500/50 shadow-lg shadow-indigo-500/10 hover:shadow-xl hover:shadow-indigo-500/20 transition-all"
            >
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-gray-600 text-sm">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-gray-600 italic">{testimonial.content}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Divider Line */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-indigo-200/20 to-transparent" />

      {/* FAQ Accordion */}
      <div className="backdrop-blur-lg bg-white/30 border-y border-indigo-500/50 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4 drop-shadow-md">Frequently Asked Questions</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Find answers to common questions about our platform</p>
          </motion.div>
          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                question: "What makes your platform different?",
                answer: "Our platform combines multiple essential tools in one place, offering a seamless experience for managing your digital life. With advanced features and regular updates, we ensure you have the best tools at your disposal."
              },
              {
                question: "Is my data secure?",
                answer: "Yes, we take security seriously. All data is encrypted and stored securely. We use industry-standard security protocols and regularly update our security measures."
              },
              {
                question: "Can I upgrade or downgrade my plan?",
                answer: "Absolutely! You can change your plan at any time. Changes will be reflected in your next billing cycle."
              },
              {
                question: "Do you offer a free trial?",
                answer: "Yes, you can try our platform for free with our Basic plan. No credit card required!"
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="backdrop-blur-lg bg-white/50 rounded-xl border border-indigo-500/50 overflow-hidden shadow-lg shadow-indigo-500/10 hover:shadow-xl hover:shadow-indigo-500/20 transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center"
                >
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                  {openFaq === index ? (
                    <FiMinus className="text-indigo-600" />
                  ) : (
                    <FiPlus className="text-indigo-600" />
                  )}
                </button>
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-4"
                    >
                      <p className="text-gray-600">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Divider Line */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-indigo-200/20 to-transparent" />

      {/* CTA Section */}
      <div className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-20">
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-8"
            >
              Ready to Transform Your{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-500">
                Digital Experience?
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-600 mb-12"
            >
              Join thousands of users who have already enhanced their browsing experience with Best Google Site
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center gap-6"
            >
              <a
                href="https://chrome.google.com/webstore"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-semibold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transform hover:-translate-y-0.5 border border-indigo-500/50 flex items-center gap-3"
              >
                <Chrome/>
                Add to Chrome - It's Free
              </a>
              <span className="text-sm text-gray-500">Works with all Chromium-based browsers</span>
            </motion.div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/30 to-transparent -z-10" />
          <div className="absolute -top-8 -right-8 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
        </div>
      </div>

      {/* Stats Section */}
      <div className="backdrop-blur-lg bg-white/30 border-y border-indigo-500/50">
        <div className="container mx-auto px-4 py-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <h3 className="text-3xl font-bold text-gray-900">10M+</h3>
              <p className="text-gray-600">Active Users</p>
            </div>
            <div className="text-center">
              <h3 className="text-3xl font-bold text-gray-900">50+</h3>
              <p className="text-gray-600">Tools & Features</p>
            </div>
            <div className="text-center">
              <h3 className="text-3xl font-bold text-gray-900">99.9%</h3>
              <p className="text-gray-600">Uptime</p>
            </div>
            <div className="text-center">
              <h3 className="text-3xl font-bold text-gray-900">24/7</h3>
              <p className="text-gray-600">Support</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="backdrop-blur-lg bg-gray-900/95 border-t border-white/10">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">BGS</h2>
              <p className="text-gray-400">
                Your ultimate Chrome extension for a more productive online experience.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <FiTwitter className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <FiGithub className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <FiLinkedin className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <FiInstagram className="w-6 h-6" />
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-6">Product</h3>
              <ul className="space-y-4">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Enterprise</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-6">Resources</h3>
              <ul className="space-y-4">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">API Reference</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Community</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-6">Company</h3>
              <ul className="space-y-4">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Partners</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400"> 2025 BGS. All rights reserved.</p>
              <div className="flex gap-8">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
