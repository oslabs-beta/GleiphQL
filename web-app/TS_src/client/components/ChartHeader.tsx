import React, { useEffect } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import useStore from '../store';

const ChartHeader: React.FC<{}> = () => {
  const { 
    endpointRequests, 
    setEndpointRequests, 
    chartTimeInterval, 
    setChartTime, 
    chartDataType, 
    setChartDataType 
  } = useStore();

  const averageComplexity = () => {
    let sumOfScores = 0
    for (let i = 0; i < endpointRequests.length; i++) {
      sumOfScores += endpointRequests[i].complexity_score
    }
    const averageScore = sumOfScores / endpointRequests.length
    return Math.round(averageScore * 100) / 100
  }

 return (
    <TableContainer sx={{margin: "50px"}} component={Paper}>
      <Table  aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell align="center">Total API Requests</TableCell>
            <TableCell align="center">Total Blocked Requests</TableCell>
            <TableCell align="center">Average Complexity Score</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
            <TableRow>
              <TableCell align="center">{endpointRequests.length}</TableCell>
              <TableCell align="center">{0}</TableCell>
              <TableCell align="center">{averageComplexity()}</TableCell>
            </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default ChartHeader 