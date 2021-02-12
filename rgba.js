function RGBA(mainCode, props) {

    // shaders
    let config = prepareConfig(props);
    let canvas = config.target || document.createElement('canvas');
    let gl = this.gl = canvas.getContext("webgl");
    let program = gl.createProgram();
    [config.vertexShader, config.fragmentShader].forEach(createShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    // uniforms
    let frameCallbacks = config.frame ? [config.frame] : [];
    Object.keys(config.uniforms).forEach(handleUniform);
    handleTextures();

    // vertices
    let triangle = new Float32Array([-1, 3, -1, -1, 3, -1]);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, triangle, gl.STATIC_DRAW);
    let vert = gl.getAttribLocation(program, "vert");
    gl.vertexAttribPointer(vert, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vert);

    const handleSize = () => {
        const w = canvas.clientWidth | 0;
        const h = canvas.clientHeight | 0;
        if (config.size[0] === w && config.size[1] === h)
            return;
        config.size = [canvas.width = w, canvas.height = h];
        config.width = canvas.width = w;
        config.height = canvas.height = h;
        gl.viewport(0, 0, ...config.size);
        this.resolution(config.size);
    }

    if (!config.target) {
        document.body.appendChild(canvas);
        if (false === config.fullscreen)
            return
        canvas.style.width = '100vw';
        canvas.style.height = '100vh';
        document.body.style.margin = '0';
        document.body.style.overflow = 'hidden';
    }

    if (false !== config.loop) {
        const drawFrame = t => {
            handleSize();
            this.time(t/1000);
            frameCallbacks.forEach(cb => cb(t));
            gl.drawArrays(gl.TRIANGLES, 0, 3);
            window.capturer && window.capturer.capture(canvas);
            requestAnimationFrame(drawFrame);
        };
        requestAnimationFrame(drawFrame);
    } else {
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    function detectUniformType(uf, cfg) {
        let name = cfg.uniforms[uf];
        let isFunc = typeof name === 'function';
        if (isFunc)
            name = (Array.isArray(name(0)) ? name(0).length : 1) + 'f';
        return {name, isFunc, isArray: '1f' !== name}
    }

    function handleUniform(uf) {
        let loc = gl.getUniformLocation(program, uf);
        let type = detectUniformType(uf, config);
        let setter = gl[`uniform${type.name}`];
        this[uf] = type.isArray ?
            v => setter.call(gl, loc, ...v) :
            v => setter.call(gl, loc, v);
        if (!type.isFunc)
            return
        let val;
        frameCallbacks.push(t => {
            let newVal = config.uniforms[uf](val, t);
            this[uf](val = newVal); // todo compare values
        });
        this[uf](val = config.uniforms[uf](0));
    }

    function svgSupport(url) {
        if(url.indexOf('svg') > -1) {
            if (url.indexOf('xmlns') === -1)
                url = url.split('<svg ').join(`<svg xmlns="http://www.w3.org/2000/svg" `)
            return "data:image/svg+xml;base64," + btoa(url);
        }
        return url
    }

    function createTexture(index, image) {
        let texture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0 + index);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }

    function createFragmentShader(cfg) {
        cfg.fragmentShader = '\n' + Object.keys(cfg.uniforms).map(uf => {
            let type = detectUniformType(uf, cfg).name[0];
            return `uniform ${type - 1 ? 'vec' + type : 'float'} ${uf};`;
        }).join('\n') + '\n';
        if (cfg.textures && cfg.textures.length)
            cfg.fragmentShader += `\nuniform sampler2D tex[${cfg.textures.length}];\n`;
        cfg.fragmentShader += cfg.mainCode;
    }

    function prepareConfig(props) {
        let cfg = props || {};
        cfg.size = cfg.size || [0,0]
        cfg.mainCode = mainCode;
        cfg.uniforms = cfg.uniforms || {};
        cfg.uniforms.time = '1f';
        cfg.uniforms.resolution = '2f';
        cfg.vertexShader = cfg.vertexShader ||
            `attribute vec2 vert;\nvoid main(void) { gl_Position = vec4(vert, 0.0, 1.0);}`;
        if (cfg.mainCode.indexOf('void main()') === -1 && cfg.mainCode.indexOf('void main(void)') === -1)
            cfg.mainCode = `\nvoid main() {\n${cfg.mainCode}\n}`;
        if (!cfg.fragmentShader)
            createFragmentShader(cfg);
        if (cfg.fragmentShader.trim().indexOf('precision') !== 0)
            cfg.fragmentShader = `precision ${cfg.precision || 'highp'} float;\n` + cfg.fragmentShader;
        return cfg
    }

    function createShader(src, i) {
        let id = gl.createShader(i ? gl.FRAGMENT_SHADER : gl.VERTEX_SHADER);
        gl.shaderSource(id, src);
        gl.compileShader(id);
        let message = gl.getShaderInfoLog(id);
        if (message || config.debug)
            src.split('\n').map((line,i) => print(line, i, message))
        if (message)
            throw message;
        gl.attachShader(program, id);
    }

    function print(str, i, message) {
        if (!config.log) {
            config.log = document.createElement('div');
            config.log.style.fontFamily = 'Courier New, monospace';
            document.body.append(config.log);
            canvas.remove();
        }
        let line = 1 + i;
        let currentLine = line === +message.split(':')[2];
        let msg = ("" + line).padStart(4, "0") + ': ' + str.split(' ').join('&nbsp;');
        if (currentLine) msg = '<br>' + message + '<br>' + msg + '<br><br>';
        config.log.innerHTML += `<div ${currentLine && 'style="background:#900;color:#fff"'}>${msg}</div>`

    }

    function handleTextures() {
        if (!config.textures)
            return

        gl.uniform1iv(
            gl.getUniformLocation(program, 'tex'),
            config.textures.map((_,i) => i));

        config.textures.forEach((source, index) => {
            if (typeof source === "string") {
                let loader = new Image();
                loader.crossOrigin = "anonymous";
                loader.src = svgSupport(source);
                loader.onload = () => createTexture(index, loader);
            } else {
                createTexture(index, source)
            }
        });
    }
}