// スクロール位置を保持するための変数
let scrollPosition = 0;

export const backfaceFixed = (fixed: boolean) => {
  // Safari/iOS Safari の検出
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  
  if (fixed) {
    // モーダルを開く時
    // 現在のスクロール位置を保存
    scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    
    // スクロールバー幅を計測
    const scrollbarWidth = window.innerWidth - document.body.clientWidth;
    
    // Safari/iOS 用の特別処理
    if (isSafari || isIOS) {
      // body を固定し、現在のスクロール位置を top で相殺
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollPosition}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
      document.body.style.overflowY = 'scroll'; // iOS Safari でのバウンス防止
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      
      // html要素にもスタイルを適用（iOS Safari の二重対策）
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.height = '100%';
    } else {
      // その他のブラウザ（PC）用
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollPosition}px`;
      document.body.style.left = '0';
      document.body.style.overflow = 'hidden';
      document.body.style.width = '100vw';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
  } else {
    // モーダルを閉じる時
    if (isSafari || isIOS) {
      // Safari/iOS 用のクリーンアップ
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      document.body.style.overflowY = '';
      document.body.style.paddingRight = '';
      
      document.documentElement.style.overflow = '';
      document.documentElement.style.height = '';
      
      // スクロール位置を復元（iOS Safari ではスムーズスクロールを無効化）
      window.scrollTo({
        top: scrollPosition,
        behavior: 'auto' // Safari では 'auto' を使用
      });
    } else {
      // その他のブラウザ用のクリーンアップ
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.overflow = '';
      document.body.style.width = '';
      document.body.style.paddingRight = '';
      
      // スクロール位置を復元
      window.scrollTo(0, scrollPosition);
    }
    
    // 保存した位置をリセット
    scrollPosition = 0;
  }
};