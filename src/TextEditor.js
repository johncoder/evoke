import React, {useState, useRef, useCallback} from 'react';
import {useVirtual} from 'react-virtual';
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
  return lines;
}

function TextEditor() {
  const parentRef = useRef();
  const [textEditorContent, setTextEditorContent] = useState('');
  const [cursorLocation, setCursorLocation] = useState(null);
  const textareaRef = useRef(null);

  const lines = renderLinesAndCursor(textEditorContent, textareaRef);
  const getLineHeight = () => {
      const element = parentRef.current ? parentRef.current : document.body;
      const fspx = window.getComputedStyle(element, null)
            .getPropertyValue("font-size")
            .replace('px', '');
      const fs = 1.25*Math.round(parseFloat(fspx));
      return fs;
  };
  const rowVirtualizer = useVirtual({
    size: lines.length,
    parentRef,
    estimateSize: useCallback(getLineHeight, []),
  });

  function handleChange(e) {
    setTextEditorContent(e.target.value);    
  }

  function scrollToCursor() {
    const cursorLine = textareaRef.current
          ? textEditorContent.substr(0, textareaRef.current.selectionStart)
          .split('\n')
          .length
          : -1;
    if (textareaRef.current) {
      rowVirtualizer.scrollToIndex(cursorLine+1);
    }
  }

  function handleSelectionChange(e) {
    if (textareaRef.current) {
      const loc = {};
      loc.selectionStart = textareaRef.current.selectionStart;
      loc.selectionEnd = textareaRef.current.selectionEnd;
      setCursorLocation(loc);
      scrollToCursor();
    }
  }

  function handleInput(e) {
    // console.log("input!", e, e.target);
  }

  useEventListener('selectionchange', handleSelectionChange, document);

  return (
    <div
      ref={parentRef}
      className="texteditor"
      onClick={textareaRef.current ? () => textareaRef.current.focus() : () => {}}
      style={{
        border: textareaRef.current && textareaRef.current === document.activeElement ?
          '1px solid #FFFFFF22' : '',
      }}
    >
      <textarea
        ref={textareaRef}
        onChange={handleChange}
        onInput={handleInput}
        value={textEditorContent}
        autoFocus={true}
        wrap="hard">
      </textarea>
      <div
        className='texteditor-content'
        style={{
          minHeight: `${rowVirtualizer.totalSize}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.virtualItems.map(virtualRow => (
          <div
            key={virtualRow.index}
            ref={virtualRow.measureRef}
            style={{
              position: 'absolute',
              height: `${getLineHeight()}px`,
              width: 'auto',
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            {lines[virtualRow.index] || ' '}
          </div>
        ))}
      </div>
    </div>
  );
}

export default TextEditor;
