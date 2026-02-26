/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import VocabBook from './pages/VocabBook';
import StudyMode from './pages/StudyMode';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/vocab" element={<VocabBook />} />
        <Route path="/study" element={<StudyMode />} />
      </Routes>
    </Router>
  );
}

