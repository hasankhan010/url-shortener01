import React, { useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { findUrlByCode, loadUrls, saveUrls } from './storgae';
import { Logger } from './logger';
import { Typography, Paper, Button } from '@mui/material';

function getCoarseLocation() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown';
    const lang = navigator.language || 'unknown';
    return `${lang} / ${tz}`;
  } catch {
    return 'unknown';
  }
}

export default function RedirectHandler() {
  const { code } = useParams();
  const [status, setStatus] = useState('checking');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const urlObj = findUrlByCode(code);
    if (!urlObj) {
      setStatus('notfound');
      setMessage('Shortcode not found.');
      Logger.log('warn', 'Redirect attempted for missing shortcode', { code });
      return;
    }

    const now = new Date();
    const expiresAt = new Date(urlObj.expiresAt);
    if (now > expiresAt) {
      setStatus('expired');
      setMessage('This short link has expired.');
      Logger.log('info', 'Attempted access to expired shortcode', { code });
      return;
    }

    // record click
    const referrer = document.referrer || 'direct';
    const click = {
      timestamp: now.toISOString(),
      referrer,
      location: getCoarseLocation()
    };

    const urls = loadUrls();
    const idx = urls.findIndex(u => u.shortCode === code);
    if (idx >= 0) {
      urls[idx].clicks = urls[idx].clicks || [];
      urls[idx].clicks.push(click);
      saveUrls(urls);
      Logger.log('info', 'Recorded click', { code, click });
    }

    setStatus('redirecting');
    setMessage('Redirecting you to the original URL...');

    // small delay so storage and logging have time; then redirect
    const timer = setTimeout(() => {
      window.location.href = urlObj.originalUrl;
    }, 300);

    return () => clearTimeout(timer);
  }, [code]);

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6">Short Link</Typography>
      <Typography sx={{ mt: 2 }}>{message}</Typography>
      {status === 'notfound' && <Button variant="contained" sx={{ mt:2 }} component={RouterLink} to="/">Create a new short link</Button>}
      {status === 'expired' && <Button variant="contained" sx={{ mt:2 }} component={RouterLink} to="/stats">View statistics</Button>}
    </Paper>
  );
}