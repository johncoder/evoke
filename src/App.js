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
  let kbd = [];

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
        env[fn].action instanceof Function) {
      env[fn].action();
    }
    setFunctionSelectVisible(false);
    setFunctionSelectInput("");
  };

  kbd = [
    {
      keys: {key: 'Escape'},
      action: reset,
      functionName: 'reset-counter',
    },
    {
      keys: {key: 'c', ctrlKey: true},
      action: togglePanelVisible,
      functionName: 'toggle-panel-visible',
    },
    {
      keys: {key: 'g'},
      action: incrementCount,
      functionName: 'increment-counter',
      // TODO(john): improve this?
      only: () => document.activeElement === document.body,
    },
    {
      keys: {key: 'x', altKey: true},
      action: toggleFunctionSelectVisible,
      functionName: 'toggle-function-select',
    },
    {
      keys: {key: 'Enter'},
      action: executeSelectedFunction,
      // TODO(john): improve this?
      only: () => document.activeElement === functionSelectInputRef.current,
    },
    {
      action: () => console.log('hello, world!'),
      functionName: 'hello-world',
    }
  ];

  kbd.filter(k => k.functionName).forEach(k => env[k.functionName] = k);

  const [handler] = generateKeybinds(kbd);
  useEventListener('keydown', handler);

  const getHumanKeybinding = (v) => {
    if (v.keys) {
      return `(${v.keys.ctrlKey?'ctrl+':''}${v.keys.altKey?'alt+':''}${v.keys.key})`;
    }
    return '';
  };

  const getFunctionFromEnv = (fn, i) => {
    return (
      <li key={i}>{fn} {getHumanKeybinding(env[fn])}</li>
    );
  };

  const fnSelect = (
    <div className="functionSelect">
      <input name="functionSelectInputValue" type="text"
             value={functionSelectInput}
             autoComplete="off"
             onChange={updateFunctionSelectInput}
             ref={functionSelectInputRef}/>
      <ul>
        {Object.keys(env)
         .filter(e => e.startsWith(functionSelectInput))
         .map((e, i) => getFunctionFromEnv(e, i))
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
