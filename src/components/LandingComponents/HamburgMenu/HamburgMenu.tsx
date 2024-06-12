import React, { useState } from 'react';
import './landing-hamburg-menu.css';
import './landing-slideMenu.css';

const HamburgMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuOpened, setMenuOpened] = useState(false);

  const handleClick = () => {
    setIsOpen(!isOpen);
    setMenuOpened(true);
  };

  return (
    <div className="box-hamburg">
      <div className={`btn-hamburg ${isOpen ? "active" : "not-active"}`}
           onClick={handleClick}>
        <span className="span-hamburg"></span>
        <span className="span-hamburg"></span>
        <span className="span-hamburg"></span>
      </div>
      <div className={`sliding-menu ${menuOpened ? (isOpen ? "in": "out") : "hidden"}`}>
        <a href="/index.html">EDIT</a>
        <a href="/public">Item 2</a>
        <a href="/public">Item 3</a>
        <a href="/public">Item 4</a>
      </div>
    </div>
  )

}

export default HamburgMenu;