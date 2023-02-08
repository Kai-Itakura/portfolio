(()=>{

/*  TOP画像のアニメーション */
let $bubbleArea = document.querySelector('.bubble-area');

const createBubble = () => {
    //バブルを生成する
    let $bubble = document.createElement('span');
    $bubble.className = 'bubble';

    minSize = 10;
    maxSize = 40;

    //バブルの大きさをランダムで決める
    let bubbleSize = Math.random() * (maxSize - minSize) + minSize;

    $bubble.style.width = bubbleSize + "px";
    $bubble.style.height = bubbleSize + "px";

    //バブルが出始める位置をランデムで決める
    $bubble.style.left = Math.random() * 100 + "%";
    $bubble.style.bottom = Math.random() * 100 + "%";

    $bubbleArea.appendChild($bubble);

    //10秒後にバブルを消す
    setTimeout(() => {
        $bubble.remove();
    }, 8000);
} 

setInterval(createBubble, 80);

})();