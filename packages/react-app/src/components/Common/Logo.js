import React from 'react';
import { Link } from 'react-router-dom';

const Logo = ({ size = 100 }) => {


  return (
    <Link to="/home">
      <img
        alt="Bubbles logo"
        style={{ height: size, width: size }}
        src="https://ipfs.io/ipfs/bafkreifr72jsndqndlayagowyi3rfzxx5ctfwdkvy7fm5b7tjxubv7epdu"
      />
    </Link>
  );
};

export default Logo;
