import React, { useEffect, useState } from 'react';
import { loadUrls, saveUrls, findUrlByCode } from './storgae';
import { Logger } from './logger';
import { Typography, Paper, Accordion, AccordionSummary, AccordionDetails, Stack, Button } from '@mui/material';

export default function StatsPage() {
  const [urls, setUrls] = useState([]);

  useEffect(() => {
    setUrls(loadUrls());
  }, []);

  function clearAll() {
    saveUrls([]);
    setUrls([]);
    Logger.log('info', 'Cleared all short URLs');
  }

  function removeExpired() {
    const now = new Date();
    const remaining = urls.filter(u => new Date(u.expiresAt) > now);
    saveUrls(remaining);
    setUrls(remaining);
    Logger.log('info', 'Removed expired URLs', { removedCount: urls.length - remaining.length});
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h5">URL Statistics</Typography>
      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
        <Button variant="outlined" color="error" onClick={clearAll}>Clear All</Button>
        <Button variant="outlined" onClick={removeExpired}>Remove Expired</Button>
      </Stack>

      <Stack spacing={2} sx={{ mt: 2 }}>
        {urls.length === 0 && <Typography>No shortened URLs yet.</Typography>}
        {urls.map(u => (
          <Accordion key={u.shortCode}>
            <AccordionSummary>
              <div>
                <Typography><strong>{window.location.origin}/{u.shortCode}</strong></Typography>
                <Typography variant="body2">Original: {u.originalUrl}</Typography>
                <Typography variant="body2">Expires: {new Date(u.expiresAt).toLocaleString()}</Typography>
                <Typography variant="body2">Clicks: {(u.clicks || []).length}</Typography>
              </div>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="subtitle2">Click details</Typography>
              {(u.clicks || []).length === 0 && <Typography>No clicks yet.</Typography>}
              {(u.clicks || []).map((c, i) => (
                <Paper key={i} sx={{ p: 1, mt: 1 }}>
                  <Typography variant="body2">Time: {new Date(c.timestamp).toLocaleString()}</Typography>
                  <Typography variant="body2">Referrer: {c.referrer || 'direct'}</Typography>
                  <Typography variant="body2">Location: {c.location || 'unknown'}</Typography>
                </Paper>
              ))}
            </AccordionDetails>
          </Accordion>
        ))}
      </Stack>
    </Paper>
  );
}