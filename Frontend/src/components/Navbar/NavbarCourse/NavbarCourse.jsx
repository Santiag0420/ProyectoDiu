import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import "./NavbarCourse.css";
import { CounterUser } from "../../../Context/CounterUser";

function NavbarCourse() {
  const { user } = useContext(CounterUser);
  return (
    <nav className="navbar navbar-expand bg-body-tertiary navbarMyCourses">
      <div className="container-fluid containerLinksContentCourse">
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav d-block d-sm-none d-md-none d-lg-none d-xl-none d-xxl-none">
            <li className="nav-item dropdown">
              <button
                className="btn dropdown-toggle"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                id="btnLinksNavCourses"
              >
                Más
              </button>
              <ul
                className="dropdown-menu dropdown-menu-dark dropdownMenuNavCourses"
                style={{ backgroundColor: "gray" }}
              >
                <li className="nav-item">
                  <NavLink
                    to={"/mycourses/courseContent"}
                    className={({ isActive }) =>
                      isActive ? "nav-link active" : "nav-link"
                    }
                    aria-current="page"
                    aria-label="Link mi curso"
                    tabIndex="0"
                    end
                  >
                    Curso
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to={"/mycourses/courseContent/qualifications"}
                    className={({ isActive }) =>
                      isActive ? "nav-link active" : "nav-link"
                    }
                    aria-current="page"
                    aria-label="Link mi curso"
                    tabIndex="0"
                    end
                  >
                    Calificaciones
                  </NavLink>
                </li>
              </ul>
            </li>
          </ul>
          <ul className="navbar-nav d-none d-sm-flex d-md-flex d-lg-flex d-xl-flex d-xxl-flex">
            <li className="nav-item">
              <NavLink
                to={"/mycourses/courseContent"}
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
                aria-current="page"
                aria-label="Link mi curso"
                tabIndex="0"
                end
              >
                Curso
              </NavLink>
            </li>
            {user.rol === "Student" ? (
              <li className="nav-item">
                <NavLink
                  to={"/mycourses/courseContent/qualifications"}
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                  aria-current="page"
                  aria-label="Link mi curso"
                  tabIndex="0"
                  end
                >
                  Calificaciones
                </NavLink>
              </li>
            ) : null}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default NavbarCourse;
