// App.jsx
import React from "react";
import Header from "./components/Header";


import "./App.css";
import DashBoard from './components/DashBoard';
const App = () => {


  return (
    
    <div className="app">
      <Header />
      
      <div className="content">
        <DashBoard />
     
      </div>
       
      
    </div>
  );
};

export default App;
