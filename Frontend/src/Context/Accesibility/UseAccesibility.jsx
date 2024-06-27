import React, {useState} from "react";
import { AccesibilityContext } from "./AccesibilityContext";

function UseAccesibility({ children }) {
  const [useSpeak, setUseSpeak] = useState(false);

  function speak(e , text = '', permissionToTalk = false) {
    if(window.KeyboardEvent)
    if (useSpeak && e) {
      const utterance = new SpeechSynthesisUtterance();
      utterance.text = e.currentTarget.getAttribute("aria-label");
      window.speechSynthesis.speak(utterance);
    }else if(text !== '' && (useSpeak || permissionToTalk)){
      const utterance = new SpeechSynthesisUtterance();
      utterance.text = text;
      window.speechSynthesis.speak(utterance);
    }
    if (e) {
      e.stopPropagation();
    }
  }
  
  function stopSpeak(e) {
    e.stopPropagation();
    window.speechSynthesis.cancel();
  }

  return (
    <AccesibilityContext.Provider value={{ speak, stopSpeak, setUseSpeak, useSpeak }}>
      {children}
    </AccesibilityContext.Provider>
  );
}

export default UseAccesibility;
