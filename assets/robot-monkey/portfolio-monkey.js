import { mountRobotMonkey } from './robot-monkey.js?v=scroll-motion';
import { followPortfolioScroll } from './monkey-scroll.js?v=scroll-motion';

const host = document.getElementById('dasom-monkey-3d');
if (host) {
  followPortfolioScroll(host);
  window.robotMonkeyReady = mountRobotMonkey(host, {
    zoom: .85,
    randomMotions: ['wave', 'eat', 'scratch']
  }).then(api => {
    window.robotMonkey = api;
    return api;
  }).catch(error => {
    console.error('[Robot Monkey v53]', error);
    host.setAttribute('aria-label', '원숭이 모델을 불러오지 못했습니다. 파일 경로를 확인해 주세요.');
  });
}
