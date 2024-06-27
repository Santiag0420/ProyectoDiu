import React, { useContext, useState, useEffect } from "react";
import "./ActivityContent.css";
import "tabulator-tables/dist/css/tabulator_materialize.min.css";
import { ReactTabulator } from "react-tabulator";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { ContextActivity } from "../../../../Context/OpenActivity/ContextActivity";
import { CounterUser } from "../../../../Context/CounterUser";
import moment from "moment";
import { Link, useNavigate } from "react-router-dom";

function ActivityContent() {
  const { openActivity } = useContext(ContextActivity);
  const { user } = useContext(CounterUser);
  const [activity, setActivity] = useState({});
  const [styleDelivery, setStyleDelivery] = useState({});
  const [styleQualification, setStyleQualification] = useState({});
  const [resource, setResource] = useState();
  const [restTime, setRestTime] = useState("");
  const [descriptionFileNotValid, setDescriptionFileNotValid] = useState("");
  const [fileNotValid, setFileNotValid] = useState(false);
  const navigate = useNavigate();
  const columns = [
    { title: "#", field: "id" },
    { title: "Nombre", field: "username" },
    {
      title: "Entrega",
      field: "dateResolution",
      formatter: function (cell) {
        let value = "Sin entregar";
        const dateResolution =
          cell.getValue() === null ? null : moment(cell.getValue());
        const currentDate = moment();
        const closeDate = moment(activity.closingDate);
        if (dateResolution !== null) {
          if (dateResolution.isAfter(closeDate)) {
            cell.getElement().style.backgroundColor = "rgba(255, 0, 0, 0.60)";
            value = "Entregado tarde";
          } else {
            cell.getElement().style.backgroundColor = "rgba(28, 182, 31, 0.60)";
            value = "Entregado";
          }
        } else if (currentDate.isAfter(closeDate)) {
          cell.getElement().style.backgroundColor = "rgba(255, 0, 0, 0.60)";
          value = "Entrega retrasada";
        }
        return value;
      },
    },
    {
      title: "Contenido",
      field: "resolution",
      formatter: function (cell) {
        const value = cell.getValue();
        if (value === null) {
          return "No hay contenido";
        }
        return '<a class="link">Captura 123.jpg</a>';
      },
      cellClick: function (cell, row) {
        navigate("/mycourses/courseContent/activityContent/downloadFiles", {
          state: {
            userId: row.getData().id,
            activityId: openActivity.idActivityAccesed,
            type: "userResolution",
          },
          replace: true,
        });
      },
    },
    {
      title: "Calificación",
      field: "GPA",
      formatter: function (cell) {
        const value = cell.getValue();
        if (value === null) {
          return "Sin calificar";
        }
        return value;
      },
      editor: "number",
      validator: ["required", "min:0", "max:5"],
      editorParams: {
        min: 0,
        max: 5.0,
        step: 0.1,
        elementAttributes: {
          maxlength: "2", //set the maximum character length of the input element to 10 characters
        },
        selectContents: true,
        verticalNavigation: "table",
        validationMode: "blocking ",
      },
      cellEdited: async function (cell) {
        try {
          const form = new FormData();
          form.append("GPA", cell.getData().GPA);
          const responseGradeActivity = await fetch(
            `http://localhost:8081/courses/activities/gradeActivity/${
              cell.getData().id
            }/${openActivity.idActivityAccesed}`,
            {
              method: "PATCH",
              body: form,
            }
          );
          if (!responseGradeActivity.ok) {
            cell.setData("Sin calificar");
            throw new Error(response.toString());
          }
          const data = await responseGradeActivity.json();
          console.log(data);
        } catch (error) {
          console.error("Error:", error);
        }
      },
    },
  ];
  const [resolutionUsers, setResolutionUsers] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const fetchContentActivity = async () => {
      try {
        setResource(false);
        let fetchURL = `http://localhost:8081/courses/activities/getActivityContent/${openActivity.idActivityAccesed}/${user.rol}`;
        if (user.rol === "Student") {
          fetchURL = `http://localhost:8081/courses/activities/getActivityContent/${openActivity.idActivityAccesed}/${user.id}/${user.rol}`;
        }
        const response = await fetch(fetchURL, {
          method: "GET",
        });
        const data = await response.json();

        if (isMounted) {
          if (data.length > 0) {
            setActivity(data[0]);
          }
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchContentActivity();

    return () => {
      isMounted = false;
    };
  }, [openActivity.id, resource]);

  useEffect(() => {
    const fetchResolutionUsers = async () => {
      try {
        const response = await fetch(
          `http://localhost:8081/courses/activities/getResolutions/${openActivity.idActivityAccesed}`,
          {
            method: "GET",
          }
        );
        if (!response.ok) {
          throw new Error(response.toString());
        }
        const data = await response.json();
        setResolutionUsers(data);
      } catch (error) {
        console.log("Error:", error);
      }
    };
    fetchResolutionUsers();
  }, []);

  useEffect(() => {
    const closeDate = moment(activity.closingDate);
    const currentDate = moment();
    const dateReso = moment(activity.dateResolution);
    let styleActivity = {
      text: "Sin entregar",
    };

    if (activity.resolution !== null) {
      if (dateReso.isAfter(closeDate)) {
        styleActivity = {
          style: {
            backgroundColor: "rgba(255, 0, 0, 0.60)",
            color: "white",
          },
          text: "Entregado tarde",
        };
      } else {
        styleActivity = {
          style: {
            backgroundColor: "rgba(28, 182, 31, 0.60)",
            color: "white",
          },
          text: "Entregado",
        };
      }
    } else if (currentDate.isAfter(closeDate)) {
      styleActivity = {
        style: {
          backgroundColor: "rgba(255, 0, 0, 0.60)",
          color: "white",
        },
        text: "Entrega retrasada",
      };
    }
    let minutos = closeDate.diff(currentDate, "minutes");
    let horas = closeDate.diff(currentDate, "hours");
    let dias = closeDate.diff(currentDate, "days");
    horas %= 24;
    minutos %= 60;
    setRestTime(
      dias < 0
        ? ""
        : `${dias <= 1 ? dias + " día" : dias + " días"}, ${
            horas <= 1 ? horas + " hora" : horas + " horas"
          }, ${minutos <= 1 ? minutos + " minuto" : minutos + " minutos"}`
    );
    setStyleDelivery(styleActivity);
    setStyleQualification(
      activity.GPA === null
        ? {
            text: "Sin calificar",
          }
        : {
            style: {
              backgroundColor: "rgba(28, 182, 31, 0.60)",
              color: "white",
            },
            text: "Calificado",
          }
    );
  }, [activity]);

  async function deleteResource() {
    try {
      const responseDeleteResource = await fetch(
        `http://localhost:8081/courses/activities/deleteResource/${openActivity.idActivityAccesed}`,
        {
          method: "DELETE",
        }
      );
      if (!responseDeleteResource.ok) {
        throw new Error(responseDeleteResource.toString());
      }
      const data = await responseDeleteResource.json();
      setResource(true);
      console.log(data);
    } catch (error) {
      console.error("Erorr:", error);
    }
  }

  async function addResource(file) {
    try {
      if (!file) {
        return;
      }
      const formFile = new FormData();
      formFile.append("File", file);
      const responseAddResource = await fetch(
        `http://localhost:8081/courses/activities/addResource/${openActivity.idActivityAccesed}`,
        {
          method: "POST",
          body: formFile,
        }
      );
      if (!responseAddResource.ok) {
        throw new Error(responseAddResource.toString());
      }
      const data = await responseAddResource.json();
      setResource(true);
    } catch (error) {
      console.error("Erorr:", error);
    }
  }

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
      addResource(validFiles[0]);
    }
  };

  return (
    <main className="container activityContent">
      <h1 id="tittleActivity">
        <span
          id="containerIconActivity"
          style={{ backgroundColor: openActivity.styleActivityAcccesed[0] }}
        >
          <img
            id="iconActivity"
            src={"../../src/assets/" + openActivity.styleActivityAcccesed[1]}
            alt=""
          />
        </span>
        {activity?.tittle ? activity.tittle : null}
      </h1>
      <section className="descriptionActivity">
        <div className="row contentActivity">
          <div className="col-12 infoActivity">
            <div className="activityDate">
              <h3>
                Apertura:
                <span>
                  {Object.keys(activity).length !== 0
                    ? (() => {
                        let opciones = {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "numeric",
                          minute: "numeric",
                        };
                        const date = new Date(activity.startDate);
                        return date.toLocaleDateString("es-ES", opciones);
                      })()
                    : ""}
                </span>
              </h3>
              <h3>
                Cierre:
                <span>
                  {Object.keys(activity).length !== 0
                    ? (() => {
                        let opciones = {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "numeric",
                          minute: "numeric",
                        };
                        const date = new Date(activity.closingDate);
                        return date.toLocaleDateString("es-ES", opciones);
                      })()
                    : null}
                </span>
              </h3>
            </div>
            <hr />
            <div
              className="activityDescription"
              style={
                activity?.description
                  ? { display: "inline-block" }
                  : { display: "none" }
              }
            >
              <p className="editDescriptionActivity" id="editDescription">
                {activity?.description ? activity.description : null}
              </p>
            </div>
            <div className="activityContent">
              {activity?.content ? (
                <>
                  └
                  <Link
                    className="linkFile"
                    to={{
                      pathname:
                        "/mycourses/courseContent/activityContent/downloadFiles",
                    }}
                    state={{
                      activityId: openActivity.idActivityAccesed,
                      type: "contentActivity",
                    }}
                    replace
                  >
                    {activity.content.split("nameFile:")[1].split("idFile")[0]}
                  </Link>
                  <FontAwesomeIcon
                    icon={faTrash}
                    id="deleteResource"
                    onClick={deleteResource}
                  />
                </>
              ) : (
                <>
                  <input
                    type="file"
                    id="addResource"
                    className="d-none"
                    onChange={inputFilesControl}
                  />
                  {user.rol !== "Student" ? (
                    <h3
                      id="addResource"
                      onClick={(e) => {
                        document.getElementById("addResource").click();
                      }}
                    >
                      <FontAwesomeIcon icon={faPlus} />
                      Agregar Recurso
                    </h3>
                  ) : null}

                  {fileNotValid ? (
                    <div className="alert alert-danger mt-2 mb-0" role="alert">
                      {descriptionFileNotValid}
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </div>
          {user.rol === "Student" ? (
            <div className="containerBtnAddDelivery">
              <button id="btnAddDelivery">Agregar Entrega</button>
            </div>
          ) : null}
          {user.rol === "Student" ? (
            <div className="col-12 stateDelivery">
              <h2 id="tittleStateDelivery">Estado de la entrega</h2>
              <div className="row stateDeliveryDescription">
                <table className="table table-bordered table-hover table-md table-striped tableStateDelivery">
                  <tbody>
                    <tr>
                      <th>Estado de la entrega</th>
                      <td style={styleDelivery?.style}>
                        {styleDelivery?.text}
                      </td>
                    </tr>
                    <tr>
                      <th>Estado de la calificación</th>
                      <td style={styleQualification?.style}>
                        {styleQualification?.text}
                      </td>
                    </tr>
                    <tr>
                      <th>Tiempo restante</th>
                      <td>{restTime ?? restTime}</td>
                    </tr>
                    <tr>
                      <th>Archivos enviados</th>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="col-12 stateDeliveries mt-4">
              <ReactTabulator
                columns={columns}
                data={resolutionUsers}
                options={{
                  layout: "fitColumns",
                  pagination: "local",
                  paginationSize: 6,
                  paginationSizeSelector: [3, 6, 8, 10],
                }}
              />
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default ActivityContent;
