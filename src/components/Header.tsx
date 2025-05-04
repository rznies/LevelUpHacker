import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  const getLinkClass = () => {
    return "text-black hover:underline";
  };

  return (
    <header className="bg-[#ff6600] px-[2px] py-[1px]">
      <nav className="flex items-center gap-[2px] text-[10pt]">
        <Link to="/" className="flex items-center mr-[4px]">
          <img
            src="/y18.svg"
            className="border border-white w-[18px] h-[18px]"
            alt="Y Combinator"
          />
        </Link>
        <div className="flex gap-[2px]">
          <Link to="/" className="font-bold text-black">
            Hacker News
          </Link>
          <span className="px-[2px]">|</span>
          <Link to="/newest" className={getLinkClass()}>
            new
          </Link>
          <span className="px-[2px]">|</span>
          <Link to="/front" className={getLinkClass()}>
            past
          </Link>
          <span className="px-[2px]">|</span>
          <Link to="/newcomments" className={getLinkClass()}>
            comments
          </Link>
          <span className="px-[2px]">|</span>
          <Link to="/ask" className={getLinkClass()}>
            ask
          </Link>
          <span className="px-[2px]">|</span>
          <Link to="/show" className={getLinkClass()}>
            show
          </Link>
          <span className="px-[2px]">|</span>
          <Link to="/jobs" className={getLinkClass()}>
            jobs
          </Link>
          <span className="px-[2px]">|</span>
          <Link to="/submit" className={getLinkClass()}>
            submit
          </Link>
        </div>
        <div className="ml-auto text-[10pt]">
          <Link to="/login" className="text-black hover:underline">
            login
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;