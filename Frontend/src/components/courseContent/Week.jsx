import React, { useState, useEffect, useCallback, useContext } from "react";
import "./Week.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faPlus } from "@fortawesome/free-solid-svg-icons";
import { CounterUser } from "../../Context/CounterUser";
import { AccesibilityContext } from "../../Context/Accesibility/AccesibilityContext";

function Week({ numberWeek, Activities, weekSelectedAddActivitySetState}) {
  const { user } = useContext(CounterUser);
  const { speak, stopSpeak } = useContext(AccesibilityContext);
  const [rotate, setRotate] = useState(false);
  const isStudent = user.rol === "Student";
  const hasActivities = Activities !== "vacio";
  const handleClick = useCallback(() => {
    setRotate((prevRotation) =>
      prevRotation === null
        ? "rotateDown"
        : prevRotation === "rotateDown"
        ? "rotateRight"
        : "rotateDown"
    );
  }, []);

  const StudentView = () => (hasActivities ? Activities : "");
  const TeacherView = () => (
    <>
      {hasActivities ? Activities : ""}
      <div className="card addActivityContainer">
        <button
          className="addActivity"
          data-bs-toggle="modal"
          data-bs-target="#modalAddActivity"
          tabIndex="0"
          aria-label={"Añadir nueva actividad"}
          onFocus={(e) => speak(e)}
          onBlur={(e) => stopSpeak(e)}
          onClick={() => weekSelectedAddActivitySetState(numberWeek)}
        >
          <div className="containerImgAddActivity">
            <FontAwesomeIcon icon={faPlus} id="iconAddActivity" />
          </div>
          <div className="col-md-9">
            <div className="card-body addActivityTittle">
              <h5 className="card-title activity">Añadir nueva actividad</h5>
            </div>
          </div>
        </button>
      </div>
    </>
  );

  return (
    <>
      <div className="accordion-item">
        <h2 className="accordion-header">
          <button
            className="acorddionButton"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target={`#panelsStayOpen-collapse${numberWeek}`}
            aria-expanded="false"
            aria-controls={`panelsStayOpen-collapse${numberWeek}`}
            onClick={handleClick}
            tabIndex="0"
            aria-label={"semana " + numberWeek}
            onFocus={(e) => speak(e)}
            onBlur={(e) => stopSpeak(e)}
          >
            <FontAwesomeIcon
              icon={faChevronRight}
              className={`rowAcordion ${rotate || ""}`}
            />
            <span className="buttonText">{`Semana ${numberWeek}`}</span>
          </button>
        </h2>
        <div
          id={`panelsStayOpen-collapse${numberWeek}`}
          className="accordion-collapse collapse"
        >
          <div className="accordion-body">
            {isStudent ? <StudentView /> : <TeacherView />}
          </div>
        </div>
        <hr />
      </div>
    </>
  );
}

export default Week;
