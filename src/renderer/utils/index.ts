import queryString from 'query-string';
import { IWindowUrlParams } from '../../common/types';

export function parseUrlParams(): IWindowUrlParams {
  return queryString.parse(location.search);
}

export function formatDocTitle(fileName: string): string {
  return `Koala Diagram - ${fileName.split('.')[0]}`;
}
