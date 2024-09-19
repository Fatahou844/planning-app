// ContextMenu.js
import React from "react";

const ContextMenu = ({ x, y, items, onClose }) => {
  return (
    <div
      style={{
        position: "absolute",
        top: y,
        left: x,
        background: "white",
        border: "1px solid #ccc",
        boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)",
        zIndex: 1000,
        padding: "10px",
      }}
      onClick={onClose} // Ferme le menu quand on clique sur un élément
    >
      {items.map((item, index) => (
        <div
          key={index}
          style={{ padding: "5px 10px", cursor: "pointer" }}
          onClick={item.onClick}
        >
          {item.label}
        </div>
      ))}
    </div>
  );
};

export default ContextMenu;
