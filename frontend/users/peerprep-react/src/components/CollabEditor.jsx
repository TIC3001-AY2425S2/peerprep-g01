import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { yCollab } from 'y-codemirror.next';
import { EditorView, basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { EditorState } from '@codemirror/state';
import { jwtDecode } from "jwt-decode";

function CollabEditor() {
  const { collabId } = useParams();
  const editorRef = useRef(null);
  const [provider, setProvider] = useState(null);
  const [users, setUsers] = useState([]);
  
  const token = localStorage.getItem('token')
  const tokenDecoded = jwtDecode(token);

  useEffect(() => {
    if (!provider){
      return;
    }
    console.log('provider: ', provider)
    const updateUsers = () => {
      console
      const states = Array.from(provider.awareness.getStates().values());
      setUsers(states.map(s => s.user).filter(Boolean));
      console.log('users: ', users);
    };
  
    provider.awareness.on('change', updateUsers);
    updateUsers(); // Initial load
  
    return () => {
      provider.awareness.off('change', updateUsers);
    };
  }, [provider]);

  useEffect(() => {
    const ydoc = new Y.Doc();
    const provider = new WebsocketProvider('ws://localhost:3005', collabId, ydoc);
    setProvider(provider);
    const yText = ydoc.getText('codemirror');

    const awareness = provider.awareness;

    // Set local awareness (name & color)
    awareness.setLocalStateField('user', {
      name: tokenDecoded.username,
      color: `hsl(${Math.random() * 360}, 100%, 70%)`
    });

    const state = EditorState.create({
      extensions: [
        basicSetup,
        javascript(),
        yCollab(yText, awareness, {
          awarenessField: 'user' // default, but explicit
        })
      ]
    });

    const view = new EditorView({
      state,
      parent: document.getElementById('codemirror-editor-container')
    });

    editorRef.current = view;

    return () => {
      view.destroy();
      provider.destroy();
      ydoc.destroy();
    };
  }, []);

  return (
    <div className="editor-container">
        <div className="user-list">
          {users.map((user, index) => (
            <div key={index} className="user-badge" title={user.name}>
              <div
                className="user-color"
                style={{ backgroundColor: user.color }}
              />
              <span>{user.name}</span>
            </div>
          ))}
        </div>

        <div
          id="codemirror-editor-container"
          className="editor-wrapper"
        />
    </div>
  );
}

export default CollabEditor;
