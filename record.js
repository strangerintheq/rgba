(function (){

    const script = document.createElement('script');
    script.setAttribute('src','https://raw.githack.com/spite/ccapture.js/master/build/CCapture.all.min.js');
    document.body.append(script);

    document.body.innerHTML += `
        <button id="recButton" style="position:fixed; top:5px; right:5px">REC</button>
    `;

    const recButton = document.querySelector('#recButton');
    recButton.onclick = () => window.capturer ? stopRec() : startRec();

    function startRec() {
        window.capturer = new CCapture( {
            framerate: 60,
            format: 'webm'
        });
        capturer.start();
        recButton.innerHTML =  'STOP'
    }

    function stopRec(){
        capturer.stop();
        capturer.save(blob => {
            let a = document.createElement("a");
            let url = URL.createObjectURL(blob);
            a.href = url;
            a.download = 'video.webm';
            a.click();
            URL.revokeObjectURL(url);
            window.capturer = null;
            recButton.innerHTML = 'REC'
        });
    }

})();