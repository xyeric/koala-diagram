import fs from 'fs';
import React from 'react';
import mermaid from 'mermaid';
import { connect } from 'react-redux';
import { remote, ipcRenderer } from 'electron';
import { FileFormat, ISaveIpcOptions } from '../../../common/types';
import { svg2ImgBuffer } from '../../utils/index';
import Icon from '../icon';
import { iRootState, Dispatch } from '../../store';
import { GraphLayout, GraphThemeColor } from '../../store/app';
import Theme from './theme';

import koalaImg from '../../images/koala.png';
import styles from './index.module.scss';

const mapState = (state: iRootState) => ({
  app: state.app,
});

const mapDispatch = (dispatch: Dispatch) => ({
  setThemeColor: dispatch.app.setThemeColor,
  setGraphLayout: dispatch.app.setGraphLayout,
});

type Props = ReturnType<typeof mapState> & ReturnType<typeof mapDispatch>;

class GraphPanel extends React.Component<Props> {
  state = {
    svgCode: '',
  };

  componentDidMount() {
    const { themeColor } = this.props.app;

    mermaid.mermaidAPI.initialize({
      startOnLoad:false,
      theme: 'default',
      useMaxWidth: true,
      themeCSS: Theme.render({ themeColor }),
    } as any);

    this.bindSaveEvent();
  }

  componentWillReceiveProps(nextProps: Props) {
    const sourceCode = nextProps.app.sourceCode;
    if (sourceCode !== this.props.app.sourceCode) {
      this.renderGraphCode(sourceCode);
    }
  }

  bindSaveEvent() {
    ipcRenderer.on('save-diagram', async (e, opts: ISaveIpcOptions) => {
      const { format } = opts || { format: FileFormat.MERM };
      const parent = remote.getCurrentWindow();
      const { canceled, filePath } = await remote.dialog.showSaveDialog(parent, {
        filters: [{
          name: format,
          extensions: [format]
        }]
      });

      if (canceled) return;

      let content: any;

      if (format === FileFormat.MERM) {
        content = this.props.app.sourceCode;
      } else if (format === FileFormat.SVG) {
        content = this.state.svgCode;
      } else {
        content = await svg2ImgBuffer(this.state.svgCode, { format });
      }

      fs.writeFileSync(filePath, content);
    });
  }

  renderGraphCode(sourceCode: string) {
    try {
      mermaid.mermaidAPI.parse(sourceCode);
      mermaid.mermaidAPI.render(`svg_${Date.now()}`, sourceCode, (svgCode: string) => {
        // purpose: fix svg width attribute, when content overflow, should scroll rather than scale
        if (/<svg[^>]*?>/.test(svgCode)) {
          let width: number;
          const matched = /viewBox="\s?\d+\s+\d+\s+(\d+)\s+\d+\s?"/.exec(svgCode);
          if (matched && matched[1]) {
            width = parseInt(matched[1], 10);
          }
          svgCode = svgCode.replace(/<svg[^>]*?>/, (...args) => {
            let ret = args[0] && args[0].replace('max-width', 'width'); // for sequenece diagram and etc.
            if (width) {
              ret = ret.replace(/width="?100%"?/, `width="${width}"`); // for gantt and pie chart and etc.
            }
            return ret;
          });
        }
        this.setState({ svgCode });
      });
    } catch (err) {
      console.log('parse error', err);
    }
  }

  setThemeColor(themeColor: GraphThemeColor) {
    mermaid.mermaidAPI.initialize({
      startOnLoad:false,
      theme: 'default',
      useMaxWidth: true,
      themeCSS: Theme.render({ themeColor }),
    } as any);

    const sourceCode = this.props.app.sourceCode;
    if (sourceCode) {
      this.renderGraphCode(sourceCode);
    }

    this.props.setThemeColor(themeColor);
  }

  handleOpenDocs = () => {
    remote.shell.openExternal('https://github.com/xyeric/koala-diagram');
  }

  get TOOLBAR_GRAPH_LAYOUT() {
    const { graphLayout } = this.props.app;

    const configs = [
      GraphLayout.STRETCH,
      GraphLayout.SCALE
    ].map(layout => ({
      layout,
      onClick: () => {
        this.props.setGraphLayout(layout);
      }
    }));

    return (
      <div className={styles['graph-toolbar__layout']}>
        {configs.map(({ layout, onClick }) => (
          <Icon
            type={layout}
            key={layout}
            className={`
              ${styles['graph-toolbar__layout_button']}
              ${graphLayout === layout ? styles['graph-toolbar__layout_button-active'] : ''}
            `}
            onClick={onClick}
          />
        ))}
      </div>
    )
  }

  get TOOLBAR_THEME_LIST() {
    const { themeColor } = this.props.app;

    const configs = [
      GraphThemeColor.DEFAULT,
      GraphThemeColor.BLUE,
      GraphThemeColor.PURPLE,
      GraphThemeColor.GREEN
    ].map((themeColor) => ({
      themeColor,
      onClick: () => {
        this.setThemeColor(themeColor);
      }
    }));
  
    return (
      <div className={styles['graph-toolbar__theme-list']}>
        {configs.map((item: any, index: number) => (
          <div
            key={index}
            className={styles['graph-toolbar__theme-item']}
            style={{
              backgroundColor: item.themeColor,
              boxShadow: themeColor === item.themeColor ? `0 0 2px 1px ${item.themeColor}` : 'none',
            }}
            onClick={item.onClick}
          >
          </div>
        ))}
      </div>
    );
  }

  render() {
    const { svgCode } = this.state;
    const { sourceCode, graphLayout } = this.props.app;

    return sourceCode && svgCode ? (
      <div className={styles['graph-container']}>
        {!/^\S*(gantt|pie)/.test(sourceCode) ? (
          <div className={styles['graph-toolbar']}>
            {this.TOOLBAR_GRAPH_LAYOUT}
            {this.TOOLBAR_THEME_LIST}
          </div>
        ) : null}
        <div
          className={`
            ${styles['graph-layout']}
            ${graphLayout === GraphLayout.STRETCH ? styles['graph-layout-stretch'] : styles['graph-layout-scale']}
          `}
          dangerouslySetInnerHTML={{__html: svgCode }}
        />
      </div>
    ) : (
      <div className={styles['guide-container']}>
        <img className={styles['guide__logo']} src={koalaImg} />
        <div className={styles['guide__title']}>Koala Diagram</div>
        <a href="#" onClick={this.handleOpenDocs} className={styles['guide__text']}>read docs</a>
      </div>
    );
  }
};

export default connect(
  mapState,
  mapDispatch
)(GraphPanel);
