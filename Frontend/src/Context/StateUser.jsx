import React, { useState } from "react";
import { CounterUser } from "./CounterUser";

function StateUser({ children }) {
  let initValueUser = null;
  try {
    initValueUser = JSON.parse(localStorage.getItem('user'))
  } catch (error) {
    
  }
  
  
  const [user, setUser] = useState(initValueUser)
  return (
    <CounterUser.Provider value={{ user, setUser }}>
      {children}
    </CounterUser.Provider>
  );
}

export default StateUser;
