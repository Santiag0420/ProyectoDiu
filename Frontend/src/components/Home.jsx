import React from 'react'
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { CounterUser } from '../Context/CounterUser';

function Home() {
const redirect = useNavigate();
const {setUser} = useContext(CounterUser);
function closeSession() {
      localStorage.clear();
      setUser(null)
      redirect("/login");
} 
  return (
    <>
      <button onClick={closeSession}>closeSession</button> 
    </>
  )
}


export default Home