export const backfaceFixed = (fixed: boolean) => {
  //表示されているスクロールバーとの差分を計測し、背面固定時はその差分body要素に余白を生成する
  const scrollbarWidth = window.innerWidth - document.body.clientWidth;
  document.body.style.paddingRight = fixed ? `${scrollbarWidth}px` : '';

  const scrollingElement = () => {
    const browser = window.navigator.userAgent.toLowerCase();
    if ('scrollingElement' in document) return document['scrollingElement'];
    if (browser.indexOf('webkit') > 0) return document['body'];
    return document['documentElement'];
  };

  const scrollY = fixed
    ? scrollingElement()?.scrollTop??0
    : parseInt(document.body.style.top || '0');

  document.body.style.left = fixed ?'0' : '';
  document.body.style.overflow = fixed ?'hidden' : '';
  document.body.style.position = fixed ?'fixed' : '';
  document.body.style.top = fixed ?`${scrollY * -1}px` : '';
  document.body.style.width = fixed ?'100vw' : '';

  if (!fixed) window.scrollTo(0, scrollY * -1);
};