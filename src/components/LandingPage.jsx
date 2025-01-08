import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiLock, FiBook, FiEdit3, FiCalendar, FiGrid, FiCloud, FiAward, FiCheck, FiPlus, FiMinus, 
         FiGithub, FiTwitter, FiInstagram, FiLinkedin, FiArrowRight, FiStar, FiUsers, FiGlobe, FiZap, FiShield, FiCpu, FiMenu, FiX } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import SearchPage from './SearchPage';
import Header from './Header';

const FeatureCard = ({ icon: Icon, title, description }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="p-6 rounded-2xl bg-white/60 backdrop-blur-lg border border-white/40 shadow-lg shadow-indigo-500/5 hover:shadow-xl hover:shadow-indigo-500/10 transition-all group"
  >
    <div className="bg-white/50 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
      <Icon className="w-7 h-7 text-indigo-600" />
    </div>
    <h3 className="text-xl font-bold mb-3 text-gray-900 drop-shadow-md">
      {title}
    </h3>
    <p className="text-gray-600 drop-shadow-sm">{description}</p>
  </motion.div>
);

const LandingPage = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className="min-h-screen bg-white relative">
      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-blue-100/50" />
        
        {/* Dotted Grid Pattern */}
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0" 
            style={{
              backgroundImage: `
                radial-gradient(circle at center, rgba(99, 102, 241, 0.15) 1.5px, transparent 1.5px),
                radial-gradient(circle at center, rgba(99, 102, 241, 0.1) 1.5px, transparent 1.5px)
              `,
              backgroundSize: '60px 60px, 120px 120px',
              backgroundPosition: '0 0, 30px 30px'
            }}
          />
        </div>

        {/* White Circles */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/4 w-4 h-4 rounded-full bg-white/40 backdrop-blur-sm border border-white/50" />
          <div className="absolute top-40 right-1/3 w-4 h-4 rounded-full bg-white/40 backdrop-blur-sm border border-white/50" />
          <div className="absolute bottom-60 left-1/3 w-4 h-4 rounded-full bg-white/40 backdrop-blur-sm border border-white/50" />
          <div className="absolute bottom-40 right-1/4 w-4 h-4 rounded-full bg-white/40 backdrop-blur-sm border border-white/50" />
        </div>

        {/* Blur Overlay */}
        <div className="absolute inset-0 backdrop-blur-[100px]" />
      </div>

      {/* Modern Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <nav className="mx-auto border border-white/20 bg-white/70 backdrop-blur-lg shadow-lg shadow-indigo-500/5">
          <div className="container mx-auto px-4">
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

              {/* CTA Buttons */}
              <div className="hidden md:flex items-center space-x-4">
                <Link to="/login" className="px-4 py-2 text-gray-700 font-medium hover:text-indigo-600 transition-colors rounded-lg border border-transparent hover:border-indigo-100 hover:bg-white/60">
                  Log in
                </Link>
                <Link to="/signup" className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 border border-indigo-500/50">
                  Sign up
                </Link>
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
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden backdrop-blur-lg bg-white/70 border-b border-white/40 shadow-lg shadow-indigo-500/10"
              >
                <div className="container mx-auto px-4 py-4 space-y-4">
                  <Link to="#features" className="block text-gray-600 hover:text-indigo-600 transition-colors">Features</Link>
                  <Link to="#pricing" className="block text-gray-600 hover:text-indigo-600 transition-colors">Pricing</Link>
                  <Link to="#about" className="block text-gray-600 hover:text-indigo-600 transition-colors">About</Link>
                  <Link to="#contact" className="block text-gray-600 hover:text-indigo-600 transition-colors">Contact</Link>
                  <div className="pt-4 space-y-2">
                    <Link to="/login" className="block w-full px-4 py-2 text-center text-gray-600 font-medium hover:bg-indigo-50 rounded-lg transition-colors">
                      Log in
                    </Link>
                    <Link to="/signup" className="block w-full px-4 py-2 text-center bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transform hover:-translate-y-0.5 border border-indigo-500/50">
                      Sign up
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </motion.header>

      {/* Hero Section */}
      <div className="relative">
        <div className="container mx-auto px-4 pt-40 pb-32">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-7xl font-bold text-gray-900 mb-8 tracking-tight"
            >
              Your Ultimate Digital{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-500">
                Toolkit
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
              <button className="px-8 py-4 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transform hover:-translate-y-0.5 border border-indigo-500/50">
                Get Started
              </button>
              <button className="px-8 py-4 rounded-xl bg-white/50 backdrop-blur-sm text-gray-900 font-semibold hover:bg-white/60 transition-all shadow-lg shadow-indigo-500/10 hover:shadow-xl hover:shadow-indigo-500/20 transform hover:-translate-y-0.5 border border-white/40">
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
                <img src={"/DashBoardPreview.png"} style={{borderRadius: "32px"}} className='block relative pointer-events-none shadow-2xl overflow-hidden border border-white/40 bg-white/80 ring-1 ring-indigo-500/10' alt="Search Page" />
              {/* Decorative Elements */}
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
        <div className="absolute bottom-40 right-10 w-24 h-24 opacity-20">
          <div className="grid grid-cols-3 gap-2">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-purple-500" />
            ))}
          </div>
        </div>
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

      {/* Problem & Solution Section */}
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4 drop-shadow-md">Problems We Solve</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Transforming common digital challenges into seamless solutions</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Problems */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 drop-shadow-sm">Common Challenges</h3>
            {[
              { icon: FiZap, text: "Scattered digital tools and resources" },
              { icon: FiShield, text: "Weak and insecure passwords" },
              { icon: FiCpu, text: "Complex data management" },
            ].map((problem, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
                className="flex items-start gap-4 backdrop-blur-lg bg-white/30 p-4 rounded-xl border border-white/40 shadow-lg shadow-indigo-500/10 hover:shadow-xl hover:shadow-indigo-500/20 transition-all"
              >
                <problem.icon className="w-6 h-6 text-red-500 mt-1" />
                <p className="text-gray-600">{problem.text}</p>
              </motion.div>
            ))}
          </div>
          {/* Solutions */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 drop-shadow-sm">Our Solutions</h3>
            {[
              { icon: FiZap, text: "All-in-one integrated platform" },
              { icon: FiShield, text: "Advanced password generation & management" },
              { icon: FiCpu, text: "Intuitive data organization tools" },
            ].map((solution, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
                className="flex items-start gap-4 backdrop-blur-lg bg-white/30 p-4 rounded-xl border border-white/40 shadow-lg shadow-indigo-500/10 hover:shadow-xl hover:shadow-indigo-500/20 transition-all"
              >
                <solution.icon className="w-6 h-6 text-green-500 mt-1" />
                <p className="text-gray-600">{solution.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Divider Line */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-indigo-200/20 to-transparent" />

      {/* Pricing Section */}
      <div className="backdrop-blur-lg bg-white/30 border-y border-white/40 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4 drop-shadow-md">Simple, Transparent Pricing</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Choose the plan that works best for you</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
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
                price: "9.99",
                features: [
                  "Advanced search",
                  "Unlimited storage",
                  "Priority support",
                  "All tools access"
                ],
                popular: true
              },
              {
                title: "Enterprise",
                price: "29.99",
                features: [
                  "Custom solutions",
                  "Dedicated support",
                  "API access",
                  "Team management"
                ],
                popular: false
              }
            ].map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className={`backdrop-blur-lg ${
                  plan.popular ? 'bg-indigo-600/90' : 'bg-white/30'
                } rounded-2xl p-8 border ${
                  plan.popular ? 'border-indigo-400' : 'border-white/40'
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
              className="backdrop-blur-lg bg-white/30 p-6 rounded-2xl border border-white/40 shadow-lg shadow-indigo-500/10 hover:shadow-xl hover:shadow-indigo-500/20 transition-all"
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
      <div className="backdrop-blur-lg bg-white/30 border-y border-white/40 py-20">
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
                className="backdrop-blur-lg bg-white/50 rounded-xl border border-white/40 overflow-hidden shadow-lg shadow-indigo-500/10 hover:shadow-xl hover:shadow-indigo-500/20 transition-all"
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
        <div className="backdrop-blur-lg bg-indigo-600/90 border-y border-white/20">
          <div className="relative container mx-auto px-4 py-20">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <h2 className="text-4xl md:text-5xl font-bold text-white drop-shadow-md">
                  Ready to Transform Your Digital Experience?
                </h2>
                <p className="text-xl text-white/80">
                  Join thousands of satisfied users who have already revolutionized their workflow with our platform.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link
                    to="/signup"
                    className="bg-white text-indigo-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transform hover:-translate-y-0.5 border border-indigo-500/50"
                  >
                    Get Started Free
                  </Link>
                  <Link
                    to="/contact"
                    className="bg-transparent text-white px-8 py-4 rounded-full font-semibold text-lg border-2 border-white hover:bg-white/10 transition-colors shadow-lg shadow-indigo-500/10 hover:shadow-xl hover:shadow-indigo-500/20 transform hover:-translate-y-0.5"
                  >
                    Contact Sales
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
                  <div className="text-center">
                    <h3 className="text-3xl font-bold text-white">100+</h3>
                    <p className="text-white/80">Tools & Features</p>
                  </div>
                  <div className="text-center">
                    <h3 className="text-3xl font-bold text-white">24/7</h3>
                    <p className="text-white/80">Customer Support</p>
                  </div>
                  <div className="text-center">
                    <h3 className="text-3xl font-bold text-white">99.9%</h3>
                    <p className="text-white/80">Uptime</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="backdrop-blur-lg bg-white/30 border-y border-white/40">
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
                Your ultimate digital toolkit for a more productive online experience.
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
