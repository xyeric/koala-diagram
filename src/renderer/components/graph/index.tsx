import fs from 'fs';
import React from 'react';
import mermaid from 'mermaid';
import { connect } from 'react-redux';
import { remote, ipcRenderer } from 'electron';
import { FileFormat, ISaveIpcOptions } from '../../../common/types';
import { svg2ImgBuffer } from '../../utils/index';
import { iRootState, Dispatch } from '../../store';
import Theme, {
  ThemeRenderOptions,
  DEFAULT_THEME_COLOR,
  BLUE_THEME_COLOR,
  PURPLE_THEME_COLOR,
  GREEN_THEME_COLOR
} from './theme';

import styles from './index.module.scss';

mermaid.mermaidAPI.initialize({
  startOnLoad:false,
  theme: 'neutral',
  themeCSS: Theme.render({
    themeColor: DEFAULT_THEME_COLOR,
  })
} as any);

const mapState = (state: iRootState) => ({
  app: state.app,
});

const mapDispatch = (dispatch: Dispatch) => ({
  setSvgCode: dispatch.app.setSvgCode,
  setSourceCode: dispatch.app.setSourceCode,
});

type Props = ReturnType<typeof mapState> & ReturnType<typeof mapDispatch>;

class GraphPanel extends React.Component<Props> {
  state = {
    svgCode: '',
  };

  componentDidMount() {
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

  setGraphThemeConfig(config: ThemeRenderOptions) {
    mermaid.mermaidAPI.initialize({
      startOnLoad:false,
      theme: 'default',
      useMaxWidth: true,
      themeCSS: Theme.render({
        themeColor: config.themeColor,
      }),
    } as any);

    const sourceCode = this.props.app.sourceCode;
    if (sourceCode) {
      this.renderGraphCode(sourceCode);
    }
  }

  get THEME_BUTTONS() {
    const buttons = [
      {
        backgroundColor: DEFAULT_THEME_COLOR,
        onClick: () => {
          this.setGraphThemeConfig({
            themeColor: DEFAULT_THEME_COLOR,
          });
        }
      },
      {
        backgroundColor: BLUE_THEME_COLOR,
        onClick: () => {
          this.setGraphThemeConfig({
            themeColor: BLUE_THEME_COLOR,
          });
        }
      },
      {
        backgroundColor: PURPLE_THEME_COLOR,
        onClick: () => {
          this.setGraphThemeConfig({
            themeColor: PURPLE_THEME_COLOR,
          });
        }
      },
      {
        backgroundColor: GREEN_THEME_COLOR,
        onClick: () => {
          this.setGraphThemeConfig({
            themeColor: GREEN_THEME_COLOR,
          });
        }
      }
    ];

    return buttons;
  }

  render() {
    const { svgCode } = this.state;
    const { sourceCode } = this.props.app;

    return sourceCode && svgCode ? (
      <div className={styles['graph-container']}>
        <div className={styles['graph-toolbar']}>
          {!/^\S*(gantt|pie)/.test(sourceCode) ? (
            <div className={styles['graph-toolbar__theme-list']}>
              {this.THEME_BUTTONS.map((item: any, index: number) => (
                <div
                  key={index}
                  className={styles['graph-toolbar__theme-item']}
                  style={{
                    backgroundColor: item.backgroundColor
                  }}
                  onClick={item.onClick}
                >
                </div>
              ))}
            </div>
          ) : null}
        </div>
        <div className={styles['graph-wrapper']}>
          <div className={styles['graph-scroller']} dangerouslySetInnerHTML={{__html: svgCode }}></div>
        </div>
      </div>
    ) : null;
  }
};

export default connect(
  mapState,
  mapDispatch
)(GraphPanel);
