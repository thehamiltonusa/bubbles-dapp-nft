import React,{useEffect,useMemo,useState} from "react";
import {
  HashRouter as Router,
  Route,
  Switch,
  Redirect,
  Link
} from 'react-router-dom';
import { ChakraProvider } from "@chakra-ui/react"

import useWeb3Modal from "./hooks/useWeb3Modal";
import useContract from "./hooks/useContract";
import { AppContext, useAppState } from './hooks/useAppState'

import Home from "./screens/Home";
//import Mint from "./screens/Mint";
//import Profile from "./screens/Profile";
//import GamesPage from "./screens/Games";

//import Feedbacks from "./screens/Feedbacks";
import SavedBlobs from "./screens/SavedBlobs";

import AllSavedBlobs from "./screens/AllSavedBlobs";



//import GET_TRANSFERS from "./graphql/subgraph";


function App() {


  return (
    <ChakraProvider>

      <AppContext.Provider>

        <Router>

        <div>

          <Switch>
            <Route path="/home" component={Home}/>
            <Route path="/all-saved-blobs" component={AllSavedBlobs}/>
            <Route path="/saved-blobs" component={SavedBlobs}/>


            {/*
              <Route path="/all-avatars" component={AllAvatars}/>
              <Route path="/profile" component={Profile}/>
              <Route path="/games" component={GamesPage}/>
              <Route path="/feedbacks" component={Feedbacks}/>
              <Route render={() => {

                return(
                  <Redirect to="/home" />
                );

              }} />
            */}
            <Route render={() => {

              return(
                <Redirect to="/home" />
              );

            }} />
          </Switch>


        </div>
        </Router>

      </AppContext.Provider>
    </ChakraProvider>

  );
}

export default App;
