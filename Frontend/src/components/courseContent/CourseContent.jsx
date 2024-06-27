import React, { useState, useEffect, useContext, useMemo } from "react";
import Activity from "./Activity/Activity";
import Week from "./Week";
import "./CourseContent.css";
import { ContextCourse } from "../../Context/OpenCourse/ContextCourse";
import { AccesibilityContext } from "../../Context/Accesibility/AccesibilityContext";
import { CounterUser } from "../../Context/CounterUser";
import moment from "moment";

function CourseContent() {
  const { openCourse } = useContext(ContextCourse);
  const { speak, stopSpeak } = useContext(AccesibilityContext);
  const { user } = useContext(CounterUser);
  const [activities, setActivities] = useState(null);
  const [rechargeActivities, setRechargeActivities] = useState(false);
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(
    moment().format("YYYY-MM-DDTHH:mm")
  );
  const [closingDate, setClosingDate] = useState(
    moment().add(8, "day").format("YYYY-MM-DDTHH:mm")
  );
  const [typeActivity, setTypeActivity] = useState("midterm");
  const [tittle, setTittle] = useState("");
  const [content, setContent] = useState([]);
  const [maxWeighting, setMaxWeighting] = useState(1);
  const [weighting, setWeighting] = useState(0.0);
  const [descriptionEdited, setDescriptionEdited] = useState("");
  const [startDateEdited, setStartDateEdited] = useState(
    moment().format("YYYY-MM-DDTHH:mm")
  );
  const [closingDateEdited, setClosingDateEdited] = useState(
    moment().add(8, "day").format("YYYY-MM-DDTHH:mm")
  );
  const [typeActivityEdited, setTypeActivityEdited] = useState("midterm");
  const [tittleEdited, setTittleEdited] = useState("");
  const [contentEdited, setContentEdited] = useState([]);
  const [weightingEdited, setWeightingEdited] = useState(0.0);
  const [fileNotValid, setFileNotValid] = useState(false);
  const [descriptionFileNotValid, setDescriptionFileNotValid] = useState("");
  const [weekSelectedAddActivity, setWeekSelectedAddActivity] = useState(null);
  const [activitySelectedWeek, setActivitySelectedWeek] = useState(null);
  const [activitySelected, setActivitySelected] = useState(null);

  useEffect(() => {
    fetch(
      `http://localhost:8081/courses/activities/getActivities/${openCourse.id}`
    )
      .then((resp) => resp.json())
      .then((data) => {
        setActivities(data);
      })
      .catch((err) => console.log(err));
  }, [rechargeActivities, openCourse.id]);

  useEffect(() => {
    const formData = new FormData();
    formData.append("courseId", openCourse.id);

    fetch("http://localhost:8081/courses/activities/weightingMax", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        setMaxWeighting(1 - data);
      })
      .catch((error) => console.error(error));
    setRechargeActivities(false);
  }, [rechargeActivities]);

  const weeksActivities = useMemo(() => {
    if (activities) {
      let nuevaWeeks = [
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
      ];
      activities.forEach((activity, i) => {
        let componente = (
          <Activity
            key={i}
            id={activity.id}
            numberActivity={i}
            week={activity.week}
            type={activity.type}
            tittle={activity.tittle}
            rechargeActivities={setRechargeActivities}
            activityToEditWeek={setActivitySelectedWeek}
            activityToEditId={setActivitySelected}
          />
        );
        nuevaWeeks[activity.week - 1].push(componente);
      });
      return nuevaWeeks;
    }
  }, [activities]);

  useEffect(() => {
    if (
      activitySelectedWeek !== null &&
      activities[activitySelectedWeek].id === activitySelected
    ) {
      setContentEdited(activities[activitySelectedWeek].content);
      setTittleEdited(activities[activitySelectedWeek].tittle);
      setTypeActivityEdited(activities[activitySelectedWeek].type);
      setDescriptionEdited(activities[activitySelectedWeek].description);
      setWeightingEdited(activities[activitySelectedWeek].weighting);
      setStartDateEdited(
        moment(activities[activitySelectedWeek].startDate).format(
          "YYYY-MM-DDTHH:mm"
        )
      );
      setClosingDateEdited(
        moment(activities[activitySelectedWeek].closingDate).format(
          "YYYY-MM-DDTHH:mm"
        )
      );
    }
  }, [activitySelected, activities]);

  async function addActivity(e) {
    "use strict";
    const form = document.querySelector("#formCreateActivity");
    if (!form.checkValidity()) {
      e.preventDefault();
      e.stopPropagation();
      form.classList.add("was-validated");
    } else {
      e.preventDefault();
      try {
        const activity = new FormData();
        activity.append("week", weekSelectedAddActivity);
        activity.append("type", typeActivity);
        activity.append("tittle", tittle);
        activity.append("File", content[0]);
        activity.append("weighting", weighting);
        activity.append("startDate", startDate);
        activity.append("closingDate", closingDate);
        activity.append("courseId", openCourse.id);
        activity.append("teacherId", user.id);
        activity.append("description", description);
        const response = await fetch(
          "http://localhost:8081/courses/activities/addActivity",
          {
            method: "POST",
            body: activity,
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setRechargeActivities(true);
      } catch (error) {
        console.error("Error:", error);
      }
    }
  }

  async function editActivity(e) {
    "use strict";
    const form = document.querySelector("#formEditActivity");
    if (!form.checkValidity()) {
      e.preventDefault();
      e.stopPropagation();
      form.classList.add("was.validated");
    } else {
      e.preventDefault();
      try {
        const activity = new FormData();

        const activityDataChange = {
          tittle: tittleEdited,
          content: contentEdited,
          type: typeActivityEdited,
          startDate: startDateEdited,
          closingDate: closingDateEdited,
          description: descriptionEdited,
          weighting: weightingEdited,
        };

        const activityData = {
          tittle: activities[activitySelectedWeek].tittle,
          content: activities[activitySelectedWeek].content,
          type: activities[activitySelectedWeek].type,
          startDate: moment(activities[activitySelectedWeek].startDate).format(
            "YYYY-MM-DDTHH:mm"
          ),
          closingDate: moment(
            activities[activitySelectedWeek].closingDate
          ).format("YYYY-MM-DDTHH:mm"),
          description: activities[activitySelectedWeek].description,
          weighting: activities[activitySelectedWeek].weighting,
        };

        for (let param in activityData) {
          if (activityData[param] !== activityDataChange[param]) {
            if (param === "content") {
              activity.append("File", activityDataChange[param][0]);
            } else {
              activity.append(param, activityDataChange[param]);
            }
          }
        }
        /* for (let [clave, valor] of activity.entries()) {
          console.log(`Clave: ${clave}, Valor: ${valor}`);
        } */
        //console.log(activity)
        const response = await fetch(
          `http://localhost:8081/courses/activities/editActivity/${activitySelected}`,
          {
            method: "PATCH",
            body: activity,
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setRechargeActivities(true);
      } catch (error) {
        console.error("Error:", error);
      }
    }
  }

  function weightingControl(e) {
    if (e.target.id === "weighting") {
      if (e.target.value >= maxWeighting) {
        setWeighting(maxWeighting.toString().slice(0, 4));
      } else if (e.target.value + maxWeighting <= 0) {
        setWeighting(0);
      } else {
        setWeighting(e.target.value.toString().slice(0, 4));
      }
    } else {
      if (e.target.value >= maxWeighting) {
        setWeightingEdited(maxWeighting.toString().slice(0, 4));
      } else if (e.target.value + maxWeighting <= 0) {
        setWeightingEdited(0);
      } else {
        setWeightingEdited(e.target.value.toString().slice(0, 4));
      }
    }
  }

  const inputStartDateControl = (e) => {
    const currentDate = moment();
    const inputDate = moment(e.target.value);
    if (e.target.id === "startDate") {
      if (inputDate.isBefore(currentDate)) {
        setStartDate(currentDate.format("YYYY-MM-DDTHH:mm"));
      } else if (inputDate.isAfter(moment(closingDate))) {
        setStartDate(inputDate.format("YYYY-MM-DDTHH:mm"));
        setClosingDate(inputDate.format("YYYY-MM-DDTHH:mm"));
      } else {
        setStartDate(inputDate.format("YYYY-MM-DDTHH:mm"));
      }
    } else {
      if (inputDate.isBefore(currentDate)) {
        setStartDateEdited(currentDate.format("YYYY-MM-DDTHH:mm"));
      } else if (inputDate.isAfter(moment(closingDate))) {
        setStartDateEdited(inputDate.format("YYYY-MM-DDTHH:mm"));
        setClosingDateEdited(inputDate.format("YYYY-MM-DDTHH:mm"));
      } else {
        setStartDateEdited(inputDate.format("YYYY-MM-DDTHH:mm"));
      }
    }
  };

  const inputClosingDateControl = (e) => {
    const initDate = moment(startDate);
    const inputDate = moment(e.target.value);
    if (e.target.id === "closingDate") {
      if (inputDate.isBefore(initDate)) {
        setClosingDate(initDate.format("YYYY-MM-DDTHH:mm"));
      } else {
        setClosingDate(inputDate.format("YYYY-MM-DDTHH:mm"));
      }
    } else {
      if (inputDate.isBefore(initDate)) {
        setClosingDateEdited(initDate.format("YYYY-MM-DDTHH:mm"));
      } else {
        setClosingDateEdited(inputDate.format("YYYY-MM-DDTHH:mm"));
      }
    }
  };

  const inputFilesControl = (e) => {
    const filesAccepted = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/pdf",
    ];
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter((file) => {
      return filesAccepted.includes(file.type) && file.size < 5242880;
    });
    const invalidFiles = selectedFiles.filter((file) => {
      if (!filesAccepted.includes(file.type) || file.size > 5242880) {
        setDescriptionFileNotValid(
          "Por favor ingrese un archivo valido(jpeg, jpg, png, docx) y menor a 5mb"
        );
      }
      return !filesAccepted.includes(file.type) || file.size > 5242880;
    });

    if (invalidFiles.length > 0) {
      e.target.value = null;
      setFileNotValid(true);
    } else {
      setFileNotValid(false);
    }
    if (e.target.id === "content") {
      setContent(validFiles);
    } else {
      setContentEdited(validFiles);
    }
  };

  return (
    <>
      {/* Modal añadir actividad */}
      <div
        className="modal fade"
        id="modalAddActivity"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex="-1"
        aria-labelledby="staticBackdropLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="staticBackdropLabel">
                Agregar actividad
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form
                className="row g-3 needs-validation"
                id="formCreateActivity"
                onSubmit={(e) => addActivity(e)}
                noValidate
              >
                {typeActivityEdited != "resource" ? (
                  <div className="col-12 col-sm-12 col-md-8 col-lg-6 col-xl-6">
                    <div className="mb-3">
                      <label htmlFor="startDate" className="form-label">
                        Fecha de apertura:
                      </label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={startDate}
                        onChange={inputStartDateControl}
                        id="startDate"
                        aria-describedby="emailHelp"
                      />
                    </div>
                  </div>
                ) : null}
                {typeActivityEdited != "resource" ? (
                  <div className="col-12 col-sm-12 col-md-8 col-lg-6 col-xl-6">
                    <div className="mb-3">
                      <label htmlFor="closingDate" className="form-label">
                        Fecha de cierre:
                      </label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={closingDate}
                        onChange={inputClosingDateControl}
                        id="closingDate"
                        aria-describedby="emailHelp"
                        required
                      />
                      <div className="invalid-feedback">
                        Ingrese una fecha valida.
                      </div>
                    </div>
                  </div>
                ) : null}
                <div className="col-12 col-sm-12 col-md-8 col-lg-6 col-xl-6">
                  <label htmlFor="closingDate" className="form-label">
                    Titulo de la actividad:
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    placeholder="Titulo..."
                    aria-label="default input example"
                    value={tittle}
                    onChange={(e) => setTittle(e.target.value)}
                    required
                  />
                  <div className="invalid-feedback">
                    Ingrese un titulo valido.
                  </div>
                </div>
                <div className="col-12 col-sm-12 col-md-8 col-lg-6 col-xl-6">
                  <label htmlFor="typeActivity" className="form-label">
                    Tipo de actividad:
                  </label>
                  <select
                    className="form-select"
                    id="typeActivity"
                    value={typeActivity}
                    onChange={(e) => setTypeActivity(e.target.value)}
                  >
                    <option value="midterm">Parcial</option>
                    <option value="project">Proyecto</option>
                    <option value="resource">Recurso</option>
                    <option value="other">Otros</option>
                  </select>
                </div>
                <div className="col-12 col-sm-12 col-md-8 col-lg-10 col-xl-10">
                  <div className="mb-2">
                    <label htmlFor="content" className="form-label">
                      Recursos para la actividad:
                    </label>
                    <input
                      className="form-control"
                      type="file"
                      id="content"
                      onChange={inputFilesControl}
                      accept=".jpeg, .jpg, .pdf, .docx, .png"
                    />
                    {fileNotValid ? (
                      <div
                        className="alert alert-danger mt-2 mb-0"
                        role="alert"
                      >
                        {descriptionFileNotValid}
                      </div>
                    ) : null}
                  </div>
                </div>
                {typeActivityEdited != "resource" ? (
                  <div className="col-12 col-sm-12 col-md-8 col-lg-2 col-xl-2 col-xxl-2">
                    <div className="mb-2">
                      <label htmlFor="weighting" className="form-label">
                        Porcentaje
                      </label>
                      <input
                        className="form-control"
                        type="number"
                        id="weighting"
                        value={weighting}
                        onChange={(e) => weightingControl(e)}
                        min={0.0}
                        max={1}
                        step={0.01}
                        required
                      />
                      <div id="emailHelp" className="form-text">
                        Maxima ponderación:
                        {maxWeighting.toString().length > 5
                          ? maxWeighting.toString().slice(0, 4)
                          : maxWeighting}
                      </div>
                    </div>
                  </div>
                ) : null}
                <div className="mb-3 mt-0">
                  <label
                    htmlFor="exampleFormControlTextarea1"
                    className="form-label"
                  >
                    Descripción
                  </label>
                  <textarea
                    className="form-control"
                    id="exampleFormControlTextarea1"
                    rows="3"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  ></textarea>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
              <button
                type="submit"
                form="formCreateActivity"
                className="btn btn-primary"
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* modal editar actividad */}
      <div
        className="modal fade"
        id="modalEditActivity"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex="-1"
        aria-labelledby="staticBackdropLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="staticBackdropLabel">
                Editar actividad
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form
                className="row g-3 needs-validation"
                id="formEditActivity"
                onSubmit={(e) => editActivity(e)}
                noValidate
              >
                {typeActivityEdited != "resource" ? (
                  <div className="col-12 col-sm-12 col-md-8 col-lg-6 col-xl-6">
                    <div className="mb-3">
                      <label htmlFor="startDate" className="form-label">
                        Fecha de apertura:
                      </label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={startDateEdited}
                        onChange={inputStartDateControl}
                        id="startDateEdited"
                        aria-describedby="emailHelp"
                      />
                    </div>
                  </div>
                ) : null}
                {typeActivityEdited != "resource" ? (
                  <div className="col-12 col-sm-12 col-md-8 col-lg-6 col-xl-6">
                    <div className="mb-3">
                      <label htmlFor="closingDate" className="form-label">
                        Fecha de cierre:
                      </label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={closingDateEdited}
                        onChange={inputClosingDateControl}
                        id="closingDateEdited"
                        aria-describedby="emailHelp"
                        required
                      />
                      <div className="invalid-feedback">
                        Ingrese una fecha valida.
                      </div>
                    </div>
                  </div>
                ) : null}
                <div className="col-12 col-sm-12 col-md-8 col-lg-6 col-xl-6">
                  <label htmlFor="closingDate" className="form-label">
                    Titulo de la actividad:
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    placeholder="Titulo..."
                    aria-label="default input example"
                    value={tittleEdited}
                    onChange={(e) => setTittleEdited(e.target.value)}
                    required
                  />
                  <div className="invalid-feedback">
                    Ingrese un titulo valido.
                  </div>
                </div>
                <div className="col-12 col-sm-12 col-md-8 col-lg-6 col-xl-6">
                  <label htmlFor="typeActivity" className="form-label">
                    Tipo de actividad:
                  </label>
                  <select
                    className="form-select"
                    id="typeActivityEdited"
                    value={typeActivityEdited}
                    onChange={(e) => setTypeActivityEdited(e.target.value)}
                  >
                    <option value="midterm">Parcial</option>
                    <option value="project">Proyecto</option>
                    <option value="resource">Recurso</option>
                    <option value="other">Otros</option>
                  </select>
                </div>
                <div className="mb-3 col-sm-12 col-md-10 col-lg-10 col-xl-10 col-xxl-10">
                  <label
                    htmlFor="exampleFormControlTextarea1"
                    className="form-label"
                  >
                    Descripción
                  </label>
                  <textarea
                    className="form-control"
                    id="descriptionEdited"
                    rows="3"
                    value={descriptionEdited}
                    onChange={(e) => setDescriptionEdited(e.target.value)}
                  ></textarea>
                </div>
                {typeActivityEdited != "resource" ? (
                  <div className="col-12 col-sm-12 col-md-8 col-lg-2 col-xl-2 col-xxl-2">
                    <div className="mb-2">
                      <label htmlFor="weightingEdited" className="form-label">
                        Porcentaje
                      </label>
                      <input
                        className="form-control"
                        type="number"
                        id="weightingEdited"
                        value={weightingEdited}
                        onChange={(e) => weightingControl(e)}
                        min={0.0}
                        max={1}
                        step={0.01}
                        required
                      />
                      <div id="emailHelp" className="form-text">
                        Maxima ponderación:
                        {maxWeighting.toString().length > 5
                          ? maxWeighting.toString().slice(0, 4)
                          : maxWeighting}
                      </div>
                    </div>
                  </div>
                ) : null}
              </form>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Cerrar
              </button>
              <button
                type="submit"
                form="formEditActivity"
                className="btn btn-primary"
              >
                Editar
              </button>
            </div>
          </div>
        </div>
      </div>

      <section className="container courseContent">
        <h1
          className="tittleCourse"
          tabIndex="0"
          aria-label={"Curso" + openCourse.name}
          onFocus={(e) => speak(e)}
          onBlur={(e) => stopSpeak(e)}
        >
          {openCourse.name}
        </h1>
        <div className="courseActivities">
          <div className="accordion">
            {activities
              ? weeksActivities.map((week, index) => {
                  return (
                    <Week
                      key={index}
                      numberWeek={index + 1}
                      Activities={week.length > 0 ? week : ""}
                      courseId={openCourse.id}
                      weekSelectedAddActivitySetState={
                        setWeekSelectedAddActivity
                      }
                    />
                  );
                })
              : "cargando..."}
          </div>
        </div>
      </section>
    </>
  );
}

export default CourseContent;
