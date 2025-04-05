import React, { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco'; // If you're using Monaco
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

function CollabEditor() {
  const { collabId } = useParams(); // Get the roomId from the URL
  console.log('collabId2: ', collabId);
  const editorRef = useRef(null);
  const ydocRef = useRef(null);
  const providerRef = useRef(null);
  const typeRef = useRef(null);

  useEffect(() => {
    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    // Replace 'your-room-name' with a unique name for your document
    const provider = new WebsocketProvider(
      'ws://localhost:3005', // The URL of your y-websocket server
      collabId,
      ydoc
    );
    providerRef.current = provider;
    const type = ydocRef.current.getText('monaco')
    typeRef.current = type;

    const yText = ydoc.getText('monaco'); // Or another Yjs type

    const editor = monaco.editor.create(document.getElementById('monaco-editor-container'), {
      value: '', // MonacoBinding overwrites this value with the content of type
      language: 'javascript',
      automaticLayout: true,
    })
    editorRef.current = editor;

    if (editorRef.current) {
      console.log('editorRef: ', editorRef);
      const monacoEditor = editorRef.current;
      const binding = new MonacoBinding(yText, monacoEditor.getModel(), new Set([monacoEditor]), provider.awareness);

      // return () => {
      //   binding.destroy();
      //   provider.disconnect();
      //   ydoc.destroy();
      // };
    }

    return () => {}; // Cleanup for initial render
  }, []);

  return (
    <div
      id="monaco-editor-container"
      style={{ width: '800px', height: '600px' }}
    />
  );
}

export default CollabEditor;
