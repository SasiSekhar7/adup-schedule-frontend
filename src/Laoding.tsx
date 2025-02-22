import { motion } from "framer-motion";

const Loading = () => {
  return (
    <div className="flex flex-col justify-center items-center h-screen bg-white text-gray-800">
      {/* Fade-in text */}
      <motion.h1 
        className="text-2xl font-medium mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        Please wait...
      </motion.h1>

      {/* Smooth Animated Dots */}
      <motion.div 
        className="flex space-x-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
      >
        <motion.span className="w-3 h-3 bg-blue-500 rounded-full" animate={{ y: [0, -10, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}></motion.span>
        <motion.span className="w-3 h-3 bg-blue-500 rounded-full" animate={{ y: [0, -10, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}></motion.span>
        <motion.span className="w-3 h-3 bg-blue-500 rounded-full" animate={{ y: [0, -10, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}></motion.span>
      </motion.div>

      {/* Subtext */}
      <motion.p
        className="mt-3 text-gray-500 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      >
        Loading, this won't take long.
      </motion.p>
    </div>
  );
};

export default Loading;
