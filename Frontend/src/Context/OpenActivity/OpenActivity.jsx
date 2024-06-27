import React, { useState } from 'react'
import { ContextActivity } from './ContextActivity'
function OpenActivity({ children }) {
    let initValueActivity = null;
  try {
    initValueActivity = JSON.parse(localStorage.getItem('activityAccesed'))
  } catch (error) {
    
  }
  const [openActivity, setOpenActivity] = useState(initValueActivity)
  return (
    <ContextActivity.Provider value={{ openActivity, setOpenActivity }}>
      {children}
    </ContextActivity.Provider>
  );
}

export default OpenActivity