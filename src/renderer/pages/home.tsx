import React from 'react';
import mermaid from 'mermaid';
import CodeEditor from '../components/editor';
import GraphPanel from '../components/graph';

import styles from './index.module.scss';

mermaid.mermaidAPI.initialize({
  startOnLoad:false,
  theme: 'neutral',
});

export default class HomeContainer extends React.Component {
  render() {
    return (
      <div className={styles['app-container']}>
        <div className={styles['app-left-side']}>
          <CodeEditor />
        </div>
        <div className={styles['app-right-side']}>
          <GraphPanel />
        </div>
      </div>
    )
  }
};
