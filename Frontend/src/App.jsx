import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.min.js";
import LoginForm from "./components/loginForm/LoginForm";
import React from "react";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import Home from "./components/Home";
import PageIndex from "./components/PageIndex";
import StateUser from "./Context/StateUser";
import MyCourses from "./components/MyCourses";
import Navbar from "./components/Navbar";
import CourseContent from "./components/courseContent/CourseContent";
import OpenCourse from "./Context/OpenCourse/OpenCourse";
import UseAccesibility from "./Context/Accesibility/UseAccesibility";
import NavBar from "./components/Navbar/NavBar";
import ActivityContent from "./components/courseContent/Activity/ActivityContent/ActivityContent";
import OpenActivity from "./Context/OpenActivity/OpenActivity";
import DownloadFiles from "./components/DownloadFiles";
import GradeStudents from "./components/GradesStudents/GradeStudents";
import AdminUsers from "./components/Admin/AdminCourses";

function App() {
  return (
    <BrowserRouter>
      <StateUser>
        <UseAccesibility>
          <Routes>
            <Route path="/" element={<PageIndex />} />
            <Route path="/login" element={<LoginForm />} />
            <Route
              path="/home/*"
              element={
                <ProtectedRoute allowedRoles={["Admin", "Teacher", "Student"]}>
                  <Navbar />
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mycourses/*"
              element={
                <ProtectedRoute allowedRoles={["Admin", "Teacher", "Student"]}>
                  <OpenCourse>
                    <Navbar />
                    <MyCourses />
                  </OpenCourse>
                </ProtectedRoute>
              }
            />
            <Route
              path="/adminusers/*"
              element={
                <ProtectedRoute allowedRoles={["Admin"]} navigateTo={"/home"}>
                  <OpenCourse>
                    <Navbar />
                    <AdminUsers />
                  </OpenCourse>
                </ProtectedRoute>
              }
            />
            <Route
              path="/mycourses/courseContent/*"
              element={
                <ProtectedRoute allowedRoles={["Admin", "Teacher", "Student"]}>
                  <OpenCourse>
                    <Navbar />
                    <OpenActivity>
                      <CourseContent courseName={"Bases de datos"} />
                    </OpenActivity>
                  </OpenCourse>
                </ProtectedRoute>
              }
            />
            <Route
              path="/mycourses/courseContent/activityContent/*"
              element={
                <ProtectedRoute allowedRoles={["Admin", "Teacher", "Student"]}>
                  <NavBar />
                  <OpenActivity>
                    <ActivityContent />
                  </OpenActivity>
                </ProtectedRoute>
              }
            />
            <Route
              path="/mycourses/courseContent/qualifications/*"
              element={
                <ProtectedRoute allowedRoles={["Admin", "Teacher", "Student"]}>
                  <NavBar />
                  <OpenCourse>
                    <OpenActivity>
                      <GradeStudents />
                    </OpenActivity>
                  </OpenCourse>
                </ProtectedRoute>
              }
            />
            <Route
              path="/mycourses/courseContent/activityContent/downloadFiles/*"
              element={
                <ProtectedRoute allowedRoles={["Admin", "Teacher", "Student"]}>
                  <DownloadFiles />
                </ProtectedRoute>
              }
            />
          </Routes>
        </UseAccesibility>
      </StateUser>
    </BrowserRouter>
  );
}

export default App;
