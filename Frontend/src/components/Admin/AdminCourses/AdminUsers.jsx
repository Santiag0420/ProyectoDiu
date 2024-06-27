import React, { useState, useEffect, useContext } from "react";
import "react-tabulator/lib/styles.css"; // required styles
import "tabulator-tables/dist/css/tabulator_modern.min.css";
import "./adminCourses.css";
import { CounterUser } from "../../../Context/CounterUser";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";
import { ReactTabulator } from "react-tabulator";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);
export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top",
    },
    title: {
      display: true,
      text: "Chart.js Bar Chart",
    },
  },
};

function AdminUsers() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("Student");
  const [usernameToEdit, setUsernameToEdit] = useState("");
  const [idToEdit, setIdToEdit] = useState();
  const [passwordToEdit, setPasswordToEdit] = useState("");
  const [rolToEdit, setRolToEdit] = useState("");
  const [chartData, setChartData] = useState([0, 0, 0]);
  const [chartDataPieLabelCourses, setChartDataPieLabelCourses] = useState([]);
  const [chartDataPie, setChartDataPie] = useState([]);
  const [rechargeUserTable, setRechargeUserTable] = useState(false);
  const [rechargeRolStatistic, setRechargeRolStatistic] = useState(false);
  const { user } = useContext(CounterUser);

  //Estadisticas
  const dataBar = {
    labels: ["Admin", "Teacher", "Student"],
    datasets: [
      {
        label: "Cantidad",
        data: chartData, // inicializa los datos en 0
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(255, 206, 86, 0.2)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  //Estadisticas Pie
  const labels = chartDataPieLabelCourses;

  const dataPie = {
    labels,
    datasets: [
      {
        label: "Roles",
        data: chartDataPie,
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(255, 206, 86, 0.2)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  //Tabla
  const columns = [
    { title: "Id", field: "id" },
    { title: "Username", field: "username" },
    { title: "Contraseña", field: "pass" },
    { title: "Rol", field: "rol" },
    {
      title: "",
      field: "edit",
      width: 50,
      headerSort: false,
      formatter: function (cell, formatterParams, onRendered) {
        //crea y devuelve el contenido de la celda

        return "<button data-bs-toggle='modal' data-bs-target='#staticEditBackdrop' id='btnEdit' style='border:none; background:none; width: 100%; cursor:pointer;'><img src='src/assets/pen-to-square-solid.svg' style='height:25px'></button>";
      },
      cellClick: function (e, cell) {
        const btnEdit = document.getElementById("btnEdit");
        btnEdit.click();
        setIdToEdit(cell.getData().id);
        setUsernameToEdit(cell.getData().username);
        setPasswordToEdit(cell.getData().pass);
        setRolToEdit(cell.getData().rol);
        //console.log(cell.getData().password)
        //editUser(cell.getData());
        console.log("Celda edit clicada - ", cell.getData());
      },
    },
    {
      title: "",
      field: "delete",
      width: 50,
      headerSort: false,
      formatter: function (cell, formatterParams, onRendered) {
        //crea y devuelve el contenido de la celda
        return "<button  style='border:none; background:none; width: 100%; cursor:pointer;''><img src='src/assets/trash-solid.svg' style='height:25px'></button>";
      },
      cellClick: function (e, cell) {
        deleteUser(cell.getData());
        console.log("Celda clicada - ", cell.getData());
      },
    },
    // puedes agregar más columnas aquí
  ];

  const [users, setUsers] = useState([]);

  function addUser(event) {
    event.preventDefault();
    ("use strict");

    const form = document.querySelector("#formCreateUser");

    if (!form.checkValidity()) {
      event.preventDefault();
      event.stopPropagation();
      console.log("Si");
    } else {
      event.preventDefault();
      console.log(username);
      console.log(password);
      console.log(rol);
      fetch("http://localhost:8081/users/addUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
          rol: rol,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data === "USER_ADD_SUCCESSFULLY") {
            console.log("Si se pudo");
            console.log(data);
            setRechargeUserTable(true);
            setRechargeRolStatistic(true);
            const closeForm = document.getElementById("btnCloseForm").click();
            setUsername("");
            setPassword("");
            setRol("Student");
            Swal.fire({
              title: "<strong>¡Registro Exitoso!</strong>",
              html:
                "<i>El usuario <strong>" +
                username +
                " </strong>fue creado con exito</i>",
              icon: "success",
              timer: 3000,
            });
          } else {
            console.log("Pos no ");
          }
          form.classList.remove("was-validated");
          form.classList.add("needs-validation");
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
    form.classList.add("was-validated");
  }

  function editUser(event) {
    event.preventDefault();
    ("use strict");

    const formEditUser = document.querySelector("#formEditUser");
    console.log(formEditUser);

    if (!formEditUser.checkValidity()) {
      event.preventDefault();
      event.stopPropagation();
      console.log("Si");
    } else {
      event.preventDefault();
      fetch("http://localhost:8081/users/editUser", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: idToEdit,
          username: usernameToEdit,
          password: passwordToEdit,
          rol: rolToEdit,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          if (data === "USER_EDIT_SUCCESSFULLY") {
            setRechargeUserTable(true);
            const closeForm = document
              .getElementById("btnCloseFormEdit")
              .click();
            Swal.fire({
              title: "<strong>¡Actualizacion Exitosa!</strong>",
              html: "<i>El usuario fue editado con exito</i>",
              icon: "success",
              timer: 3000,
            });
            console.log("Exit edit");
          } else {
            console.log("No edit");
          }
          formEditUser.classList.remove("was-validated");
          formEditUser.classList.add("needs-validation");
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
    formEditUser.classList.add("was-validated");
  }

  function deleteUser(user) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false,
    });

    swalWithBootstrapButtons
      .fire({
        title:
          "¿Estas seguro que desear eliminar a  <strong>" +
          user.username +
          "</strong>?",
        text: "¡No podras revertir los cambios realizados!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Si, eliminarlo",
        cancelButtonText: "Cancelar",
        reverseButtons: true,
      })
      .then((result) => {
        if (result.isConfirmed) {
          fetch("http://localhost:8081/users/deleteUser", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: user.id,
            }),
          })
            .then((response) => response.json())
            .then((data) => {
              console.log(data);
              if (data.response === "USER_SUCCESSFULLY_DELETED") {
                setRechargeUserTable(true);
                setRechargeRolStatistic(true);
                console.log("Hasta la vista, baby");
                console.log(data);
              } else {
                console.log("No hubo eliminazacion");
              }
            })
            .catch((error) => {
              console.log("Error en el fetch ");
            });
          console.log("Tuki taka, baka");
          swalWithBootstrapButtons.fire(
            "¡Usuario eliminado!",
            "El usuario fue eliminado con exito",
            "success"
          );
        } else if (
          /* Read more about handling dismissals below */
          result.dismiss === Swal.DismissReason.cancel
        ) {
        }
      });
  }

  useEffect(() => {
    fetch("http://localhost:8081/users/getUsers")
      .then((res) => res.json())
      .then((data) => {
        if (data.response === "GET_USERS_SUCCESSFULLY") {
          const filteredUsers = data.users.filter(
            (tester) => tester.id !== user.id
          );
          setUsers(filteredUsers);
        }
      });

    setRechargeUserTable(false);
  }, [rechargeUserTable]);

  useEffect(() => {
    fetch("http://localhost:8081/users/getQuantityUsers")
      .then((res) => res.json())
      .then((data) => {
        if (data.response === "AMOUNT_OF_USER_SUCCESSFULLY_OBTAINED") {
          //console.log([data.numberOfUsers]);
          data.numberOfUsers[0]["COUNT(*)"];
          //console.log(data.numberOfUsers[0]["COUNT(*)"]);
          const dataArray = [
            data.numberOfUsers[0]["COUNT(*)"],
            data.numberOfUsers[1]["COUNT(*)"],
            data.numberOfUsers[2]["COUNT(*)"],
          ];
          setChartData(dataArray);
        }
      });
    setRechargeRolStatistic(false);
  }, [rechargeRolStatistic]);

  useEffect(() => {
    fetch("http://localhost:8081/users/getQuantityRecords")
      .then((res) => res.json())
      .then((data) => {
        if (data.response === "SUCCESSFULLY_OBTAINED_RECORDS") {
          console.log(data.numberOfRecords);
          const labelCourses = data.numberOfRecords.map(function (course) {
            return course.name;
          });
          //console.log(labelCourses);
          setChartDataPieLabelCourses(labelCourses);
          const dataRecords = data.numberOfRecords.map(function (users) {
            return users.countUsers;
          });
          //console.log(dataRecords);
          setChartDataPie(dataRecords);
        }
      });
  }, []);

  return (
    <>
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
              <h1 className="modal-title fs-5" id="staticBackdropLabel">
                Crear usuario
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
                onSubmit={addUser}
                id="formCreateUser"
                className="row g-3 needs-validation"
                noValidate
              >
                <div className="col-md-6">
                  <label htmlFor="validationCustom01" className="form-label">
                    Username
                  </label>
                  <input
                    value={username}
                    onChange={(evento) => setUsername(evento.target.value)}
                    type="text"
                    className="form-control"
                    id="validationCustom01"
                    required
                  />
                  <div className="invalid-feedback">Verifique los datos</div>
                </div>
                <div className="col-md-6">
                  <label htmlFor="validationCustom02" className="form-label">
                    Contraseña
                  </label>
                  <input
                    value={password}
                    onChange={(evento) => setPassword(evento.target.value)}
                    type="text"
                    className="form-control"
                    id="validationCustom02"
                    required
                  />
                  <div className="invalid-feedback">Verifique los datos</div>
                </div>

                <div className="col-md-12">
                  <label htmlFor="validationCustom03" className="form-label">
                    Rol
                  </label>
                  <select
                    className="form-select"
                    aria-label="Default select example"
                    id="validationCustom03"
                    required
                    value={rol}
                    onChange={(evento) => setRol(evento.target.value)}
                  >
                    <option value="Student">Student</option>
                    <option value="Teacher">Teacher</option>
                    <option value="Admin">Admin</option>
                  </select>
                  <div className="invalid-feedback">
                    Please provide a valid city.
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                id="btnCloseForm"
              >
                Cerrar
              </button>
              <button
                form="formCreateUser"
                type="submit"
                className="btn btn-primary"
                id="btnAddUser"
                //onClick={addUser}
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="staticEditBackdrop"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex="-1"
        aria-labelledby="staticBackdropLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="staticBackdropLabel">
                Editar Usuario
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
                onSubmit={editUser}
                id="formEditUser"
                className="row g-3 needs-validation"
                noValidate
              >
                <div className="col-md-6">
                  <label htmlFor="validationCustom01" className="form-label">
                    Username
                  </label>
                  <input
                    value={usernameToEdit}
                    onChange={(evento) =>
                      setUsernameToEdit(evento.target.value)
                    }
                    type="text"
                    className="form-control"
                    id="validationCustom01"
                    required
                  />
                  <div className="invalid-feedback">Verifique los datos</div>
                </div>
                <div className="col-md-6">
                  <label htmlFor="validationCustom02" className="form-label">
                    Contraseña
                  </label>
                  <input
                    value={passwordToEdit}
                    onChange={(evento) =>
                      setPasswordToEdit(evento.target.value)
                    }
                    type="text"
                    className="form-control"
                    id="validationCustom02"
                    required
                  />
                  <div className="invalid-feedback">Verifique los datos</div>
                </div>

                <div className="col-md-12">
                  <label htmlFor="validationCustom03" className="form-label">
                    Rol
                  </label>
                  <select
                    className="form-select"
                    aria-label="Default select example"
                    id="validationCustom03"
                    required
                    value={rolToEdit}
                    onChange={(evento) => setRolToEdit(evento.target.value)}
                  >
                    <option value="Student">Student</option>
                    <option value="Teacher">Teacher</option>
                    <option value="Admin">Admin</option>
                  </select>
                  <div className="invalid-feedback">
                    Please provide a valid city.
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                id="btnCloseFormEdit"
              >
                Cancelar
              </button>
              <button
                form="formEditUser"
                type="submit"
                className="btn btn-primary"
                id="btnEditUser"

                //onClick={editUser}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container caca">
        <div className="row">
          <div className="container tableContainter col-8">
            <div className="containterHeadTable">
              <div className="row">
                <div className="title col-8 d-flex justify-content-between align-items-center">
                  <h1>Usuarios</h1>
                  <button
                    data-bs-toggle="modal"
                    data-bs-target="#staticBackdrop"
                    id="addUser"
                    type="button"
                    className="btn btn-primary btn-lg"
                  >
                    Crear usuario
                  </button>
                </div>
              </div>
            </div>


            <ReactTabulator columns={columns} data={users} />

            <div className="container statistics">
              <div className="row">
                <div className="col-6">
                  <Pie data={dataPie} />
                </div>
                <div className="col-6">
                  <Bar options={options} data={dataBar} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminUsers;
