// // import React from 'react'
// // import { Link } from 'react-router-dom'
// // import { FaFilePdf, FaTh, FaList } from 'react-icons/fa';

// // const GridComponent = ({path,name,icon}) => {
// //     return (
// //         <div>
// //             <Link to={path} className="block">
// //                 <div className="flex flex-cols items-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
// //                     {/* Icon */}
// //                     <div className="text-4xl mb-4">{icon}</div>
// //                     {/* Tool Name */}
// //                     <button className="mt-auto bg-gray-100 text-gray-700 px-4 py-2 rounded-lg">
// //                         {name}
// //                     </button>
// //                 </div>
// //             </Link>
// //         </div>
// //     )
// // }

// // export default GridComponent

// import React from 'react';
// import { Link } from 'react-router-dom';

// const GridComponent = ({ path, name, icon }) => {
//   return (
//     <div className="flex justify-center">
//       <Link to={path} className="block w-52 h-44 p-4 bg-white shadow-sm rounded-lg border border-blue-500/20 hover:border-blue-300 transition-shadow duration-300">
//         {/* Icon */}
//         <div className="flex justify-center items-center w-16 h-16 rounded-md mx-auto">
//           <span className="text-white text-5xl">{icon}</span>
//         </div>

//         {/* Tool Name */}
//         <button className="mt-6 bg-gray-100 text-gray-800 px-4 py-2 rounded-lg w-full font-medium">
//           {name}
//         </button>
//       </Link>
//     </div>
//   );
// };

// export default GridComponent;

// import React from 'react';
// import { Link } from 'react-router-dom';

// const GridComponent = ({ path, name, icon }) => {
//   return (
//     <div className="flex justify-center w-64 sm:w-auto bg-white mb-6">
//       <Link
//         to={path}
//         className="relative block w-64 h-36 bg-white-100 shadow-sm rounded-lg border border-blue-500/20 hover:border-blue-300 transition-shadow duration-300"
//       >
//         {/* Icon with overlap */}
//         <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-lg flex justify-center items-center ">
//           <span className="text-white text-4xl">{icon}</span>
//         </div>

//         {/* Tool Name */}
//         <div className="flex items-center justify-center h-full pt-12">
//           <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium">
//             {name}
//           </button>
//         </div>
//       </Link>
//     </div>
//   );
// };

// export default GridComponent;

import React from "react";
import { Link } from "react-router-dom";

const GridComponent = ({ path, name, icon, onToolUse }) => {
  const handleClick = () => {
    // Store tool usage in localStorage
    const usedTools = JSON.parse(localStorage.getItem("usedTools") || "[]");
    if (!usedTools.includes(path)) {
      usedTools.push(path);
      localStorage.setItem("usedTools", JSON.stringify(usedTools));
      if (onToolUse) onToolUse();
    }
  };

  return (
    <Link to={path} className="block group" onClick={handleClick}>
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-gray-50 group-hover:bg-blue-50 transition-colors duration-200 mb-3">
            <span className="text-2xl">{icon}</span>
          </div>
          <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 text-center">
            {name}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default GridComponent;
