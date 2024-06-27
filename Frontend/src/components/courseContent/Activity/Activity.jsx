import React, { useContext, useEffect } from "react";
import "./Activity.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";
import { ContextCourse } from "../../../Context/OpenCourse/ContextCourse";
import { ContextActivity } from "../../../Context/OpenActivity/ContextActivity";
import { CounterUser } from "../../../Context/CounterUser";
import { useNavigate } from "react-router-dom";

function Activity({
  id,
  numberActivity,
  type,
  tittle,
  rechargeActivities,
  activityToEditWeek,
  activityToEditId,
}) {
  const { openCourse } = useContext(ContextCourse);
  const { setOpenActivity } = useContext(ContextActivity);
  const { user } = useContext(CounterUser);
  const navigate = useNavigate();
  const colorsActivities = {
    midterm: ["#DE0E0E", "square-check-regular.svg"],
    project: ["#8d058d", "file-arrow-up-solid.svg"],
    resource: ["#0db50d", "file-regular.svg"],
    other: ["#008BFF", "otter-solid.svg"],
  };
  const styleActivities = {
    backgroundColor: colorsActivities[type][0],
  };

  function accesToActivity(e) {
    e.stopPropagation();
    localStorage.setItem(
      "activityAccesed",
      JSON.stringify({
        idActivityAccesed: id,
        styleActivityAcccesed: colorsActivities[type],
      })
    );
    navigate("/mycourses/courseContent/activityContent");
    setOpenActivity({
      idActivityAccesed: id,
      styleActivityAcccesed: colorsActivities[type],
    });
  }

  function editActivity(e) {
    e.stopPropagation();
    activityToEditWeek(numberActivity);
    activityToEditId(id);
  }

  async function deleteActivity(e) {
    e.stopPropagation();
    const activityToDelete = new FormData();
    activityToDelete.append("activityId", id);
    activityToDelete.append("courseId", openCourse.id);
    try {
      const response = await fetch(
        "http://localhost:8081/courses/activities/deleteActivity",
        {
          method: "DELETE",
          body: activityToDelete,
        }
      );

      if (!response.ok) {
        throw new Error(response.toString());
      }
      rechargeActivities(true);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="card activitiesContainer" id={id}>
      <div className="activities" onClick={(e) => accesToActivity(e)}>
        {user.rol === "Teacher" ? (
          <>
            <FontAwesomeIcon
              icon={faTrash}
              id="deleteActivity"
              onClick={(e) => {
                deleteActivity(e);
              }}
            />
            <FontAwesomeIcon
              icon={faPencil}
              id="editActivity"
              className="editActivity"
              data-bs-toggle="modal"
              data-bs-target="#modalEditActivity"
              tabIndex="0"
              aria-label={"Añadir nueva actividad"}
              /*           onFocus={(e) => speak(e)}
          onBlur={(e) => stopSpeak(e)} */
              onClick={(e) => {
                editActivity(e);
              }}
            />
          </>
        ) : null}
        <div className="containerImgActivity" style={styleActivities}>
          <img
            src={`/../src/assets/` + colorsActivities[type][1]}
            className="imageActivity"
            alt="..."
          />
        </div>
        <div className="col-md-9">
          <div className="card-body activityTittle">
            <h5 className="card-title">{tittle}</h5>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Activity;
