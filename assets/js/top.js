(() => {
    /* headerの背景色変更 */
    const $header = document.querySelector('.header');

    window.addEventListener('scroll', () => {

        const $top = document.querySelector('#top');

        const getTopDistance = $top.getBoundingClientRect().bottom;

        if (getTopDistance < 300) {
            $header.classList.add('dark');
        } else {
            $header.classList.remove('dark');
        }
    });

    /* モーダルを開く */
    const $works = document.querySelector('#sixhelmets');
    const $modal = document.querySelector('#modal');
    const $body = document.querySelector('#body');

    $works.addEventListener('click', () => {
        $modal.classList.add('show');
        $body.classList.add('show');
    });

    /* モーダルを閉じる */
    const $closeBtn = document.querySelector('#modal-close');

    $closeBtn.addEventListener('click', () => {
        $modal.classList.remove('show');
        $body.classList.remove('show');
    });

    /* スキルのバーの表示 */
    const $percentage = document.querySelectorAll("[data-percentage]");
    const $skillNum = document.querySelectorAll("[data-num]");

    for (let i = 0; i < $percentage.length; i++) {

        //スクロールイベントを一度だけ実行するためのフラグ
        let flag = false;
        document.addEventListener('scroll', () => {

            //ウィンドウの上端から要素の下端までの距離
            const getElementDistance = $percentage[i].getBoundingClientRect().top + $percentage[i].clientHeight;

            //スキルバーが見えたら、実行する
            if (window.innerHeight > getElementDistance && flag !== true) {
                flag = true;

                //データ属性を取得
                const percentageVal = $percentage[i].dataset.percentage;
                const addStyle = () => {
                    $percentage[i].style.width = '' + count + '%';
                    $skillNum[i].innerHTML = '' + count + '%';
                }

                //０からデータ属性に指定した数になるまでcountを足していく
                let count = 0;
                const intervalId = setInterval(() => {
                    count++;
                    addStyle();
                    if (count >= percentageVal) {
                        clearInterval(intervalId);
                    }
                }, 20);
            }
        });
    }

    /* 要素が現れたら表示する */
    window.addEventListener('scroll', () => {
        const $targetImg = document.querySelectorAll('.js-hobby-image');

        for (let j = 0; j < $targetImg.length; j++) {
            const getTargetDistance = $targetImg[j].getBoundingClientRect().top + $targetImg[j].clientHeight * .3;

            if (window.innerHeight > getTargetDistance) {
                $targetImg[j].classList.add('active');
            }
        }
    });
})();