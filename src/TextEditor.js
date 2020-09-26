import React, {useState, useRef} from 'react';
import useEventListener from './use-event-listener';
import './App.css';

function renderLinesAndCursor(content, ref) {
  if (!ref.current) { // || content.length === 0) {
    return [];
  }
  const { selectionStart, selectionEnd, selectionDirection } = ref.current;
  const distance = Math.abs(selectionStart - selectionEnd);
  const highlighting = distance > 0;

  // TODO(john): explore storing the lines, and using selectionStart
  // to determine which lines to update?
  let lines = [];
  let currentLine = [];
  let cursorRendered = false;
  for (var i = 0; i < content.length; i++) {
    const c = content[i];
    if ((i === selectionEnd && selectionDirection === "forward") ||
        (i === selectionStart && selectionDirection === "backward")) {
      currentLine.push((<span key={`text-cursor-${i}`} className="texteditor-cursor">&nbsp;</span>));
      cursorRendered = true;
    }
    let highlight = '';
    if (highlighting && i >= selectionStart && i < selectionEnd) {
      highlight = 'texteditor-highlight';
    } 
    if (c === '\n') {
      if (currentLine.length === 0 && highlighting) {
        currentLine.push((<span key={`text-${i}`} className={highlight}>&nbsp;</span>));
      }
      lines.push(currentLine);
      currentLine = [];
      continue;
    }
    currentLine.push((<span key={`text-${i}`} className={highlight}>{c}</span>));
  }
  if (!cursorRendered) {
    currentLine.push((<span key={`text-cursor-end`} className="texteditor-cursor">&nbsp;</span>));
  }
  lines.push(currentLine);
  return lines.map((l, i) => {return (<div key={`line-${i}`}>{l||' '}</div>)});
}

function TextEditor() {
  const [textEditorContent, setTextEditorContent] = useState('');
  const [cursorLocation, setCursorLocation] = useState(null);

  function handleChange(e) {
    setTextEditorContent(e.target.value);    
  }

  function handleSelectionChange(e) {
    if (textareaRef.current) {
      const loc = {};
      loc.selectionStart = textareaRef.current.selectionStart;
      loc.selectionEnd = textareaRef.current.selectionEnd;
      setCursorLocation(loc);
    }
  }

  function handleInput(e) {
    // console.log("input!", e, e.target);
  }

  const textareaRef = useRef(null);

  useEventListener('selectionchange', handleSelectionChange, document);

  const lines = renderLinesAndCursor(textEditorContent, textareaRef);

  return (
    <div onClick={textareaRef.current ? () => textareaRef.current.focus() : () => {}}>
      <textarea id="editor"
                name=""
                onChange={handleChange}
                onInput={handleInput}
                value={textEditorContent}
                className="texteditor"
                autoFocus={true}
                ref={textareaRef}
                cols="100"
                wrap="hard">
      </textarea>
      <div className="texteditor-content">
        {lines}
      </div>
    </div>
  );
}

export default TextEditor;
