import React from 'react';
import { connect } from 'react-redux';
import { remote } from 'electron';
import { Transition } from 'react-transition-group';
import { parseToSvgCode, setThemeColor } from '../../lib/graph';
import { GraphThemeColor } from '../../lib/theme';
import { iRootState, Dispatch } from '../../store';
import { GraphLayout } from '../../store/diagram';
import Icon from '../icon';

import koalaImg from '../../images/koala.png';
import styles from './index.module.scss';

const mapState = (state: iRootState) => ({
  app: state.app,
  diagram: state.diagram,
});

const mapDispatch = (dispatch: Dispatch) => ({
  setThemeColor: dispatch.diagram.setThemeColor,
  setGraphLayout: dispatch.diagram.setGraphLayout,
});

type Props = ReturnType<typeof mapState> & ReturnType<typeof mapDispatch>;

class GraphPanel extends React.Component<Props> {
  state = {
    svgCode: '',
    showGuide: false,
  };

  async componentDidMount() {
    const { sourceCode, themeColor } = this.props.diagram;

    this.setState({ showGuide: true });

    setThemeColor(themeColor);

    if (sourceCode) {
      const svgCode = await parseToSvgCode(sourceCode);
      this.setState({ svgCode });
    }
  }

  async componentWillReceiveProps(nextProps: Props) {
    const { sourceCode, themeColor } = nextProps.diagram;
    if (sourceCode && sourceCode !== this.props.diagram.sourceCode) {
      const svgCode = await parseToSvgCode(sourceCode);
      this.setState({ svgCode });
    }
  }

  async setThemeColor(themeColor: GraphThemeColor) {
    const sourceCode = this.props.diagram.sourceCode;

    setThemeColor(themeColor);
    this.props.setThemeColor(themeColor);

    const svgCode = await parseToSvgCode(sourceCode);
    this.setState({ svgCode });
  }

  handleOpenDocs = () => {
    remote.shell.openExternal('https://github.com/xyeric/koala-diagram/tree/master/docs');
  }

  get TOOLBAR_GRAPH_LAYOUT() {
    const { graphLayout } = this.props.diagram;

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
    const { themeColor } = this.props.diagram;

    const configs = [
      GraphThemeColor.DEFAULT,
      GraphThemeColor.ORANGE,
      GraphThemeColor.RED,
      GraphThemeColor.BLUE,
      GraphThemeColor.PURPLE,
      GraphThemeColor.DARK
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
    const { app, diagram } = this.props;

    return svgCode ? (
      <div className={styles['graph-container']}>
        {!/^\S*(gantt|pie)/.test(diagram.sourceCode) ? (
          <div className={styles['graph-toolbar']}>
            {this.TOOLBAR_GRAPH_LAYOUT}
            {this.TOOLBAR_THEME_LIST}
          </div>
        ) : null}
        <div
          className={`
            ${styles['graph-layout']}
            ${diagram.graphLayout === GraphLayout.STRETCH ? styles['graph-layout-stretch'] : styles['graph-layout-scale']}
          `}
          dangerouslySetInnerHTML={{__html: svgCode }}
        />
      </div>
    ) : (
      <Transition in={!diagram.sourceCode && this.state.showGuide} timeout={0}>
        {state => (
          // @ts-ignore
          <div className={`${styles['guide-container']} ${styles[`transition__fade-${state}`]}`}>
            <img className={styles['guide__logo']} src={koalaImg} />
            <div className={styles['guide__title']}>{app.name}</div>
            <div className={styles['guide__version']}>{app.version}</div>
            <a href="#" onClick={this.handleOpenDocs} className={styles['guide__text']}>documents</a>
          </div>
        )}
      </Transition>
    );
  }
};

export default connect(
  mapState,
  mapDispatch
)(GraphPanel);
