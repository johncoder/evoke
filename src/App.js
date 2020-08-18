import React, {useState, useRef} from 'react';
import {generateKeybinds, useEventListener} from './keybindings';
import './App.css';

function App() {
  const [count, setCount] = useState(0);
  const [panelVisible, setPanelVisible] = useState(false);
  const [functionSelectVisible, setFunctionSelectVisible] = useState(false);
  const [functionSelectInput, setFunctionSelectInput] = useState("");

  // thinking: env stores published functions
  const env = {};

  const functionSelectInputRef = useRef(null);
  
  const reset = () => setCount(0);
  const togglePanelVisible = () => setPanelVisible(!panelVisible);
  const incrementCount = () => setCount(count + 1);
  const toggleFunctionSelectVisible = () => {
    const newValue = !functionSelectVisible;
    setFunctionSelectVisible(newValue);
    if (newValue) {
      functionSelectInputRef.current.focus();
    }
  };
  const updateFunctionSelectInput = (e) => setFunctionSelectInput(e.target.value);
  const executeSelectedFunction = () => {
    let fn = functionSelectInput;
    const candidates = Object.keys(env)
          .filter(e => e.startsWith(functionSelectInput));
    if (candidates.length === 1) {
      fn = candidates[0];
    }
    if (env.hasOwnProperty(fn) &&
        env[fn] instanceof Function) {
      env[fn]();
    }
    setFunctionSelectVisible(false);
    setFunctionSelectInput("");
  };

  env['reset-counter'] = reset;
  env['toggle-panel-visible'] = togglePanelVisible;
  env['increment-counter'] = incrementCount;
  env['toggle-function-select'] = toggleFunctionSelectVisible;

  const [handler] = generateKeybinds([
    {
      keys: {key: 'Escape'},
      action: reset,
    },
    {
      keys: {key: 'c', ctrlKey: true},
      action: togglePanelVisible,
    },
    {
      keys: {key: 'g'},
      action: incrementCount,
      // TODO(john): improve this?
      only: () => document.activeElement === document.body,
    },
    {
      keys: {key: 'x', altKey: true},
      action: toggleFunctionSelectVisible,
    },
    {
      keys: {key: 'Enter'},
      action: executeSelectedFunction,
      // TODO(john): improve this?
      only: () => document.activeElement === functionSelectInputRef.current,
    }
  ]);
  useEventListener('keydown', handler);

  const handleInputEnter = (e) => {
    if (String(e.key) === 'Return') {
      executeSelectedFunction();
    }
  };

  const fnSelect = (
    <div className="functionSelect">
      <input name="functionSelectInputValue" type="text"
             value={functionSelectInput}
             autoComplete="off"
             onChange={updateFunctionSelectInput}
             onKeyPress={handleInputEnter}
             ref={functionSelectInputRef}/>
      <ul>
        {Object.keys(env)
         .filter(e => e.startsWith(functionSelectInput))
         .map((e, i) => (<li key={i}>{e}</li>))
         .slice(0, 5)}
      </ul>
    </div>
  );
  
  return (
    <div className="App">
      <header className="App-header">
        {panelVisible &&
         <p>
          Hello, world! {count}
         </p>
        }
        {functionSelectVisible && fnSelect}
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Experience React
        </a>
      </header>
    </div>
  );
}

export default App;
