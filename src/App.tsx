import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ContextProvider } from './context/context';
import Home from './components/Home';
import AllNFTs from './components/AllNFTs';
import UnsoldNFTs from './components/UnsoldNFTs';
import SingleNFT from './components/SingleNFT';
import MyNFTs from './components/MyNFTs';
import Mint from './components/Mint';
import Nav from './components/Nav';
import Footer from './components/Footer';

function App() {
  return (
    <ContextProvider>
      <Router>
        <Nav />
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/market" element={<UnsoldNFTs />} />
            <Route path="/items" element={<AllNFTs />} />
            <Route path="/item/:id" element={<SingleNFT />} />
            <Route path="/my-collection" element={<MyNFTs />} />
            <Route path="/mint" element={<Mint />} />
          </Routes>
        </div>
        <Footer />
      </Router>
    </ContextProvider>
  );
}

export default App;
