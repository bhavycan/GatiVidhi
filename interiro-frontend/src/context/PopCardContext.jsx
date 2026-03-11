import React, { createContext, useContext, useRef, useState } from "react";

const PopcardContext = createContext();

export const PopcardProvider = ({ children }) => {
  const [popcard, setPopcard] = useState({ message: "", visible: false, id: null });
  const timeoutRef = useRef(null);

  const showPopcard = (msg, visible = true, duration = null) => {
    const newId = Date.now();
    setPopcard({ message: msg, visible, id: newId });

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (visible && duration) {
      timeoutRef.current = setTimeout(() => {
        setPopcard((prev) => {
          if (prev.id === newId) {
            return { ...prev, visible: false };
          }
          return prev;
        });
      }, duration);
    }
  };

  return (
    <PopcardContext.Provider value={{ popcard, showPopcard }}>
      {children}
    </PopcardContext.Provider>
  );
};

export const usePopcard = () => useContext(PopcardContext);
