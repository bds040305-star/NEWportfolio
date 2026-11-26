const lines = {
  welcome: ['안녕! 다솜의 작업실을 안내할게요.', '방금 동작 봤어요? 스크롤하면 같이 따라갈게요.', 'happy'],
  contents: ['목차에서 궁금한 페이지를 펼쳐봐요.', '책처럼 넘기면서 다솜이 써 온 도구와 경험을 볼 수 있어요.', 'love'],
  keywords: ['다솜은 사용자 흐름을 설계하고, 화면을 디자인해 직접 움직이게 만들어요.', '저는 ‘Interaction’이 좋아요. 움직일 때 제일 신나거든요!', 'surprised'],
  skillsRelief: ['휴~', '휴~', 'surprised'],
  projects: ['이제 프로젝트를 구경할 차례예요.', '카드를 열면 결과물과 그 뒤의 고민도 볼 수 있어요.', 'happy']
};

export function createMonkeyDialogue(host) {
  const bubble = document.createElement('p');
  bubble.className = 'monkey-guide-dialogue';
  bubble.setAttribute('role', 'status');
  bubble.hidden = true;
  document.body.append(bubble);

  let scene;
  let pending;
  let expiry;
  function hide() {
    clearTimeout(pending);
    clearTimeout(expiry);
    bubble.hidden = true;
  }

  function show(text) {
    bubble.textContent = text;
    bubble.hidden = false;
    clearTimeout(expiry);
    if (scene !== 'keywords' && scene !== 'skillsRelief') expiry = setTimeout(hide, 4800);
  }

  host.addEventListener('robot-monkey-interact', () => {
    if (!scene) return;
    clearTimeout(pending);
    show(lines[scene][1]);
  });

  return (nextScene, x, y, scale) => {
    if (nextScene) {
      bubble.style.setProperty('--dialogue-x', `${x * 100}vw`);
      bubble.style.setProperty('--dialogue-y', `${y - host.clientHeight * scale * .31}px`);
    }
    if (scene === nextScene) return;
    if (scene === 'skillsRelief' && host.dataset.expression === 'surprised') host.robotMonkey?.setExpression('neutral');
    scene = nextScene;
    hide();
    if (!scene) return;
    const [text, , expression] = lines[scene];
    pending = setTimeout(() => {
      const model = host.robotMonkey;
      if (!model) return;
      if (['idle', 'walk'].includes(host.dataset.motion)) {
        model.setExpression(expression, { duration: scene === 'skillsRelief' ? 0 : 1700 });
      }
      show(text);
    }, 240);
  };
}
