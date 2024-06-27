import React from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { CounterUser } from "../../Context/CounterUser";
import { AccesibilityContext } from "../../Context/Accesibility/AccesibilityContext";
import NavbarCourse from "./NavbarCourse";
import "./stylesNav.css";

function NavBar() {
  let location = useLocation();
  const redirect = useNavigate();
  const { user, setUser } = useContext(CounterUser);
  const { speak, stopSpeak, setUseSpeak, useSpeak } =
    useContext(AccesibilityContext);
  function closeSession() {
    speak(null, "Sesión cerrada");
    localStorage.clear();
    setUser(null);
    redirect("/login");
  }

  return (
    <header className="fixed-top">
      <nav
        className="navMain navbar navbar-expand-md bg-body-tertiary p-0"
        data-bs-theme="dark"
      >
        <div className="container-fluid">
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#offcanvasNavbar"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <NavLink
            to={"/mycourses"}
            className="navbar-brand d-none d-sm-block d-md-block d-lg-block d-xxl-block"
            aria-label="Universidad Guepardex"
            tabIndex="0"
            onFocus={(e) => speak(e)}
            onBlur={stopSpeak}
          >
            Universidad Guepardex
          </NavLink>
          <div className="collapse navbar-collapse" id="navbarTogglerDemo03">
            <ul className="navbar-nav">
              <li className="nav-item">
                <NavLink
                  to={"/home"}
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                  aria-current="page"
                  aria-label="Link Página principal"
                  tabIndex="0"
                  onFocus={(e) => speak(e)}
                  onBlur={stopSpeak}
                >
                  Página principal
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to={"/mycourses"}
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                  aria-current="page"
                  aria-label="Link mis cursos"
                  tabIndex="0"
                  onFocus={(e) => speak(e)}
                  onBlur={stopSpeak}
                  end
                >
                  Mis cursos
                </NavLink>
              </li>
              {user.rol === "Admin" && (
                <li className="nav-item">
                  <NavLink
                    to={"/adminusers"}
                    className={({ isActive }) =>
                      isActive ? "nav-link active" : "nav-link"
                    }
                    aria-current="page"
                    end
                  >
                    Administar Usuarios
                  </NavLink>
                </li>
              )}
            </ul>
          </div>
          <div className="dropdown" data-bs-theme="light">
            <button
              className="btn dropdown space-between"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="true"
              aria-label="Botón menú"
              tabIndex="0"
              onFocus={(e) => speak(e)}
              onBlur={stopSpeak}
            >
              <div id="circleProfile"> {user.name.charAt(0)} </div>
              <div id="arrowProfile" />
            </button>

            <ul className="dropdown-menu dropdown-menu-end">
              <li
                aria-label="Opción configuraciones"
                tabIndex="-1"
                onFocus={(e) => speak(e)}
                onBlur={stopSpeak}
              >
                <a className="dropdown-item" href="#" aria-hidden="true">
                  Action
                </a>
              </li>
              <li
                aria-label="Opción Accesibilidad"
                tabIndex="-1"
                onClick={() => {
                  if (useSpeak) {
                    speak(null, "Lector de texto desactivado");
                  } else {
                    speak(null, "Lector de texto activado", true);
                  }
                  setUseSpeak(!useSpeak);
                }}
                onFocus={(e) => speak(e)}
                //onBlur={stopSpeak}
              >
                <a className="dropdown-item" href="#" aria-hidden="true">
                  Accesibilidad
                </a>
              </li>
              <li
                aria-label="Opción cerrar sesión"
                tabIndex="-1"
                onFocus={(e) => speak(e)}
                onBlur={stopSpeak}
              >
                <a
                  onClick={closeSession}
                  className="dropdown-item"
                  href="#"
                  aria-hidden="true"
                >
                  Cerrar sesion
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      {location.pathname.startsWith("/mycourses/") &&
      !location.pathname.includes("/activityContent") ? (
        <NavbarCourse />
      ) : null}
      <div
        className="offcanvas offcanvas-start"
        tabIndex="-1"
        id="offcanvas "
        style={{
          maxWidth: "250px",
        }}
      ></div>
    </header>
  );
}

export default NavBar;
