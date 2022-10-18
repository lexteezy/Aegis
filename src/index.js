import React from 'react';
import ReactDOM from "react-dom";
import './index.css';
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Home from "./Pages/Home";

const App = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" exact element={<Home />} />
        </Routes>
      </Router>
    </>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));