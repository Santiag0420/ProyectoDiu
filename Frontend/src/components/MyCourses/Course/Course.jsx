import React, { useContext, useState } from "react";
import "./Course.css";
import { useNavigate } from "react-router-dom";
import { ContextCourse } from "../../../Context/OpenCourse/ContextCourse";
import { CounterUser } from "../../../Context/CounterUser";
import { AccesibilityContext } from "../../../Context/Accesibility/AccesibilityContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPencil } from "@fortawesome/free-solid-svg-icons";

function Course({
  name,
  code,
  id,
  imgCourse,
  onCourseDeleted,
  showModalOnDelete,
}) {
  const navigate = useNavigate();
  const { setOpenCourse } = useContext(ContextCourse);
  const { user } = useContext(CounterUser);
  const { speak, stopSpeak } = useContext(AccesibilityContext);
  const [nameEdited, setNameEdited] = useState(name);
  const [codeEdited, setCodeEdited] = useState(code);

  const resetValuesEditModal = () => {
    setCodeEdited(code);
    setNameEdited(name);
  };

  const openModal = (e) => {
    e.stopPropagation();
    document.getElementById("btnModalEditCourse").click();
  };

  function courseAccessed() {
    const course = { id, name };
    speak(null, "Se accedio al curso: " + name);
    localStorage.setItem("courseAccessed", JSON.stringify(course));
    setOpenCourse(course);
    navigate("/mycourses/courseContent");
  }

  async function deleteCourse(e) {
    e.stopPropagation();
    try {
      const resp = await fetch(
        `http://localhost:8081/courses/deleteCourse/${id}`,
        { method: "DELETE" }
      );
      if (!resp.ok) {
        throw new Error(`HTTP error! status: ${resp.status}`);
      }
      const data = await resp.json();
      console.log(data)
      if (data.message) {
        onCourseDeleted(true);
        showModalOnDelete("SUCCESS", "DELETECOURSE");
      }
    } catch (error) {
      showModalOnDelete("ERROR", "DELETECOURSE");
      console.error("ERROR:", JSON.stringify(error));
    }
  }

  async function editCourse(e) {
    e.stopPropagation();
    ("use strict");
    const form = document.querySelector("#formEditCourse");
    form.addEventListener("submit", async (event) => {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
        form.classList.add("was-validated");
      } else {
        event.preventDefault();
        form.classList.remove("was-validated");
        form.classList.add("needs-validation");
        try {
          const formData = new FormData();
          formData.append("id", id);
          formData.append("name", codeEdited);
          formData.append("code", nameEdited);
          const resp = await fetch(`http://localhost:8081/courses/editCourse`, {
            method: "POST",
            body: formData,
          });
          if (!resp.ok) {
            throw new Error(`HTTP error! status: ${resp.status}`);
          }
          const data = await resp.json();
          if (data.message) {
            onCourseDeleted(true);
            showModalOnDelete("SUCCESS", "EDITCOURSE");
            setCodeEdited(codeEdited);
            setNameEdited(nameEdited);
          }
        } catch (error) {
          showModalOnDelete("ERROR", "EDITCOURSE");
          console.error("ERROR:", JSON.stringify(error));
        }
      }
    });
  }

  return (
    <>
      <button
        type="button"
        className="btn btn-primary"
        data-bs-toggle="modal"
        data-bs-target="#modalEditCourse"
        id="btnModalEditCourse"
        style={{ display: "none" }}
      ></button>
      <div
        className="modal fade"
        id="modalEditCourse"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex="-1"
        aria-labelledby="staticBackdropLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1
                className="modal-title fs-5"
                id="staticBackdropLabel"
                tabIndex="0"
                aria-label="Modal editar curso"
                onFocus={(e) => speak(e)}
                onBlur={(e) => stopSpeak(e)}
              >
                Editar Curso
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Cerrar modal editar curso"
                onClick={resetValuesEditModal}
                tabIndex="0"
                onFocus={(e) => speak(e)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.currentTarget.click();
                  }
                }}
                onBlur={(e) => stopSpeak(e)}
              ></button>
            </div>
            <div className="modal-body">
              <form
                className="row needs-validation"
                id="formEditCourse"
                noValidate
              >
                <div className="col-6 mb-3">
                  <label htmlFor="inputNameCourse" className="form-label">
                    Nombre del curso:
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    value={nameEdited}
                    id="inputNameCourse"
                    name="nameCourse"
                    aria-label="input nombre del curso"
                    tabIndex="0"
                    onFocus={(e) => speak(e)}
                    onChange={(e) => setNameEdited(e.target.value)}
                    onBlur={(e) => stopSpeak(e)}
                    required
                  />
                  <div
                    className="invalid-feedback"
                    aria-label="Porfavor digite un nombre válido"
                    tabIndex="0"
                    onFocus={(e) => speak(e)}
                    onBlur={(e) => stopSpeak(e)}
                  >
                    Porfavor digite un nombre válido
                  </div>
                </div>
                <div className="col-6 mb-3">
                  <label htmlFor="inputCodeCourse" className="form-label">
                    Codigo del curso:
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    value={codeEdited}
                    aria-label="input codigo del curso"
                    tabIndex="0"
                    onFocus={(e) => speak(e)}
                    onChange={(e) => setCodeEdited(e.target.value)}
                    onBlur={(e) => stopSpeak(e)}
                    id="inputCodeCourse"
                    name="codeCourse"
                    required
                  />
                  <div
                    className="invalid-feedback"
                    aria-label="Porfavor digite un codigo válido"
                    tabIndex="0"
                    onFocus={(e) => speak(e)}
                    onBlur={(e) => stopSpeak(e)}
                  >
                    Porfavor digite un codigo válido
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                id="btnCloseModalEditCourse"
                aria-label="Cerrar modal editar curso"
                tabIndex="0"
                onFocus={(e) => speak(e)}
                onBlur={(e) => stopSpeak(e)}
                onClick={resetValuesEditModal}
              >
                Cerrar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                form="formEditCourse"
                id="buttonEditCourse"
                aria-label="Confirmar edición"
                tabIndex="0"
                onFocus={(e) => speak(e)}
                onBlur={(e) => stopSpeak(e)}
                onClick={editCourse}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="col-12 col-sm-12 col-md-6 col-xl-4 col-xxl-4 courseCol">
        <div
          className="card course"
          id={id}
          onClick={courseAccessed}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              courseAccessed();
            }
          }}
          tabIndex="0"
          aria-label={"Acceder al curso: " + name}
          onFocus={(e) => speak(e)}
          onBlur={(e) => stopSpeak(e)}
        >
          {user.rol === "Student" ? null : (
            <>
              <FontAwesomeIcon
                icon={faTrash}
                className="iconDeleteCourse"
                onClick={deleteCourse}
                aria-label={"Eliminar curso: " + name}
                tabIndex="0"
                onFocus={(e) => speak(e)}
                onBlur={(e) => stopSpeak(e)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    deleteCourse(e);
                  }
                }}
              />
              <FontAwesomeIcon
                icon={faPencil}
                className="iconEditCourse"
                onClick={openModal}
                aria-label={"Editar curso: " + name}
                tabIndex="0"
                onFocus={(e) => speak(e)}
                onBlur={(e) => stopSpeak(e)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    openModal(e);
                  }
                }}
              />
            </>
          )}
          <img
            src={`src/assets/backgroundDefaultCourse${imgCourse}.jpg`}
            className="card-img-top course"
            alt="..."
            id="courseImg"
          />
          <div className="card-body course">
            <h5
              className="card-title course"
              id="courseCode"
              aria-label={"Codigo de curso: " + code}
              tabIndex="0"
              onFocus={(e) => speak(e)}
              onBlur={(e) => stopSpeak(e)}
            >
              {code}
            </h5>
            <h5
              className="card-title course"
              id="courseName"
              aria-label={"Nombre de curso: " + name}
              tabIndex="0"
              onFocus={(e) => speak(e)}
              onBlur={(e) => stopSpeak(e)}
            >
              {name}
            </h5>
          </div>
        </div>
      </div>
    </>
  );
}

export default Course;
