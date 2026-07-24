import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import LiveTv from './pages/LiveTv';
import Watch from './pages/Watch';
import Players from './pages/Players';
import PlayerProfile from './pages/PlayerProfile';
import GameReplay from './pages/GameReplay';
import Puzzle from './pages/Puzzle';
import Tournaments from './pages/Tournaments';
import TournamentDetail from './pages/TournamentDetail';
import Broadcasts from './pages/Broadcasts';
import BroadcastTour from './pages/BroadcastTour';
import BroadcastGame from './pages/BroadcastGame';
import Analysis from './pages/Analysis';
import Openings from './pages/Openings';
import Leaderboards from './pages/Leaderboards';
import PuzzleStreak from './pages/PuzzleStreak';
import NotFound from './pages/NotFound';

function App() {
  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tv" element={<LiveTv />} />
          <Route path="/tv/:channel" element={<Watch />} />
          <Route path="/watch/:gameId" element={<Watch />} />
          <Route path="/players" element={<Players />} />
          <Route path="/players/:username" element={<PlayerProfile />} />
          <Route path="/replay/:gameId" element={<GameReplay />} />
          <Route path="/puzzle" element={<Puzzle />} />
          <Route path="/puzzle/streak" element={<PuzzleStreak />} />
          <Route path="/tournaments" element={<Tournaments />} />
          <Route path="/tournaments/:id" element={<TournamentDetail />} />
          <Route path="/broadcasts" element={<Broadcasts />} />
          <Route path="/broadcasts/round/:roundId/:gameId" element={<BroadcastGame />} />
          <Route path="/broadcasts/:tourId" element={<BroadcastTour />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/openings" element={<Openings />} />
          <Route path="/leaderboards" element={<Leaderboards />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;
