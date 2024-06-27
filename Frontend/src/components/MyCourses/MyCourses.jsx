import React, { useState, useEffect, useContext } from "react";
import "./MyCourses.css";
import Course from "./Course/Course";
import Select from "react-select";
import { CounterUser } from "../../Context/CounterUser";
import { AccesibilityContext } from "../../Context/Accesibility/AccesibilityContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-regular-svg-icons";
import {
  faBook,
  faScaleBalanced,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";

function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [modalType, setModalType] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [courseCreated, setCourseCreated] = useState(false);
  const [CourseDeleted, setCourseDeleted] = useState(false);
  const [name, setName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const { user } = useContext(CounterUser);
  const { speak, stopSpeak } = useContext(AccesibilityContext);

  const modalAlertTypesCourse = {
    ERROR: {
      CLASS: "modal-title fs-5 text-danger",
      ADDCOURSE: "Ha ocurrido un error al intentar agregar el curso.",
      DELETECOURSE: "Ha ocurrido un error al intentar eliminar el curso.",
      EDITCOURSE: "Ha ocurrido un error al intentar editar el curso.",
    },
    WARNING: {
      CLASS: "modal-title fs-5 text-warning",
      COURSEDUPLICATE: "este curso ya existe, por favor ingrese otro.",
    },
    SUCCESS: {
      CLASS: "modal-title fs-5 text-success",
      ADDCOURSE: "El curso se ha añadido exitosamente",
      DELETECOURSE: "El curso se ha eliminado correctamente",
      EDITCOURSE: "El curso se modifico correctamente",
    },
  };

  useEffect(() => {
    fetch(`http://localhost:8081/registration/${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setCourses(data);
          setCourseCreated(false);
          setCourseDeleted(false);
        }
      })
      .catch((err) => {
        if (typeof err.json === "function") {
          err
            .json()
            .then((jsonError) => {
              console.log("Error JSON desde la API");
            })
            .catch((genericError) => {
              console.log("Error genérico desde la API");
            });
        } else {
          console.log("Error de Fetch");
        }
      });
  }, [CourseDeleted, courseCreated]);

  useEffect(() => {
    fetch("http://localhost:8081/users")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) {
          const newUsers = data.map((user) => ({
            value: user.id,
            label: user.username,
          }));
          setUsers(newUsers);
        }
      })
      .catch((err) => {});
  }, []);

  const showModal = (type, title) => {
    setModalType(type);
    setModalTitle(title);
    document.getElementById("btnModalSucces").click();
  };

  const handleChange = (options, actions) => {
    const removedOption = selectedParticipants.find(
      (option) => !options.includes(option)
    );
    if (removedOption) {
      speak(null, `Se ha eliminado al usuario ${removedOption.label}`);
    }
    if (actions === "select-option") {
      speak(
        null,
        `Se ha agregado al usuario ${options[options.length - 1].label}`
      );
    }
    setSelectedParticipants(options);
  };

  function addCourse(e) {
    "use strict";
    const form = document.querySelector("#formCreateCourse");
      if (!form.checkValidity()) {
        e.preventDefault();
        e.stopPropagation();
        form.classList.add("was-validated");
      } else {
        e.preventDefault();
        setName("");
        setCourseCode("");
        setSelectedParticipants([]);
        const integrantsCourse = [];

        selectedParticipants.forEach((integrante) => {
          if (integrante.value != "") {
            integrantsCourse[integrantsCourse.length] = integrante.value;
          }
        });
        fetch(
          `http://localhost:8081/courses/addCourse/${name}/${courseCode}/[${integrantsCourse}]/${user.id}`
        )
          .then((response) => response.json())
          .then((data) => {
            if (data == "PROCCESS_SUCCESFULLY") {
              const closeModal = document
                .getElementById("btnCloseModalCreateCourse")
                .click();
              setModalType("SUCCESS");
              setCourseCreated(true);
              setModalType("SUCCESS");
              setModalTitle("ADDCOURSE");
              const openModalSucces = document
                .getElementById("btnModalSucces")
                .click();
            } else if (data.code === "ER_DUP_ENTRY") {
              const closeModal = document
                .getElementById("btnCloseModalCreateCourse")
                .click();
              setModalType("WARNING");
              setModalTitle("COURSEDUPLICATE");
              const openModalSucces = document
                .getElementById("btnModalSucces")
                .click();
            }
          })
          .catch((error) => {
            form.classList.remove("was-validated");
            form.classList.add("needs-validation");
            setName("");
            setCourseCode("");
            setSelectedParticipants([]);
            console.log(error.json());
          });
      }
  }

  return (
    <>
      {/* Modal añadir curso*/}
      <div
        className="modal fade"
        id="staticBackdrop"
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
                aria-label="Modal crear curso"
                onFocus={(e) => speak(e)}
                onBlur={(e) => stopSpeak(e)}
              >
                Crear nuevo curso
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                tabIndex="0"
                aria-label="Botón cerrar modal crear curso"
                onFocus={(e) => speak(e)}
                onBlur={(e) => stopSpeak(e)}
              ></button>
            </div>
            <div className="modal-body">
              <form
                className="row needs-validation"
                id="formCreateCourse"
                onSubmit={e => addCourse(e)}
                noValidate
              >
                <div className="col-12 col-sm-12 col-md-6 mb-3">
                  <label htmlFor="inputNameCourse" className="form-label">
                    Nombre del curso:
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    id="inputNameCourse"
                    name="nameCourse"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    tabIndex="0"
                    aria-label="Input nombre del curso"
                    onFocus={(e) => speak(e)}
                    onBlur={(e) => stopSpeak(e)}
                    required
                  />
                  <div className="invalid-feedback">
                    Porfavor digite un nombre valido
                  </div>
                </div>
                <div className="col-12 col-sm-12 col-md-6 mb-3 mb-3">
                  <label htmlFor="inputCodeCourse" className="form-label">
                    Codigo del curso:
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    id="inputCodeCourse"
                    name="codeCourse"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    tabIndex="0"
                    aria-label="input codigo del curso"
                    onFocus={(e) => speak(e)}
                    onBlur={(e) => stopSpeak(e)}
                    required
                  />
                  <div className="invalid-feedback">
                    Porfavor digite un Codigo valido
                  </div>
                </div>
                <div className="col-12 mb-3">
                  <label htmlFor="inputIntegrantCourse" className="form-label">
                    Integrantes del curso:
                  </label>
                  <Select
                    isMulti
                    closeMenuOnSelect={false}
                    name="integrantsCourse"
                    options={users}
                    maxMenuHeight={150}
                    value={selectedParticipants}
                    onChange={(options, { action }) => {
                      handleChange(options, action);
                    }}
                    tabIndex="0"
                    aria-label="Seleccionar integrantes del curso"
                    onFocus={(e) => speak(e)}
                    onBlur={(e) => stopSpeak(e)}
                    className="basic-multi-select"
                    classNamePrefix="select"
                    id="inputIntegrantCourse"
                  />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                id="btnCloseModalCreateCourse"
                tabIndex="0"
                aria-label="Botón Cerrar modal crear nuevo curso"
                onFocus={(e) => speak(e)}
                onBlur={(e) => stopSpeak(e)}
              >
                Close
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                form="formCreateCourse"
                id="buttonCreateCourse"
                tabIndex="0"
                aria-label="Botón agregar curso"
                onFocus={(e) => speak(e)}
                onBlur={(e) => stopSpeak(e)}
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* modal Advertencias */}
      <button
        type="button"
        className="btn btn-primary"
        data-bs-toggle="modal"
        data-bs-target="#modalSucces"
        id="btnModalSucces"
        style={{ display: "none" }}
      />

      <div
        className="modal fade"
        id="modalSucces"
        tabIndex="-1"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        aria-labelledby="modalSuccesLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1
                className={
                  modalType != "" ? modalAlertTypesCourse[modalType].CLASS : ""
                }
                id="modalSuccesLabel"
                tabIndex="0"
                aria-label={
                  modalType != ""
                    ? modalAlertTypesCourse[modalType][modalTitle]
                    : ""
                }
                onFocus={(e) => speak(e)}
                onBlur={(e) => stopSpeak(e)}
              >
                {modalType != ""
                  ? modalAlertTypesCourse[modalType][modalTitle]
                  : ""}
              </h1>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-primary"
                data-bs-toggle="modal"
                data-bs-target="#modalSucces"
                tabIndex="0"
                aria-label="Botón aceptar"
                onFocus={(e) => speak(e)}
                onBlur={(e) => stopSpeak(e)}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* mis cursos */}
      <div className="container">
        <h2
          id="tittleSectionTools"
          tabIndex="0"
          aria-label="Sección herramientas"
          onFocus={(e) => speak(e)}
          onBlur={(e) => stopSpeak(e)}
        >
          Herramientas
        </h2>
        <div className="row">
          <div className="col-12 col-sm-8 col-md-6 col-xl-4 col-xxl-4 mb-4 colTools">
            <div className="card services">
              <FontAwesomeIcon className="card-img services" icon={faBook} />
              <div className="card-body services">
                <h6
                  className="card-title services"
                  aria-label="Biblioteca"
                  tabIndex="0"
                  onFocus={(e) => speak(e)}
                  onBlur={(e) => stopSpeak(e)}
                >
                  Biblioteca
                </h6>
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-8 col-md-6 col-xl-4 col-xxl-4 mb-4 colTools">
            <div className="card services">
              <FontAwesomeIcon
                className="card-img services"
                icon={faEnvelope}
              />
              <div className="card-body services">
                <h6
                  className="card-title services"
                  aria-label="Correo institucional"
                  tabIndex="0"
                  onFocus={(e) => speak(e)}
                  onBlur={(e) => stopSpeak(e)}
                >
                  Correo institucional
                </h6>
              </div>
            </div>
          </div>
          <div
            className="col-12 col-sm-8 col-md-6 col-xl-4 col-xxl-4 mb-4 colTools"
            tabIndex="-1"
          >
            <div className="card services">
              <FontAwesomeIcon
                className="card-img services"
                icon={faScaleBalanced}
              />
              <div className="card-body services">
                <h6
                  className="card-title services"
                  aria-label="Reglamento"
                  tabIndex="0"
                  onFocus={(e) => speak(e)}
                  onBlur={(e) => stopSpeak(e)}
                >
                  Reglamento
                </h6>
              </div>
            </div>
          </div>
        </div>
        <section className="row myCourses">
          <div className="col-12 containerTittleMyCourses">
            <h2
              className="tittleSectionMyCourses"
              aria-label="Sección Mis cursos"
              tabIndex="0"
              onFocus={(e) => speak(e)}
              onBlur={(e) => stopSpeak(e)}
            >
              Mis cursos
            </h2>
          </div>
          {user.rol == "Teacher" || user.rol == "Admin" ? (
            <>
              {courses.map((course, i) => {
                return (
                  <Course
                    onCourseDeleted={setCourseDeleted}
                    showModalOnDelete={showModal}
                    name={course.course_name}
                    code={course.course_code}
                    id={course.course_id}
                    imgCourse={course.img_course}
                    key={i}
                  />
                );
              })}

              <div
                className="col-12 col-sm-12 col-md-6 col-xl-4 col-xxl-4 addCourseCol"
                data-bs-toggle="modal"
                data-bs-target="#staticBackdrop"
                aria-label="Crear nuevo curso"
                tabIndex="0"
                onFocus={(e) => speak(e)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.currentTarget.click();
                  }
                }}
                onBlur={(e) => stopSpeak(e)}
              >
                <div className="card addCourse">
                  <div id="cardbackgroundAddCourse" />
                  <FontAwesomeIcon icon={faPlus} id="iconAddCourse" />
                  <h4 id="textAddCourse">Crear nuevo curso</h4>
                </div>
              </div>
            </>
          ) : (
            courses.map((course, i) => {
              return (
                <Course
                  name={course.course_name}
                  code={course.course_code}
                  id={course.course_id}
                  imgCourse={course.img_course}
                  key={i}
                />
              );
            })
          )}
        </section>
      </div>
    </>
  );
}

export default MyCourses;
