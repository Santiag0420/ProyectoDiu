import React, { useState, useContext } from "react";
import "./LoginForm.css";
import { useNavigate } from "react-router-dom";
import { CounterUser } from "../../Context/CounterUser";
import { AccesibilityContext } from "../../Context/Accesibility/AccesibilityContext";

function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [activeAlert, setActiveAlert] = useState(false);
  const [typeAlert, setTypeAlert] = useState("");
  const navigate = useNavigate();
  const { setUser } = useContext(CounterUser);
  const { speak, stopSpeak } = useContext(AccesibilityContext);

  const typeAlerts = {
    FIELDS_EMPTY: [
      "Por favor relllene todos los campos",
      "alert alert-warning",
    ],
    USER_OR_PASS_INVALID: [
      "Usuario o contraseña incorrecta",
      "alert alert-danger",
    ],
  };

  function handleSubmit(event) {
    event.preventDefault();
    if (username === "" || password === "") {
      speak(null, "Casillas vacías")
      setTypeAlert("FIELDS_EMPTY");
      setActiveAlert(true);
    } else {
      setActiveAlert(false);
      fetch(`http://localhost:8081/users/${username}/${password}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.response === "LOGIN_SUCCESFULLY") {
            const structureUser = {
              name: data.name,
              id: data.id,
              rol: data.rol,
            };
            speak(null, "sesión iniciada")
            localStorage.setItem("user", JSON.stringify(structureUser));
            setUser(structureUser);
            navigate("/mycourses");
          } else {
            speak(null, "Usuario o contraseña incorrecta")
            setTypeAlert("USER_OR_PASS_INVALID");
            setActiveAlert(true);
          }
        })
        .catch((err) => console.log(err));
    }
  }

  return (
    <>
      <section className="login vh-100" style={{ backgroundColor: "#f2f3f7" }}>
        <div className="py-5">
          <div className="row d-flex justify-content-center align-items-center">
            <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-6 col-xxl-5 containerFormLogin">
              <div
                className="card shadow-2-strong"
                style={{
                  borderRadius: "1rem",
                  boxShadow: "0px 0px 10px rgba(150, 150, 150, 100)",
                }}
              >
                <form onSubmit={handleSubmit}>
                  <div className="card-body p-5 text-center">
                    <h3
                      className="mb-5"
                      tabIndex="-1"
                      aria-label="Login universidad guepardex"
                      onFocus={(e) => speak(e)}
                      onBlur={(e) => stopSpeak(e)}
                    >
                      GUEPARDEX
                    </h3>

                    <div className="form-outline mb-4">
                      {activeAlert ? (
                        <div
                          className={typeAlerts[typeAlert][1]}
                          role="alert"
                          tabIndex="0"
                          aria-label={
                            activeAlert ? typeAlerts[typeAlert][0] : ""
                          }
                          onFocus={(e) => speak(e)}
                          onBlur={(e) => stopSpeak(e)}
                        >
                          {typeAlerts[typeAlert][0]}
                        </div>
                      ) : (
                        ""
                      )}
                      <input
                        type="text"
                        className="form-control form-control-lg "
                        style={{ border: "1px solid #9b9b9b" }}
                        placeholder="Nombre de usuario"
                        onChange={(e) => setUsername(e.target.value)}
                        tabIndex="0"
                        aria-label="Entrada nombre de usuario"
                        onFocus={(e) => speak(e)}
                        onBlur={(e) => stopSpeak(e)}
                      />
                    </div>

                    <div className="form-outline mb-4">
                      <input
                        type="password"
                        className="form-control form-control-lg"
                        style={{ border: "1px solid #9b9b9b" }}
                        placeholder="Contraseña"
                        onChange={(e) => setPassword(e.target.value)}
                        tabIndex="0"
                        aria-label="Entrada Contraseña"
                        onFocus={(e) => speak(e)}
                        onBlur={(e) => stopSpeak(e)}
                      />
                    </div>

                    <button
                      style={{
                        backgroundColor: "#130A81",
                        color: "white",
                      }}
                      className="btn btn-lg btn-block "
                      type="submit"
                      tabIndex="0"
                      aria-label="Botón iniciar sesión"
                      onFocus={(e) => speak(e)}
                      onBlur={(e) => stopSpeak(e)}
                    >
                      Iniciar sesion
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default LoginForm;
