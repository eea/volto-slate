import { nestContent } from '@plone/volto/helpers';
import { UPLOAD_CONTENT } from 'volto-slate/constants';

// A custom version of Volto's createContent that can take an "origin" block id
export function uploadContent(url, content, origin) {
  return {
    type: UPLOAD_CONTENT,
    origin,
    request: Array.isArray(content)
      ? content.map((item) => ({ op: 'post', path: url, data: item }))
      : { op: 'post', path: url, data: nestContent(content) },
  };
}
