import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PipBoard from './components/PipBoard';
import KeyboardShortcuts from './components/KeyboardShortcuts';
import TournamentReminders from './components/TournamentReminders';
import InstallPrompt from './components/InstallPrompt';
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
import PuzzleRush from './pages/PuzzleRush';
import Dashboard from './pages/Dashboard';
import HeadToHead from './pages/HeadToHead';
import Teams from './pages/Teams';
import TeamDetail from './pages/TeamDetail';
import MultiWatch from './pages/MultiWatch';
import RepertoireTrainer from './pages/RepertoireTrainer';
import TournamentCalendar from './pages/TournamentCalendar';
import Streamers from './pages/Streamers';
import CountryLeaderboard from './pages/CountryLeaderboard';
import NotFound from './pages/NotFound';

function App() {
  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-8 pt-[calc(var(--header-h,64px)+2rem)] sm:px-6 sm:pb-10 sm:pt-[calc(var(--header-h,64px)+2.5rem)]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tv" element={<LiveTv />} />
          <Route path="/tv/multi" element={<MultiWatch />} />
          <Route path="/tv/:channel" element={<Watch />} />
          <Route path="/watch/:gameId" element={<Watch />} />
          <Route path="/players" element={<Players />} />
          <Route path="/players/:username" element={<PlayerProfile />} />
          <Route path="/compare" element={<HeadToHead />} />
          <Route path="/compare/:userA/:userB" element={<HeadToHead />} />
          <Route path="/replay/:gameId" element={<GameReplay />} />
          <Route path="/puzzle" element={<Puzzle />} />
          <Route path="/puzzle/streak" element={<PuzzleStreak />} />
          <Route path="/puzzle/rush" element={<PuzzleRush />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/teams/:teamId" element={<TeamDetail />} />
          <Route path="/tournaments" element={<Tournaments />} />
          <Route path="/tournaments/calendar" element={<TournamentCalendar />} />
          <Route path="/streamers" element={<Streamers />} />
          <Route path="/leaderboards/country" element={<CountryLeaderboard />} />
          <Route path="/tournaments/:id" element={<TournamentDetail />} />
          <Route path="/repertoire" element={<RepertoireTrainer />} />
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
      <PipBoard />
      <KeyboardShortcuts />
      <TournamentReminders />
      <InstallPrompt />
    </>
  );
}

export default App;
