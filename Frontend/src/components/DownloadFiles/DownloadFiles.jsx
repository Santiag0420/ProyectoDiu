import React, { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const DownloadFiles = () => {
  const navigate = useNavigate();
  const link = useRef();
  const location = useLocation();
  useEffect(() => {
    const fetchData = async () => {
      const data = location.state;
      try {
        const fecthURL = {
          userResolution: {
            URL: `http://localhost:8081/files/download/${data.activityId}/${data?.userId}/${data.type}`,
          },
          contentActivity: {
            URL: `http://localhost:8081/files/download/${data.activityId}/${data.type}`,
          },
        };
        
        const response = await fetch(fecthURL[data.type].URL, {
          method: 'GET',
        });

        if(!response.ok){
          throw(new Error(response.toString()))
        }

        const responseData = await response.json();
       console.log(responseData)
        link.current.href = responseData.file.split('nameFile:')[0];
        link.current.click();
        link.download = responseData.file.split('nameFile:')[1]<
        navigate("/mycourses/courseContent/activityContent", {replace:true});
      } catch (error) {
        console.error(error);
        navigate("/mycourses/courseContent/activityContent", {replace:true});
      }
    };
    fetchData();
  }, [navigate]);

  return (
    <a
      download
      id="link"
      style={{ display: "none" }}
      ref={link}
      target="_blank"
    >
      Descargar archivo
    </a>
  );
};

export default DownloadFiles;
