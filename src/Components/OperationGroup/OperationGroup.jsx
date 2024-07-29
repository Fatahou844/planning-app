import React, { useState } from "react";
import "./OperationGroup.css";

function OperationGroup({ title, color, events }) {
  const [expanded, setExpanded] = useState(true);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <div className="operation-group" style={{ backgroundColor: color }}>
      <div className="operation-header" onClick={toggleExpanded}>
        <h3>{title}</h3>
      </div>
      {expanded && (
        <div className="operation-events">
          {events.map((event, index) => (
            <div key={index} className="event">
              <p>{event.title}</p>
              <p>{event.dateRange}</p>
              <p>{event.eventsCount} Events</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OperationGroup;
