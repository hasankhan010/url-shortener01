import React, { useState } from 'react';
import { TextField, Button, Grid, Paper, Typography, Alert, Stack } from '@mui/material';
import { saveUrls, loadUrls } from './storgae';
import { generateShortCode, isValidShortcode } from './shortcode';
import { Logger } from './logger';

function defaultEntry() {
  return { originalUrl: '', minutes: '', customCode: '' };
}

export default function ShortenerPage() {
  const [inputs, setInputs] = useState([defaultEntry()]);
  const [errors, setErrors] = useState([]);
  const [results, setResults] = useState([]);

  const maxRows = 5;

  function updateInput(idx, field, value) {
    const copy = inputs.slice();
    copy[idx][field] = value;
    setInputs(copy);
  }

  function addRow() {
    if (inputs.length >= maxRows) return;
    setInputs(prev => [...prev, defaultEntry()]);
  }

  function removeRow(i) {
    setInputs(prev => prev.filter((_, idx) => idx !== i));
  }

  function validateUrl(value) {
    try {
      const u = new URL(value);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      return false;
    }
  }

  function handleSubmit(e) {
    e?.preventDefault();
    const currentUrls = loadUrls();
    const newErrors = [];
    const newEntries = [];

    // Validate each input row
    inputs.forEach((row, idx) => {
      if (!row.originalUrl) {
        newErrors.push(`Row ${idx+1}: URL is required.`);
        return;
      }
      if (!validateUrl(row.originalUrl)) {
        newErrors.push(`Row ${idx+1}: Invalid URL format.`);
        return;
      }
      let minutes = parseInt(row.minutes === '' ? '30' : row.minutes, 10);
      if (isNaN(minutes) || minutes <= 0) {
        newErrors.push(`Row ${idx+1}: Minutes must be a positive integer.`);
        return;
      }
      let shortCode = row.customCode?.trim();
      if (shortCode) {
        if (!isValidShortcode(shortCode)) {
          newErrors.push(`Row ${idx+1}: Custom shortcode invalid (alphanumeric, 3-20 chars).`);
          return;
        }
        // uniqueness
        const already = currentUrls.find(u => u.shortCode === shortCode) || newEntries.find(u => u.shortCode===shortCode);
        if (already) {
          newErrors.push(`Row ${idx+1}: Custom shortcode "${shortCode}" already exists.`);
          return;
        }
      } else {
        // auto-generate with uniqueness check
        let attempt = 0;
        do {
          shortCode = generateShortCode(6);
          attempt++;
        } while ((currentUrls.find(u => u.shortCode === shortCode) || newEntries.find(u => u.shortCode===shortCode)) && attempt < 10);
        // if collision after attempts, increase length
        if (currentUrls.find(u => u.shortCode === shortCode) || newEntries.find(u => u.shortCode===shortCode)) {
          shortCode = generateShortCode(8);
        }
      }

      const createdAt = new Date();
      const expiresAt = new Date(createdAt.getTime() + minutes * 60000);
      const entry = {
        originalUrl: row.originalUrl.trim(),
        shortCode,
        createdAt: createdAt.toISOString(),
        expiresAt: expiresAt.toISOString(),
        clicks: []
      };
      newEntries.push(entry);
    });

    if (newErrors.length) {
      setErrors(newErrors);
      setResults([]);
      Logger.log('error', 'Validation failed on shorten form', {errors: newErrors});
      return;
    }

    // Persist
    const merged = [...currentUrls, ...newEntries];
    saveUrls(merged);
    setErrors([]);
    setResults(newEntries);
    setInputs([defaultEntry()]);
    Logger.log('info', 'Created short URLs', {count: newEntries.length, entries: newEntries.map(e=>e.shortCode)});
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>URL Shortener</Typography>

      {errors.length > 0 && (
        <Stack spacing={1} sx={{ mb: 2 }}>
          {errors.map((err, i) => <Alert severity="error" key={i}>{err}</Alert>)}
        </Stack>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {inputs.map((row, idx) => (
            <React.Fragment key={idx}>
              <Grid item xs={12}>
                <Typography variant="subtitle1">Entry {idx+1}</Typography>
              </Grid>
              <Grid item xs={12} sm={7}>
                <TextField
                  label="Original URL"
                  fullWidth
                  value={row.originalUrl}
                  onChange={(e) => updateInput(idx, 'originalUrl', e.target.value)}
                  placeholder="https://example.com/long-path"
                  required
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  label="Validity (minutes)"
                  fullWidth
                  value={row.minutes}
                  onChange={(e) => updateInput(idx, 'minutes', e.target.value)}
                  placeholder="30"
                  type="number"
                  inputProps={{ min: 1 }}
                />
              </Grid>
              <Grid item xs={6} sm={2}>
                <TextField
                  label="Custom shortcode (optional)"
                  fullWidth
                  value={row.customCode}
                  onChange={(e) => updateInput(idx, 'customCode', e.target.value)}
                  placeholder="abc123"
                />
              </Grid>

              <Grid item xs={12}>
                <Stack direction="row" spacing={1}>
                  {inputs.length > 1 && (
                    <Button variant="outlined" color="error" onClick={() => removeRow(idx)}>Remove</Button>
                  )}
                  {idx === inputs.length - 1 && inputs.length < 5 && (
                    <Button variant="outlined" onClick={addRow}>Add another</Button>
                  )}
                </Stack>
              </Grid>
            </React.Fragment>
          ))}
          <Grid item xs={12}>
            <Stack direction="row" spacing={2}>
              <Button variant="contained" type="submit">Shorten</Button>
              <Button variant="outlined" onClick={() => { setInputs([defaultEntry()]); setErrors([]); setResults([]); }}>Reset</Button>
            </Stack>
          </Grid>
        </Grid>
      </form>

      {results.length > 0 && (
        <Paper variant="outlined" sx={{ p: 2, mt: 3 }}>
          <Typography variant="h6">Created Short URLs</Typography>
          <Stack spacing={1} sx={{ mt: 1 }}>
            {results.map(r => {
              const shortUrl = `${window.location.origin}/${r.shortCode}`;
              return (
                <Paper key={r.shortCode} sx={{ p: 1 }}>
                  <Typography variant="body1"><strong>{shortUrl}</strong></Typography>
                  <Typography variant="body2">Original: {r.originalUrl}</Typography>
                  <Typography variant="body2">Expires: {new Date(r.expiresAt).toLocaleString()}</Typography>
                </Paper>
              );
            })}
          </Stack>
        </Paper>
      )}

    </Paper>
  );
}