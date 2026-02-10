import { Box } from "@mui/material";
import { useState } from "react";
import Sidebar from "../Components/Store/Sidebar";
import Topbar from "../Components/Store/Topbar";
import Articles from "../Pages/Articles";
import Atelier from "../Pages/Atelier";
import Inventaire from "../Pages/Inventaire";
import Reception from "../Pages/Reception";
import Stock from "../Pages/Stock";

const pages = {
  articles: <Articles />,
  stock: <Stock />,
  atelier: <Atelier />,
  inventaire: <Inventaire />,
  reception: <Reception />,
};

export default function AppLayout() {
  const [activePage, setActivePage] = useState("articles");

  return (
    <Box
      display="grid"
      gridTemplateColumns="280px 1fr"
      gridTemplateRows="64px 1fr"
      sx={{ height: "100vh", px: 4 }}
    >
      <Topbar />
      <Sidebar active={activePage} onChange={setActivePage} />
      <Box gridColumn="2" gridRow="2" p={2} overflow="auto">
        {pages[activePage]}
      </Box>
    </Box>
  );
}
