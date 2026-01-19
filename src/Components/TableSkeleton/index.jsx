// Components/TableSkeleton.jsx
import { Skeleton, Table, TableBody, TableCell, TableHead, TableRow, Box } from "@mui/material";

export default function TableSkeleton({ columns = 6, rows = 5 }) {
  return (
    <Box sx={{ p: 2 }}>
      <Skeleton variant="text" width="40%" height={32} />

      <Table>
        <TableHead>
          <TableRow>
            {Array.from({ length: columns }).map((_, i) => (
              <TableCell key={i}>
                <Skeleton variant="text" />
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {Array.from({ length: columns }).map((_, cellIndex) => (
                <TableCell key={cellIndex}>
                  <Skeleton variant="text" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
