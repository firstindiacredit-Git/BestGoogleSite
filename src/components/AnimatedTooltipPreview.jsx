import React from "react";

const people = [
  {
    id: 1,
    name: "Youtube",
    designation: "YouTube all Fav",
    image: "youtube.png",
    Link: "https://youtube.com/",
  },
  {
    id: 2,
    name: "Gmail",
    designation: "Google All Mails",
    image: "googlemail.png",
    Link: "https://mail.google.com/",
  },
  {
    id: 3,
    name: "Github",
    designation: "Github Easy Access",
    image: "github.png",
    Link: "https://github.com/",
  },
  {
    id: 4,
    name: "GoogleDrive",
    designation: "Google Your Drive Files",
    image: "googledrive.png",
    Link: "https://drive.google.com/",
  },
  {
    id: 5,
    name: "GoogleDocs",
    designation: "Write your Document",
    image: "googledoc.png",
    Link: "https://docs.google.com/",
  },
  {
    id: 6,
    name: "GoogleMeet",
    designation: "Google Meet For Meeting",
    image: "googlemeet.png",
    Link: "https://meet.google.com/",
  },
];

// Ensure the AnimatedTooltip component is defined
function AnimatedTooltip({ items }) {
  return (
    <div className="flex gap-0">
      {items.map((person) => (
        <div
          key={person.id}
          className="text-center bg-transparent rounded-lg transition-transform transform hover:scale-105 group"
        >
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <h3 className="text-md font-semibold   mb-2 w-16  transition-all duration-300 transform group-hover:translate-y-1 group-hover:translate-x-1">
              {person.name}
            </h3>
            {/* <p className="text-sm text-gray-500 group-hover:text-gray-100 group-hover:shadow-lg group-hover:shadow-gray-500 transition-all duration-300">
              {person.designation}
            </p> */}
          </div>
          <a href={person.Link} target="_blank" rel="noopener noreferrer">
            <img
              src={person.image}
              alt={person.name}
              className="w-10 h-10 mx-auto mt-0 mb-2"
            />
          </a>
        </div>
      ))}
    </div>
  );
}

export default function AnimatedTooltipPreview() {
  return (
    <div className="flex flex-col items-center mt-2 justify-center mb-10 w-full">
      <AnimatedTooltip items={people} />
    </div>
  );
}
