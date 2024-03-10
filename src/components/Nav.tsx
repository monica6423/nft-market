import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Context } from '../context/context';
import Wallet from './Wallet';
import Logo from '../assets/logo.svg';

const Nav = () => {
  const {
    state: { connectedSignerAddress },
  } = useContext(Context);
  return (
    <nav className="navbar navbar-expand-lg bg-light">
      <div className="container-fluid">
        <Link to="/" className="navbar-brand">
          <img src={Logo} height="20" alt="" />
        </Link>
        <div className="collapse navbar-collapse" id="navbarNav">
          <div className="navbar-nav me-auto mb-2 mb-lg-0">
            <Link to="/" className="nav-item nav-link active">
              Home
            </Link>
            <Link to="/items" className="nav-item nav-link active">
              Browse
            </Link>
            <Link to="/market" className="nav-item nav-link active">
              Market
            </Link>
            <Link to="/my-collection" className="nav-item nav-link active">
              My Collection
            </Link>
            <Link to="/mint" className="nav-item nav-link active">
              Mint
            </Link>
          </div>
        </div>
        <Wallet />
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
      </div>
    </nav>
  );
};

export default Nav;
