import ReactDOM from "react-dom";
import React from "react";
import App from "./app";
import { Provider } from "react-redux";
import { createStore, applyMiddleware } from "redux";
import Thunk from "redux-thunk";
const middleWare = [Thunk];
const store = createStore(reducers, applyMiddleWare(...middleWare));

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("app")
);
