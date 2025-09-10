import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Home from './pages/Home';
import Publish from './pages/Publish';
import ArticleView from './pages/ArticleView';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router basename="/Academix">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/publish" element={<Publish />} />
            <Route path="/article/:slug" element={<ArticleView />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
