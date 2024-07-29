import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Card,
  CardContent,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";

const CalendarEvent = ({
  title,
  person,
  operationType,
  startHour,
  endHour,
}) => (
  <Card
    sx={{
      mb: 1,
      backgroundColor: "#e3f2fd",
      borderRadius: "8px",
      boxShadow: 2,
    }}
  >
    <CardContent>
      <Typography variant="body2" sx={{ fontWeight: "bold" }}>
        {title}
      </Typography>
      <Typography variant="body2">{person}</Typography>
      <Typography variant="body2">{operationType}</Typography>
      <Typography variant="caption">
        {startHour}:00 - {endHour}:00
      </Typography>
    </CardContent>
  </Card>
);

const Timeline = () => (
  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
    {[...Array(12).keys()].map((hour) => (
      <Box
        key={hour}
        sx={{
          flexGrow: 1,
          textAlign: "center",
          borderRight: "1px solid lightgray",
        }}
      >
        <Typography variant="caption">{7 + hour}:00</Typography>
      </Box>
    ))}
  </Box>
);

const CurrentTimeLine = ({ currentHour }) => (
  <Box
    sx={{
      position: "absolute",
      top: 0,
      left: `${((currentHour - 7) / 12) * 100}%`,
      width: "2px",
      height: "100%",
      backgroundColor: "blue",
      zIndex: 1,
    }}
  />
);

const Calendar = () => {
  const [expanded, setExpanded] = useState("");

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : "");
  };

  const events = [
    {
      category: "Entretien / Révision",
      summary: "3 events",
      date: "Jan 31 - Feb 4",
      items: [
        {
          title: "Entretiens",
          person: "John Doe",
          operationType: "Maintenance",
          startHour: 8,
          endHour: 10,
        },
      ],
    },
    {
      category: "Rapide",
      summary: "3 events",
      date: "Jan 31 - Feb 4",
      items: [
        {
          title: "Opération A",
          person: "Jane Smith",
          operationType: "Quick Service",
          startHour: 8,
          endHour: 10,
        },
        {
          title: "Opération B",
          person: "Paul Brown",
          operationType: "Quick Check",
          startHour: 9,
          endHour: 12,
        },
        {
          title: "Opération C",
          person: "Emily White",
          operationType: "Quick Fix",
          startHour: 14,
          endHour: 17,
        },
      ],
    },
    {
      category: "Mécanique",
      summary: "4 events",
      date: "Jan 31 - Feb 4",
      items: [
        {
          title: "Ateliers",
          person: "Michael Green",
          operationType: "Workshop",
          startHour: 13,
          endHour: 15,
        },
      ],
    },
    {
      category: "Électricité",
      summary: "3 events",
      date: "Jan 31 - Feb 4",
      items: [
        {
          title: "Électricité",
          person: "Laura Blue",
          operationType: "Electrical Check",
          startHour: 15,
          endHour: 18,
        },
      ],
    },
    {
      category: "Climatisation",
      summary: "4 events",
      date: "Jan 31 - Feb 4",
      items: [
        {
          title: "Climatisation",
          person: "Daniel Gray",
          operationType: "AC Service",
          startHour: 16,
          endHour: 18,
        },
      ],
    },
  ];

  const currentHour = new Date().getHours();

  const [filterDate, setFilterDate] = useState("");

  const handleDateChange = (event) => {
    setFilterDate(event.target.value);
  };

  return (
    <Box
      sx={{ padding: 3, display: "flex", position: "relative", width: "100%" }}
    >
      <Box sx={{ width: "250px", borderRight: "1px solid lightgray", pr: 2 }}>
        {/* Date Filter */}
        <TextField
          label="Filter by Date"
          variant="outlined"
          fullWidth
          sx={{ mb: 2 }}
          value={filterDate}
          onChange={handleDateChange}
        />
        {events.map((eventCategory) => (
          <Accordion
            key={eventCategory.category}
            expanded={expanded === eventCategory.category}
            onChange={handleChange(eventCategory.category)}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">{eventCategory.category}</Typography>
              <Typography variant="caption" sx={{ ml: 1 }}>
                {eventCategory.summary}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="textSecondary">
                {eventCategory.date}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
      <Box
        sx={{
          flexGrow: 1,
          position: "relative",
          pl: 3,
          backgroundColor: "#f9f9f9",
          padding: 2,
          borderRadius: "8px",
        }}
      >
        <Timeline />
        <CurrentTimeLine currentHour={currentHour} />
        {/* Zone de repos */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: `${((12 - 7) / 12) * 100}%`,
            width: `${((14 - 12) / 12) * 100}%`,
            height: "100%",
            backgroundColor: "rgba(200, 200, 200, 0.5)", // Gris clair
            zIndex: 0,
          }}
        />
        {events.map((eventCategory, index) =>
          expanded === eventCategory.category
            ? eventCategory.items.map((event, idx) => (
                <Box
                  key={event.title}
                  sx={{
                    position: "absolute",
                    top:
                      index * 100 + idx * 50 != 0
                        ? `${index * 100 + idx * 50}px`
                        : ``,
                    left: `${((event.startHour - 7) / 12) * 100}%`,
                    width: `${((event.endHour - event.startHour) / 12) * 100}%`,
                    height: "40px",
                    backgroundColor: "#e3f2fd",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: 2,
                    border: "1px solid #90caf9",
                    zIndex: 1,
                  }}
                >
                  <Typography variant="body2" sx={{ p: 1 }}>
                    {event.person}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: "bold", p: 1 }}>
                    {event.title}
                  </Typography>
                  <Typography variant="caption">
                    {event.startHour}:00 - {event.endHour}:00
                  </Typography>
                </Box>
              ))
            : null
        )}
      </Box>
    </Box>
  );
};

export default Calendar;
