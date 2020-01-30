import React from 'react';
import styles from './index.module.scss';

export type IconType = 'scale' | 'stretch';

interface IProps {
  type: IconType;
  size?: number;
  color?: string;
  style?: any;
  className?: string;
  onClick?: () => void;
};

export default class Icon extends React.Component<IProps> {
  render() {
    const { type, size, color, style, className, ...restProps } = this.props;

    console.log(style)
    return (
      <i
        //@ts-ignore
        className={`${styles['iconfont']} ${styles[`icon-${type}`]} ${className || ''}`} 
        style={{
          color: color || '#333',
          fontSize: size || 16,
          ...style
        }}
        {...restProps}
      />
    );
  }
};
