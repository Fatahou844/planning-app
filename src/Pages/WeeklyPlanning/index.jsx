// import { format, getDay, parse, startOfWeek } from "date-fns";
// import { fr } from "date-fns/locale";
// import { Calendar, dateFnsLocalizer } from "react-big-calendar";
// import "react-big-calendar/lib/css/react-big-calendar.css";
// import "./calendar-light.css"; // Style clair adapté à ton thème

// const locales = { fr };

// const localizer = dateFnsLocalizer({
//   format,
//   parse,
//   startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
//   getDay,
//   locales,
// });

// const events = [
//   {
//     title: "VIDANGE - REVISION • Mouhcine • XXXX-XX01",
//     start: new Date(2025, 7, 12, 15, 0),
//     end: new Date(2025, 7, 12, 18, 0),
//     category: "vidange",
//   },
//   {
//     title: "MECANIQUE • Fatihya • 100-0808",
//     start: new Date(2025, 7, 12, 16, 0),
//     end: new Date(2025, 7, 12, 19, 0),
//     category: "mecanique",
//   },
//   {
//     title: "ELECTRICITE • Salah • 110-0202",
//     start: new Date(2025, 7, 14, 10, 30),
//     end: new Date(2025, 7, 14, 12, 0),
//     category: "electricite",
//   },
//   {
//     title: "MECANIQUE • Salim • 1X0-0202",
//     start: new Date(2025, 7, 14, 10, 30),
//     end: new Date(2025, 7, 14, 17, 0),
//     category: "mecanique",
//   },
// ];

// export default function WeeklyPlanning() {
//   const eventStyleGetter = (event) => {
//     let backgroundColor = "#4F46E5"; // default primary
//     if (event.category === "vidange") backgroundColor = "#4F46E5"; // indigo
//     if (event.category === "mecanique") backgroundColor = "#3B82F6"; // bleu
//     if (event.category === "electricite") backgroundColor = "#22C55E"; // vert

//     return {
//       style: {
//         backgroundColor,
//         color: "#fff",
//         borderRadius: "14px",
//         border: "none",
//         padding: "6px 8px",
//         fontSize: "0.85rem",
//         boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
//       },
//     };
//   };

//   const messages = {
//     allDay: "Toute la journée",
//     previous: "Précédent",
//     next: "Suivant",
//     today: "Aujourd'hui",
//     month: "Mois",
//     week: "Semaine",
//     day: "Jour",
//     agenda: "Agenda",
//     date: "Date",
//     time: "Heure",
//     event: "Événement",
//     showMore: (total) => `+ ${total} plus`,
//   };

//   const formats = {
//     dayFormat: (date, culture, localizer) =>
//       localizer.format(date, "EEEE dd/MM", culture), // Lundi 12/08
//     weekdayFormat: (date, culture, localizer) =>
//       localizer.format(date, "EEEE", culture), // Lundi, Mardi...
//     timeGutterFormat: (date, culture, localizer) =>
//       localizer.format(date, "HH:mm", culture), // 24h format
//   };

//   return (
//     <div
//       style={{
//         height: "100vh",
//         backgroundColor: "#F8FAFC",
//         padding: "16px",
//         marginLeft: "2rem",
//       }}
//     >
//       <Calendar
//         localizer={localizer}
//         events={events}
//         startAccessor="start"
//         endAccessor="end"
//         defaultView="week"
//         views={["week"]}
//         messages={messages} // 🔹 Ici on ajoute les textes traduits
//         formats={formats}
//         culture="fr"
//         step={30}
//         timeslots={2}
//         eventPropGetter={eventStyleGetter}
//         min={new Date(2025, 7, 12, 6, 0)}
//         max={new Date(2025, 7, 12, 21, 30)}
//         style={{ fontFamily: "'Inter', sans-serif", borderRadius: "16px" }}
//       />
//     </div>
//   );
// }

import { format, getDay, parse, startOfWeek } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar-light.css"; // tes styles

const locales = { fr };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

// Fonction pour transformer ton tableau brut en format RBC
const mapOrdersToEvents = (orders) => {
  return orders.map((order) => {
    const start = new Date(order.date);
    start.setHours(order.startHour || 0, order.startMinute || 0);

    const end = new Date(order.date);
    end.setHours(order.endHour || 0, order.endMinute || 0);

    return {
      title: `${order.Category?.name || ""} • ${
        order.Client?.firstName || ""
      } • ${order.Vehicle?.plateNumber || ""}`,
      start,
      end,
      category: order.Category?.name?.toLowerCase() || "default",
      color: order.Category?.color || "#4F46E5",
    };
  });
};

export default function WeeklyPlanning({ ordersData = [] }) {
  const events = mapOrdersToEvents(ordersData);

  const eventStyleGetter = (event) => {
    return {
      style: {
        backgroundColor: event.color,
        color: "#fff",
        borderRadius: "14px",
        border: "none",
        padding: "6px 8px",
        fontSize: "0.85rem",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      },
    };
  };

  const messages = {
    allDay: "Toute la journée",
    previous: "Précédent",
    next: "Suivant",
    today: "Aujourd'hui",
    month: "Mois",
    week: "Semaine",
    day: "Jour",
    agenda: "Agenda",
    date: "Date",
    time: "Heure",
    event: "Événement",
    showMore: (total) => `+ ${total} plus`,
  };

  const formats = {
    dayFormat: (date, culture, localizer) =>
      localizer.format(date, "EEEE dd/MM", culture),
    weekdayFormat: (date, culture, localizer) =>
      localizer.format(date, "EEEE", culture),
    timeGutterFormat: (date, culture, localizer) =>
      localizer.format(date, "HH:mm", culture),
  };

  return (
    <div
      style={{
        height: "100vh",
        backgroundColor: "#F8FAFC",
        padding: "16px",
        marginLeft: "2rem",
      }}
    >
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        defaultView="week"
        views={["week", "day"]}
        messages={messages}
        formats={formats}
        culture="fr"
        step={30}
        timeslots={2}
        eventPropGetter={eventStyleGetter}
        min={new Date(2025, 0, 1, 6, 0)}
        max={new Date(2025, 0, 1, 21, 30)}
        style={{ fontFamily: "'Inter', sans-serif", borderRadius: "16px" }}
      />
    </div>
  );
}
