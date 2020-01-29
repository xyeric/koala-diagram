import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import store from './store';
import HomePage from './pages/home';

// ReactDOM.render(
//   <Provider store={store}>
//     <HomePage />
//   </Provider>,
//   document.getElementById('root')
// );


ReactDOM.render(
  <Provider store={store}>
    <HomePage />
  </Provider>,
  document.getElementById('app')
);
