import { useEffect, useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  endpointId: number;
};

interface Data {
  request_id: number;
  endpoint_id: number;
  ip_address: string;
  object_types: any;
  query_string: string;
  complexity_score: number;
  query_depth: number;
}

function RequestTable ({ endpointId }: Props) {
  const [ tableData, setTableData ] = useState<Array<Data>>([]);
  useEffect(() => {
    axios.get(`/api/data/${endpointId}`)
    .then(response => {
      setTableData(response.data);
    })
    .catch((err: any) => console.log(err.message));   
  });
  return (
    <TableContainer component={Paper}>
      <Table stickyHeader={true} sx={{ tableLayout: 'fixed' }}>
        <TableHead>
          <TableRow>
            <TableCell>IP Address</TableCell>
            <TableCell align="right">Object Types</TableCell>
            <TableCell align="right">Query String</TableCell>
            <TableCell align="right">Complexity Score</TableCell>
            <TableCell align="right">Query Depth</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tableData && tableData.map((row) => {
            const types: any = row.object_types.objectTypes;
            let objectTypes: string = '[';
            for(let i = 0; i < types.length; i++) {
              objectTypes = objectTypes + ' ' + types[0];
              if(i < types.length - 1) objectTypes += ',';
            }
            objectTypes += ' ]';
            return (
              <TableRow
              key={uuidv4()}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">{row.ip_address}</TableCell>
                <TableCell align="right">{objectTypes}</TableCell>
                <TableCell align="right">{row.query_string}</TableCell>
                <TableCell align="right">{row.complexity_score}</TableCell>
                <TableCell align="right">{row.query_depth}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>

  );
};

export default RequestTable;