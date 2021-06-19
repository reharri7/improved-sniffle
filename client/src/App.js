import { Switch, Route } from 'react-router-dom';


import './App.css';

function App() {
  return (
    <div className="App">
      <Switch>
        <Route exact path='/' />
        <Route path='/:code' />
      </Switch>
    </div>
  );
}

export default App;
