import React, { useState, useEffect, useContext } from "react";
import "./GradeStudents.css";
import "tabulator-tables/dist/css/tabulator_materialize.min.css";
import { ContextCourse } from "../../Context/OpenCourse/ContextCourse";
import { CounterUser } from "../../Context/CounterUser";
import { ReactTabulator } from "react-tabulator";

function GradeStudents() {
  const [activityGrades, setactivityGrades] = useState([]);
  const { openCourse } = useContext(ContextCourse);
  const { user } = useContext(CounterUser);
  useEffect(() => {
    console.log(user);
    fetch(
      `http://localhost:8081/courses/activities/getActivitiesGrades/${openCourse.id}/${user.id}`,
      {
        method: "GET",
      }
    )
      .then((res) => res.json())
      .then((data) => {
        setactivityGrades(data.data);
        console.log(data);
      })
      .catch((err) => console.error(err));
  }, []);

  const columns = [
    { title: "Actividad", field: "tittle" },
    { title: "Ponderación", field: "weighting" },
    {
      title: "Calificación",
      field: "GPA",
      sorter: "number",
      bottomCalc: weightedAverage,
      bottomCalcParams: { precision: 3 },
    },
  ];

  function weightedAverage(values, data, calcParams) {
    var sumProduct = 0;
    var sumWeights = 0;

    values.forEach(function (value, index) {
      var weight = data[index].weighting;
      sumProduct += value * weight;
      sumWeights += weight;
    });

    return (sumProduct / sumWeights).toFixed(calcParams.precision);
  }
  return (
    <div className="container containerQualifications">
      <h1>Calificaciones</h1>
      <div className="row">
        <div className="col-12 statequalifications mt-4">
          <ReactTabulator
            columns={columns}
            data={activityGrades}
            options={{
              layout: "fitColumns",
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default GradeStudents;
