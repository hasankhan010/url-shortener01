import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Container from '@mui/material/Container';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ShortenerPage from './shortenerpage';
import StatsPage from './statspage';
import RedirectHandler from './RedirectHandler';
import LogsPage from './LogsPage';

export default function App() {
  return (
    <Router>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            URL Shortener
          </Typography>
          <Button color="inherit" component={Link} to="/">Shorten</Button>
          <Button color="inherit" component={Link} to="/stats">Statistics</Button>
          <Button color="inherit" component={Link} to="/logs">Logs</Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Routes>
          <Route path="/" element={<ShortenerPage/>} />
          <Route path="/stats" element={<StatsPage/>} />
          <Route path="/logs" element={<LogsPage/>} />
          {/* specific static routes are declared above, this dynamic route handles root-level shortcodes */}
          <Route path="/:code" element={<RedirectHandler/>} />
        </Routes>
      </Container>
    </Router>
  );
}