import { useState } from "react";
import { Box, Tabs, Tab } from "@mui/material";
import Document from "../documents/document";
import ChildFolder from "../childFolder/childFolder";

export default function GlobalFolder({
  Departement,
  userRole,
  folder,
  Departements,
  user,
  parentFolder,
  page: initialPage = 1,
}) {
  const [tab, setTab] = useState(0);

  return (
    <>
      <Box sx={{ backgroundColor: "#fff" }}>
        <Tabs
          value={tab}
          onChange={(e, newValue) => setTab(newValue)}
          textColor="primary"
          indicatorColor="primary"
        //   sx={{ mb: 3 }}
        >
          <Tab label="Dossiers" sx={{ fontWeight: 600 }} />
          <Tab label="Documents" sx={{ fontWeight: 600 }} />
        </Tabs>

        {/* Panels */}
        {/* ===== TAB 1 folders ===== */}
        {tab === 0 && (
          <Box>
            <ChildFolder
              Departement={Departement}
              userRole={userRole}
              currentUser={user}
              Departements={Departements}
              parentFolder={parentFolder}
            ></ChildFolder>

            {/* <FolderDocument></FolderDocument> */}

            {/* <Box sx={{ minHeight: "100vh" }}>
            <Paper
              sx={{
                p: 3,
                boxShadow: "none",
                border: "1px solid #f5f5f5", // subtle gray border
                borderRadius: 2,
              }}
            >
              <FolderDocument
               Departement={Departement}
                userRole={userRole}
                currentUser={user}
                Departements={alldepartments}>

                </FolderDocument>

              </Paper>
              </Box> */}
          </Box>
        )}

        {/* ===== TAB 2 docs ===== */}
        {tab === 1 && (
          <Document
            Departement={Departement}
            userRole={userRole}
            folder={folder}
          />
        )}
      </Box>
    </>
  );
}
