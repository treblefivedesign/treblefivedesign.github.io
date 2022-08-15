import content from '../data/content.js';
const creatorsCtrl = (app) => (params) => {
  document.body.className = document.body.className.replace(/page-.*?(\W|$)/g, '') + ' page-creators';
  return {content}
}
export {creatorsCtrl};
