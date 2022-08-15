import content from '../data/content.js';
const defaultCtrl = (app) => (params) => {
  document.body.className = document.body.className.replace(/page-.*?(\W|$)/g, '') + ' page-default';
  return {content}
}
export {defaultCtrl};