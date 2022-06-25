import {TurboMini} from './libs/turbomini.js';
import {defaultCtrl} from './components/default.js';
window.app = TurboMini();
(await app.run(async app => {
  app.errorHandler = (error) => console.log(error);
  app.useHash = true;
  await app.fetchTemplates(['default']);
  app.controller('default', defaultCtrl(app));
})).start();