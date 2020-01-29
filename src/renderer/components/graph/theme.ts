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

export const DEFAULT_THEME_COLOR = '#57606f';
export const BLUE_THEME_COLOR = '#00a8ff';
export const PURPLE_THEME_COLOR = '#5352ed';
export const GREEN_THEME_COLOR = '#05c46b';

export const DEFAULT_NOTE_COLOR = '#fbc531';

export function render(opts?: ThemeRenderOptions) {
  opts = opts || {};
  return template.replace(/\{\{themeColor\}\}/g, opts.themeColor || DEFAULT_THEME_COLOR)
  .replace(/\{\{noteColor\}\}/g, opts.noteColor || DEFAULT_NOTE_COLOR);
}

export default { render };