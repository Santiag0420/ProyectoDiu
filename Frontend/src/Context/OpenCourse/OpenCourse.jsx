import React, { useState } from "react";
import { ContextCourse } from "./ContextCourse";

function OpenCourse({ children }) {
  let initValueCourse = null;
  try {
    initValueCourse = JSON.parse(localStorage.getItem('courseAccessed'))
  } catch (error) {
    
  }
  
  const [openCourse, setOpenCourse] = useState(initValueCourse)
  return (
    <ContextCourse.Provider value={{ openCourse, setOpenCourse }}>
      {children}
    </ContextCourse.Provider>
  );
}

export default OpenCourse;
