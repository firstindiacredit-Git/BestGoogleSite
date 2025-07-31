import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import { Search } from "lucide-react";
import "./Landing.css";

const BrowserPreview = () => {
  return (
    <div className="mt-16 relative" id="hero">
      <div className="relative rounded-xl overflow-hidden p-2 bg-gray-200 border border-gray-300/80">
        {/* Browser Chrome UI */}
        <div className="h-10 bg-gray-100 border border-gray-300/80  border-b-0 rounded-t-xl flex items-center px-4 gap-2">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 ml-4">
            <input
              placeholder={`${window.location.origin}/search`}
              className="h-6 w-full max-w-md mx-auto bg-white rounded-md flex items-center px-3 text-sm text-gray-400"
            />
          </div>
        </div>

        {/* Images Container */}
        <div className="relative max-h-[490px]  border border-gray-300/80 border-t-0  rounded-b-xl shadow-md">
          <video
            src="https://res.cloudinary.com/dnjcel8gn/video/upload/v1751005894/MainHeroVid_gwomvb.webm"
            autoPlay
            muted
            loop
            className="w-full h-full object-cover"
          ></video>
        </div>
      </div>
    </div>
  );
};

// Add these styles to hide the default cursor

const LandingPage = () => {
  const features = [
    {
      name: "Push to deploy.",
      description:
        "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Maiores impedit perferendis suscipit eaque, iste dolor cupiditate blanditiis ratione.",
      icon: "CloudArrowUpIcon",
    },
    {
      name: "Database backups.",
      description:
        "Ac tincidunt sapien vehicula erat auctor pellentesque rhoncus. Et magna sit morbi lobortis.",
      icon: "ServerIcon",
    },
  ];
  const testimonials = [
    {
      quote:
        "AllMyTab has revolutionized how I manage my browser tabs. The ability to organize and access tabs across devices has made my workflow incredibly efficient. It's a game-changer for productivity!",
      name: "Rizwan",

      company: "SavvyCal",
      image:
        // "https://crm.pizeonfly.com/employee/employeeImage-1740052405901-Screenshot 2025-02-20 172204.png",
        "https://img.freepik.com/free-photo/portrait-white-man-isolated_53876-40306.jpg?t=st=1741669777~exp=1741673377~hmac=cf1b46d3ea3545ee4620ecdf0a62589066eca4fc9223f3f2b694c9ea9e1ccfcf&w=900",
      accent: "from-indigo-500 to-purple-500",
    },
    {
      quote:
        "As someone who works with multiple projects simultaneously, AllMyTab has been invaluable. The cloud sync feature ensures I never lose important tabs, and the organization tools are simply brilliant.",
      name: "Md Sharik",

      company: "SavvyCal",
      image:
        // "https://crm.pizeonfly.com/employee/employeeImage-1738233144046-135040117-min.png",
        "https://res.cloudinary.com/dnjcel8gn/image/upload/v1742461568/browsey/avatars/user_jTfsug2JedbBu9JroVpWszYlhlz1_1742461566816.png",
      accent: "from-indigo-500 to-purple-500",
    },

    {
      quote:
        "The tab management capabilities of AllMyTab have transformed my daily workflow. Being able to categorize and quickly search through tabs has saved me countless hours. It's an essential tool for any professional.",
      name: "Amit Kumar",

      company: "Brex",
      image:
        "https://img.freepik.com/free-photo/indian-man-smiling-mockup-psd-cheerful-expression-closeup-portra_53876-143269.jpg?t=st=1741669790~exp=1741673390~hmac=98f47bc29b505c3178c74891efaddc8753d15c3304bdf780db7893e123ef665e&w=996",
      accent: "from-purple-500 to-pink-500",
    },
    {
      quote:
        "I used to struggle with tab overload until I found AllMyTab. Now, I can easily manage hundreds of tabs across different projects. The cross-device sync feature is particularly impressive.",
      name: "Sinod",

      company: "Brex",
      image:
        "https://res.cloudinary.com/dnjcel8gn/image/upload/v1753941478/browsey/avatars/user_ChVLlqzgpAclhmZfGEHs7s4kPtk2_1749811128299.jpg",
      accent: "from-purple-500 to-pink-500",
    },
    {
      quote:
        "AllMyTab's intuitive interface and powerful organization features have made it an indispensable part of my daily routine. It's perfect for anyone who needs to maintain multiple research threads simultaneously.",
      name: "Sharim Hafiz",

      company: "Brex",
      image:
        "https://res.cloudinary.com/dnjcel8gn/image/upload/v1753942498/browsey/avatars/user_rGHjqhY9X7X7EhDT6w5xp6fjPOx2_1753942371369.jpg",
      accent: "from-purple-500 to-pink-500",
    },
    {
      quote:
        "The bookmark and tab management features in AllMyTab are exceptional. I can easily switch between work and personal projects, and the search functionality helps me find exactly what I need instantly.",
      name: "Pranjal",

      company: "Brex",
      image:
        "https://img.freepik.com/free-photo/close-up-portrait-handsome-unshaven-man-with-thick-beard-mustache-has-dark-hair-looks-seriously_273609-16755.jpg?t=st=1741669903~exp=1741673503~hmac=16d891bbf31286055014ca8d387ba137ba4d52e4c4c33a23a96549e1876d5b46&w=1060",
      accent: "from-purple-500 to-pink-500",
    },
    // Add more testimonials...
  ];

  const TestimonialsGrid = () => {
    return (
      <div className="relative bg-white/70 py-24">
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-lg font-semibold leading-8 tracking-tight text-indigo-600">
              Testimonials
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              We have worked with thousands of amazing people
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 grid-rows-1 gap-8 text-sm leading-6 text-gray-900 sm:mt-20 sm:grid-cols-2 xl:mx-0 xl:max-w-none xl:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="relative rounded-2xl  border border-gray-200 bg-white p-6 "
              >
                <div className="flex gap-x-4 mb-6">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="h-10 w-10 rounded-full object-cover bg-gray-50"
                  />
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-gray-600">
                      {parseInt(new Date().getFullYear() - index / 2)}
                    </div>
                  </div>
                </div>
                <figure className="relative">
                  <blockquote className="text-gray-900">
                    <p>{`"${testimonial.quote}"`}</p>
                  </blockquote>
                </figure>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background gradient with blur */}
      <div className="fixed inset-0 x bg-blue-50/50 backdrop-blur-3xl -z-10" />

      {/* Content */}
      <div className="relative z-10">
        {/* Navbar with glass effect */}
        <nav className="fixed w-[55%] px-10 border border-gray-200/80 rounded-full left-0 right-0 top-5 mx-auto bg-white/60 backdrop-blur-lg border-b  z-50">
          <div className="flex items-center justify-between h-16">
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
          </div>
        </nav>

        {/* Hero Section with modern gradient text */}
        <section className="mt-48 pb-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-7xl font-bold mb-6 bg-clip-text text-transparent bg-[#3C5DFF] tracking-tight"
              >
                Your Browser on Steroids!
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl text-gray-600/90 mb-8 max-w-2xl mx-auto"
              >
                Experience your browser with AllMyTab's powerful suite of tools
              </motion.p>

              {/* Modern call-to-action buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex justify-center gap-4"
              >
                <Link
                  to="/search"
                  className="px-8 py-4 bg-[#3C5DFF] text-white rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
                >
                  <Search className="w-5 h-5" />
                  Launch App
                </Link>
              </motion.div>
            </div>
            <div className="mt-8 relative">
              <BrowserPreview />
            </div>
          </div>
        </section>

        <div className=" py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <h2 className="text-center text-base/7 font-semibold text-indigo-600">
              Trusted by the innovative teams
            </h2>
            <div className="mx-auto mt-10 grid max-w-lg grid-cols-2 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-4 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-4">
              <a href="https://pizeonfly.com" target="_blank">
                <img
                  alt="Pizeonfly"
                  src="/pizeonfly.png"
                  width={158}
                  height={48}
                  className="col-span-2 brightness-50 hover:brightness-100 max-h-12 w-full object-contain lg:col-span-1"
                />
              </a>
              <a href="https://theamerica.online" target="_blank">
                <img
                  alt="America Online"
                  src="/AmericaOnline.png"
                  width={158}
                  height={48}
                  className="col-span-2   brightness-50 hover:brightness-100 max-h-12 w-full object-contain lg:col-span-1"
                />
              </a>
              <a href="https://a2zglobix.com" target="_blank">
                <img
                  alt="A2zGlobix"
                  src="/A2z.png"
                  width={158}
                  height={48}
                  className="col-span-2  brightness-50 hover:brightness-100 max-h-12 w-full object-contain sm:col-start-2 lg:col-span-1"
                />
              </a>
              <a href="https://thebritain.online" target="_blank">
                <img
                  alt="Britain Online"
                  src="/britainaonline.png"
                  width={158}
                  height={48}
                  className="col-span-2  brightness-50 hover:brightness-100 max-h-12 w-full object-contain lg:col-span-1"
                />
              </a>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 py-24 sm:py-32">
          <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
            <h2 className="text-center text-base/7 font-semibold text-indigo-600">
              Everything You Need
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-center text-4xl font-semibold tracking-tight text-balance text-gray-950 sm:text-5xl">
              Enhance your browsing experience
            </p>
            <div className="mt-10 grid gap-4 sm:mt-16 lg:grid-cols-2 lg:grid-rows-2">
              <div className="relative lg:row-span-2">
                <div className="absolute inset-px rounded-lg bg-white "></div>
                <div className="relative flex h-full flex-col overflow-hidden ">
                  <div className="px-8   pt-8 pb-3 sm:px-10 sm:pt-10 sm:pb-0">
                    <p className="mt-2 text-lg font-medium tracking-tight text-gray-950 max-lg:text-center">
                      Powerful Widget Experience
                    </p>
                    <p className="mt-2 max-w-lg text-sm/6 text-gray-600 max-lg:text-center">
                      • Fully customizable widgets that adapt to your needs -
                      Drag and drop interface for easy customization - Resize
                      and rearrange to match your workflow <br /> • Choose from
                      multiple stunning visual styles - Modern and classic
                      themes available - Custom color schemes and animations{" "}
                      <br /> • Create your perfect browsing companion - Save
                      your favorite layouts - Sync across all your devices{" "}
                      <br /> • Seamlessly integrates with daily use - Quick
                      access to essential tools - Optimized for productivity
                    </p>
                  </div>
                  <div className="@container g  relative flex flex-col justify-center  w-full grow max-lg:mx-auto max-lg:max-w-sm">
                    <div className=" h-fit relative overflow-hidden bottom-0">
                      <img
                        className="  object-contain  saturate-150 brightness-95   object-top"
                        src="/WidgetFull.png"
                        alt=""
                      />
                    </div>
                  </div>
                </div>
                <div className="pointer-events-none absolute inset-px rounded-lg ring-1 shadow-sm ring-black/5 lg:rounded-l-[2rem]"></div>
              </div>
              <div className="relative max-lg:row-start-1">
                <div className="absolute inset-px rounded-lg bg-white max-lg:rounded-t-[2rem]"></div>
                <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)] max-lg:rounded-t-[calc(2rem+1px)]">
                  <div className="px-8 pt-8 sm:px-10 sm:pt-10">
                    <p className="mt-2 text-lg font-medium tracking-tight text-gray-950 max-lg:text-center">
                      Performance
                    </p>
                    <p className="mt-2 max-w-lg text-sm/6 text-gray-600 max-lg:text-center">
                      Experience lightning-fast performance with our optimized
                      Widgets, Engineered every aspect for speed and efficiency.
                    </p>
                  </div>
                  <div className="flex flex-1 items-center justify-center px-8 max-lg:pt-10 max-lg:pb-12 sm:px-10 lg:pb-2">
                    <img
                      className="w-full  saturate-150 max-lg:max-w-xs"
                      src="/speed.png"
                      alt=""
                    />
                  </div>
                </div>
                <div className="pointer-events-none absolute inset-px rounded-lg ring-1 shadow-sm ring-black/5 max-lg:rounded-t-[2rem]"></div>
              </div>
              <div className="relative max-lg:row-start-3 lg:col-start-2 lg:row-start-2">
                <div className="absolute inset-px rounded-lg bg-white"></div>
                <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)]">
                  <div className="px-8 pt-8 sm:px-10 sm:pt-10">
                    <p className="mt-2 text-lg font-medium tracking-tight text-gray-950 max-lg:text-center">
                      Security
                    </p>
                    <p className="mt-2 max-w-lg text-sm/6 text-gray-600 max-lg:text-center">
                      Your data is protected with industry-standard encryption
                      and security measures. We prioritize your privacy and
                      safety.
                    </p>
                  </div>
                  <div className="@container flex flex-1 items-center max-lg:py-6 lg:pb-2">
                    <img
                      className="h-[min(152px,40cqw)]  saturate-150 object-cover"
                      src="/sec.png"
                      alt=""
                    />
                  </div>
                </div>
                <div className="pointer-events-none absolute inset-px rounded-lg ring-1 shadow-sm ring-black/5"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="  bg-white space-y-10 py-24 sm:py-32">
          <div className="mx-auto border border-gray-200/80 rounded-3xl p-8 max-w-7xl overflow-x-hidden   lg:px-8">
            <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
              <div className="lg:pt-4 lg:pr-8">
                <div className="lg:max-w-lg">
                  <h2 className="text-base/7 font-semibold text-indigo-600">
                    Deploy faster
                  </h2>
                  <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl">
                    A better workflow
                  </p>
                  <p className="mt-6 text-lg/8 text-gray-600">
                    experince seemless workflow with our powerful widgets.
                    Change the layout to match your workflow.
                  </p>
                  <dl className="mt-10 max-w-xl space-y-8 text-base/7 text-gray-600 lg:max-w-none">
                    {features.map((feature) => (
                      <div key={feature.name} className="relative pl-9">
                        <dt className="inline font-semibold text-gray-900">
                          <feature.icon
                            aria-hidden="true"
                            className="absolute top-1 left-1 size-5 text-indigo-600"
                          />
                          {feature.name}
                        </dt>{" "}
                        <dd className="inline">{feature.description}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
              <div className=" flex items-center">
                <img
                  alt="Product screenshot"
                  src="/WidgetGIF.gif"
                  className="w-full max-w-none rounded-xl"
                />
              </div>
            </div>
          </div>
          <div className="mx-auto border border-gray-200/80 rounded-3xl p-8 max-w-7xl overflow-x-hidden   lg:px-8">
            <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
              <div className=" flex   items-center">
                <img
                  alt="Product screenshot"
                  src="/WidgetLayout.gif"
                  style={{
                    objectFit: "fill",
                  }}
                  className=" h-[18.1rem] rounded-xl"
                />
              </div>
              <div className="lg:pt-4 lg:pr-8">
                <div className="lg:max-w-lg">
                  <h2 className="text-base/7 font-semibold text-indigo-600">
                    Change layout
                  </h2>
                  <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl">
                    Your choice matters.
                  </p>
                  <p className="mt-6 text-lg/8 text-gray-600">
                    Choose your style. Pick your favorite widgets. Drag and drop
                    to change the layout. Customize the widgets to your liking.
                  </p>
                  <dl className="mt-10 max-w-xl space-y-8 text-base/7 text-gray-600 lg:max-w-none">
                    {features.map((feature) => (
                      <div key={feature.name} className="relative pl-9">
                        <dt className="inline font-semibold text-gray-900">
                          <feature.icon
                            aria-hidden="true"
                            className="absolute top-1 left-1 size-5 text-indigo-600"
                          />
                          {feature.name}
                        </dt>{" "}
                        <dd className="inline">{feature.description}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="mx-auto border border-gray-200/80 rounded-3xl p-8 max-w-7xl overflow-x-hidden   lg:px-8">
            <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
              <div className="lg:pt-4 lg:pr-8">
                <div className="lg:max-w-lg">
                  <h2 className="text-base/7 font-semibold text-indigo-600">
                    Customize easily
                  </h2>
                  <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl">
                    Choose your style.
                  </p>
                  <p className="mt-6 text-lg/8 text-gray-600">
                    Customize your background transparency and appearance.
                    Choose from a variety of widgets customizations. then
                    fine-tune each widget's settings to match your style.
                  </p>
                  <dl className="mt-10 max-w-xl space-y-8 text-base/7 text-gray-600 lg:max-w-none">
                    {features.map((feature) => (
                      <div key={feature.name} className="relative pl-9">
                        <dt className="inline font-semibold text-gray-900">
                          <feature.icon
                            aria-hidden="true"
                            className="absolute top-1 left-1 size-5 text-indigo-600"
                          />
                          {feature.name}
                        </dt>{" "}
                        <dd className="inline">{feature.description}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
              <div className=" flex items-center">
                <img
                  alt="Product screenshot"
                  src="/Changegb.gif"
                  className=" rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Client Testimonials */}
        <section>
          <TestimonialsGrid />
        </section>

        {/* Footer */}
        <footer class="bg-blue-50/50">
          <div class="mx-auto w-full max-w-7xl p-4  lg:py-12">
            <div class="md:flex md:justify-between">
              <div class="mb-6 md:mb-0">
                <a href="https://allmytab.com/" class="flex items-center">
                  <img src="/LOGO.svg" class="h-12 me-3" alt="FlowBite Logo" />
                </a>
              </div>
              <div class="flex justify-between gap-10">
                <div>
                  <h2 class="mb-6 text-sm font-semibold text-gray-900 uppercase dark:text-white">
                    Resources
                  </h2>
                  <ul class="text-gray-500 dark:text-gray-400 font-medium">
                    <li class="mb-4">
                      <a
                        href="https://allmytab.com/blog"
                        class="hover:underline"
                      >
                        Blog
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://allmytab.com/pricing"
                        class="hover:underline"
                      >
                        Pricing
                      </a>
                    </li>
                  </ul>
                </div>
                {/* <div>
                  <h2 class="mb-6 text-sm font-semibold text-gray-900 uppercase dark:text-white">
                    Follow us
                  </h2>
                  <ul class="text-gray-500 dark:text-gray-400 font-medium">
                    <li class="mb-4">
                      <a
                        href="https://github.com/themesberg/flowbite"
                        class="hover:underline "
                      >
                        Github
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://discord.gg/4eeurUVvTy"
                        class="hover:underline"
                      >
                        Discord
                      </a>
                    </li>
                  </ul>
                </div> */}
                <div>
                  <h2 class="mb-6 text-sm font-semibold text-gray-900 text-center uppercase dark:text-white">
                    Legal
                  </h2>
                  <ul class="text-gray-500 dark:text-gray-400 font-medium">
                    <li class="mb-4">
                      <a href="#" class="hover:underline">
                        Privacy Policy
                      </a>
                    </li>
                    <li>
                      <a href="#" class="hover:underline">
                        Terms &amp; Conditions
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <hr class="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
            <div class="sm:flex sm:items-center sm:justify-between">
              <span class="text-sm text-gray-500 sm:text-center dark:text-gray-400">
                © {new Date().getFullYear()}{" "}
                <a href="https://allmytab.com/" class="hover:underline">
                  ALLMYTAB
                </a>
                . All Rights Reserved.
              </span>
              <div class="flex mt-4 sm:justify-center sm:mt-0">
                <a
                  href="#"
                  class="text-gray-500 hover:text-gray-900 dark:hover:text-white"
                >
                  <svg
                    class="w-4 h-4"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 8 19"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M6.135 3H8V0H6.135a4.147 4.147 0 0 0-4.142 4.142V6H0v3h2v9.938h3V9h2.021l.592-3H5V3.591A.6.6 0 0 1 5.592 3h.543Z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <span class="sr-only">Facebook page</span>
                </a>
                <a
                  href="#"
                  class="text-gray-500 hover:text-gray-900 dark:hover:text-white ms-5"
                >
                  <svg
                    class="w-4 h-4"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 21 16"
                  >
                    <path d="M16.942 1.556a16.3 16.3 0 0 0-4.126-1.3 12.04 12.04 0 0 0-.529 1.1 15.175 15.175 0 0 0-4.573 0 11.585 11.585 0 0 0-.535-1.1 16.274 16.274 0 0 0-4.129 1.3A17.392 17.392 0 0 0 .182 13.218a15.785 15.785 0 0 0 4.963 2.521c.41-.564.773-1.16 1.084-1.785a10.63 10.63 0 0 1-1.706-.83c.143-.106.283-.217.418-.33a11.664 11.664 0 0 0 10.118 0c.137.113.277.224.418.33-.544.328-1.116.606-1.71.832a12.52 12.52 0 0 0 1.084 1.785 16.46 16.46 0 0 0 5.064-2.595 17.286 17.286 0 0 0-2.973-11.59ZM6.678 10.813a1.941 1.941 0 0 1-1.8-2.045 1.93 1.93 0 0 1 1.8-2.047 1.919 1.919 0 0 1 1.8 2.047 1.93 1.93 0 0 1-1.8 2.045Zm6.644 0a1.94 1.94 0 0 1-1.8-2.045 1.93 1.93 0 0 1 1.8-2.047 1.918 1.918 0 0 1 1.8 2.047 1.93 1.93 0 0 1-1.8 2.045Z" />
                  </svg>
                  <span class="sr-only">Discord community</span>
                </a>
                <a
                  href="#"
                  class="text-gray-500 hover:text-gray-900 dark:hover:text-white ms-5"
                >
                  <svg
                    class="w-4 h-4"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 17"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M20 1.892a8.178 8.178 0 0 1-2.355.635 4.074 4.074 0 0 0 1.8-2.235 8.344 8.344 0 0 1-2.605.98A4.13 4.13 0 0 0 13.85 0a4.068 4.068 0 0 0-4.1 4.038 4 4 0 0 0 .105.919A11.705 11.705 0 0 1 1.4.734a4.006 4.006 0 0 0 1.268 5.392 4.165 4.165 0 0 1-1.859-.5v.05A4.057 4.057 0 0 0 4.1 9.635a4.19 4.19 0 0 1-1.856.07 4.108 4.108 0 0 0 3.831 2.807A8.36 8.36 0 0 1 0 14.184 11.732 11.732 0 0 0 6.291 16 11.502 11.502 0 0 0 17.964 4.5c0-.177 0-.35-.012-.523A8.143 8.143 0 0 0 20 1.892Z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <span class="sr-only">Twitter page</span>
                </a>
                <a
                  href="#"
                  class="text-gray-500 hover:text-gray-900 dark:hover:text-white ms-5"
                >
                  <svg
                    class="w-4 h-4"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 .333A9.911 9.911 0 0 0 6.866 19.65c.5.092.678-.215.678-.477 0-.237-.01-1.017-.014-1.845-2.757.6-3.338-1.169-3.338-1.169a2.627 2.627 0 0 0-1.1-1.451c-.9-.615.07-.6.07-.6a2.084 2.084 0 0 1 1.518 1.021 2.11 2.11 0 0 0 2.884.823c.044-.503.268-.973.63-1.325-2.2-.25-4.516-1.1-4.516-4.9A3.832 3.832 0 0 1 4.7 7.068a3.56 3.56 0 0 1 .095-2.623s.832-.266 2.726 1.016a9.409 9.409 0 0 1 4.962 0c1.89-1.282 2.717-1.016 2.717-1.016.366.83.402 1.768.1 2.623a3.827 3.827 0 0 1 1.02 2.659c0 3.807-2.319 4.644-4.525 4.889a2.366 2.366 0 0 1 .673 1.834c0 1.326-.012 2.394-.012 2.72 0 .263.18.572.681.475A9.911 9.911 0 0 0 10 .333Z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <span class="sr-only">GitHub account</span>
                </a>
                <a
                  href="#"
                  class="text-gray-500 hover:text-gray-900 dark:hover:text-white ms-5"
                >
                  <svg
                    class="w-4 h-4"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 0a10 10 0 1 0 10 10A10.009 10.009 0 0 0 10 0Zm6.613 4.614a8.523 8.523 0 0 1 1.93 5.32 20.094 20.094 0 0 0-5.949-.274c-.059-.149-.122-.292-.184-.441a23.879 23.879 0 0 0-.566-1.239 11.41 11.41 0 0 0 4.769-3.366ZM8 1.707a8.821 8.821 0 0 1 2-.238 8.5 8.5 0 0 1 5.664 2.152 9.608 9.608 0 0 1-4.476 3.087A45.758 45.758 0 0 0 8 1.707ZM1.642 8.262a8.57 8.57 0 0 1 4.73-5.981A53.998 53.998 0 0 1 9.54 7.222a32.078 32.078 0 0 1-7.9 1.04h.002Zm2.01 7.46a8.51 8.51 0 0 1-2.2-5.707v-.262a31.64 31.64 0 0 0 8.777-1.219c.243.477.477.964.692 1.449-.114.032-.227.067-.336.1a13.569 13.569 0 0 0-6.942 5.636l.009.003ZM10 18.556a8.508 8.508 0 0 1-5.243-1.8 11.717 11.717 0 0 1 6.7-5.332.509.509 0 0 1 .055-.02 35.65 35.65 0 0 1 1.819 6.476 8.476 8.476 0 0 1-3.331.676Zm4.772-1.462A37.232 37.232 0 0 0 13.113 11a12.513 12.513 0 0 1 5.321.364 8.56 8.56 0 0 1-3.66 5.73h-.002Z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <span class="sr-only">Dribbble account</span>
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
