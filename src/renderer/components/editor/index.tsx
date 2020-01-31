import React  from 'react';
import { remote } from 'electron';
import { editor } from 'monaco-editor';
import { connect } from 'react-redux';
import { iRootState, Dispatch } from '../../store';

import styles from './index.module.scss';

const mapState = (state: iRootState) => ({
  app: state.app,
});

const mapDispatch = (dispatch: Dispatch) => ({
  setSvgCode: dispatch.app.setSvgCode,
  setSourceCode: dispatch.app.setSourceCode,
  markContentChanged: dispatch.app.markContentChanged,
});

type Props = ReturnType<typeof mapState> & ReturnType<typeof mapDispatch>;

class CodeEditor extends React.Component<Props> {
  state = {
    widthPercent: 0.4,
    width: window.innerWidth * 0.4,
  };

  editor: editor.IStandaloneCodeEditor;

  containerRef: React.RefObject<HTMLDivElement> = null;
  editorRef: React.RefObject<HTMLDivElement> = null;
  resizerRef: React.RefObject<HTMLDivElement> = null;

  constructor(props: any) {
    super(props);

    this.containerRef = React.createRef<HTMLDivElement>();
    this.editorRef = React.createRef<HTMLDivElement>();
    this.resizerRef = React.createRef<HTMLDivElement>();
  }

  componentDidMount() {
    this.initEditor();
    this.initResizer();
  }

  initEditor() {
    this.editor = editor.create(this.editorRef.current, {
      value: '',
      language: 'yaml',
      lineNumbers: 'off',
      theme: 'vs-light',
      overviewRulerLanes: 0,
      cursorWidth: 1,
      scrollbar: {
        vertical: 'hidden',
        horizontal: 'hidden'
      },
      minimap: {
        enabled: false
      }
    });

    remote.nativeTheme.on('updated', () => {
      const theme = remote.nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
      const editorTheme = theme === 'dark' ? 'vs-dark' : 'vs-light';
      editor.setTheme(editorTheme);
    });

    window.addEventListener('resize', () => {
      this.setState({
        width: window.innerWidth * this.state.widthPercent,
      });
      this.editor.layout();
    });

    // wait for state data ready
    setTimeout(() => {
      const { sourceCode } = this.props.app;
      if (sourceCode) {
        this.editor.setValue(sourceCode);
      }

      this.editor.onDidChangeModelContent(() => {
        if (!this.props.app.contentChanged) {
          this.props.markContentChanged();
        }
        this.props.setSourceCode(this.editor.getValue());
      });
    }, 100);
  }

  initResizer() {
    let offsetX = 0;
    const mouseMoveListener = (e: MouseEvent) => {
      const width = e.clientX - offsetX;
      if (width >= 15) {
        const widthPercent = width / window.innerWidth;
        this.setState({ width, widthPercent });
        this.editor.layout();
      }
    };

    const mouseUpListener = (e: MouseEvent) => {
      offsetX = 0;
      document.removeEventListener('mousemove', mouseMoveListener);
      document.removeEventListener('mouseup', mouseUpListener);
    };

    const resizer = this.resizerRef.current;
    resizer.addEventListener('mousedown', (e: MouseEvent) => {
      const containerEl = this.containerRef.current;
      const editorWidth = parseInt(window.getComputedStyle(containerEl).width, 10);
      offsetX = e.clientX - editorWidth;
      document.addEventListener('mousemove', mouseMoveListener);
      document.addEventListener('mouseup', mouseUpListener);
    });

    window.addEventListener('resize', () => {
      this.editor.layout();
    });
  }

  render() {
    return (
      <div ref={this.containerRef} className={styles['editor-container']} style={{ width: this.state.width }}>
        <div ref={this.editorRef} className={styles['editor-wrapper']}></div>
        <div ref={this.resizerRef} className={styles['editor-resizer']}></div>
      </div>
    );
  }
};

export default connect(
  mapState,
  mapDispatch
)(CodeEditor);
