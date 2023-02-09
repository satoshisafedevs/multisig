import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Home from "./routes/Home";

function App() {
    return (
        <Router>
            <Switch>
                {/* <Route path="/about">
                    <About />
                </Route>
                <Route path="/topics">
                    <Topics />
                </Route> */}
                <Route path="/">
                    <Home />
                </Route>
            </Switch>
        </Router>
    );
}

export default App;
