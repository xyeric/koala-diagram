export enum GraphThemeColor {
  DEFAULT = '#1DD1A1',
  ORANGE = '#ff9f43',
  RED = '#ff6b6b',
  BLUE = '#54a0ff',
  PURPLE = '#5f27cd',
  DARK = '#576574',
}

const template = `
.edgeLabel {
  color: #666;
  fill: #666;
  background-color: #fff;
}
.edgePath .path {
  stroke: #999;
  stroke-width: 1;
}
.node .label {
  color: #fff;
  fill: #fff;
}
.node rect,
.node circle,
.node ellipse,
.node polygon,
.node path {
  fill: {{themeColor}};
  stroke: none;
}
.cluster rect {
  fill: #ddd;
  stroke: none;
}

.classLabel .label {
  fill: {{themeColor}};
}
g.classGroup rect {
  fill: {{themeColor}}19;
  stroke: {{themeColor}};
}
g.classGroup line {
  stroke: {{themeColor}};
}
g.classGroup text .title {
  fill: {{themeColor}};
}
.relation {
  stroke: {{themeColor}};
}
#compositionStart,
#compositionEnd,
#dependencyStart,
#dependencyEnd,
#extensionStart,
#extensionEnd {
  fill: {{themeColor}};
  stroke: {{themeColor}};
}
#aggregationStart,
#aggregationEnd {
  fill: {{themeColor}}19;
  stroke: {{themeColor}};
}

g.stateGroup rect {
  fill: {{themeColor}}19;
  stroke: {{themeColor}};
}
g.stateGroup .state-title {
  fill: {{themeColor}};
}
.transition {
  stroke: {{themeColor}};
}
.actor {
  stroke: none;
  fill: {{themeColor}};
  min-width: 150px;
}
.actor-line {
  stroke: #999;
  stroke-width: 1;
}
.labelBox {
  fill: {{themeColor}};
  stroke: none;
}
.labelText {
  fill: #fff;
}
.loopText {
  fill: #666;
}
.loopLine {
  stroke: {{themeColor}};
  stroke-width: 1;
}
.messageLine0 {
  stroke: #999;
  stroke-width: 1;
}
.messageLine1 {
  stroke: #999;
  stroke-width: 1;
}
.messageText {
  fill: #666;
}
text.actor {
  fill: #fff;
}
.note {
  fill: {{noteColor}};
  stroke: none;
}
.noteText {
  fill: #fff;
}
#arrowhead {
  fill: #999;
}
`;

export type DiagramType = 'sequence';

export interface ThemeRenderOptions {
  themeColor?: string;
  noteColor?: string;
}

export const DEFAULT_NOTE_COLOR = '#fbc531';

export function renderTheme(opts?: ThemeRenderOptions) {
  opts = opts || {};
  return template.replace(/\{\{themeColor\}\}/g, opts.themeColor || GraphThemeColor.DEFAULT)
  .replace(/\{\{noteColor\}\}/g, opts.noteColor || DEFAULT_NOTE_COLOR);
}

export default { renderTheme };
