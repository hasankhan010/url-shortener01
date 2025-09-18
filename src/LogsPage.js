import React, { useState } from 'react';
import { Logger } from './logger';
import { Typography, Paper, Button, Stack } from '@mui/material';

export default function LogsPage(){
  const [logs, setLogs] = useState(Logger.getAll());

  function refresh(){
    setLogs(Logger.getAll());
  }
  function clearLogs(){
    Logger.clear();
    setLogs([]);
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h5">Application Logs</Typography>
      <Stack direction="row" spacing={2} sx={{ mt:2 }}>
        <Button variant="outlined" onClick={refresh}>Refresh</Button>
        <Button variant="outlined" color="error" onClick={clearLogs}>Clear</Button>
      </Stack>

      <div style={{ marginTop: 16 }}>
        {logs.length === 0 && <Typography>No logs yet</Typography>}
        {logs.map((l, i) => (
          <Paper key={i} style={{ padding: 8, marginBottom: 8 }}>
            <Typography variant="body2"><strong>{l.level}</strong> — {new Date(l.timestamp).toLocaleString()}</Typography>
            <Typography variant="body2">{l.message}</Typography>
            <Typography variant="caption">{l.meta ? JSON.stringify(l.meta) : ''}</Typography>
          </Paper>
        ))}
      </div>
    </Paper>
  );
}