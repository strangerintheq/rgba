function RGBA(mainCode, props) {

    let config = props || {};
    config.mainCode = mainCode;
    let canvas = config.target || document.createElement('canvas');
    let gl = this.gl = canvas.getContext("webgl");
    let program = gl.createProgram();

    config.uniforms = config.uniforms || {};
    config.uniforms.time = '1f';
    config.uniforms.resolution = '2f';

    config.vertexShader = config.vertexShader || `attribute vec2 vert;
        void main(void) { gl_Position = vec4(vert, 0.0, 1.0);}`;

    if (config.mainCode.indexOf('void main(void)') === -1)
        config.mainCode = `\nvoid main(void) {\n${config.mainCode}\n}`;

    if (!config.fragmentShader) {

        // uniforms
        config.fragmentShader = '\n' + Object.keys(config.uniforms).map(uf => {
            let type = config.uniforms[uf][0];
            return `uniform ${type - 1 ? 'vec' + type : 'float'} ${uf};`;
        }).join('\n') + '\n';

        // textures
        if (config.textures)
            config.fragmentShader += `\nuniform sampler2D tex[${config.textures.length}];\n`;

        // main code
        config.fragmentShader += config.mainCode;
    }

    // default - precision mediump float
    config.fragmentShader = `precision ${config.precision||'mediump'} float;\n` + config.fragmentShader;

    [config.vertexShader, config.fragmentShader].forEach((src, i) => {
        let id = gl.createShader(i ? gl.FRAGMENT_SHADER : gl.VERTEX_SHADER);
        gl.shaderSource(id, src);
        gl.compileShader(id);
        let message = gl.getShaderInfoLog(id);
        gl.attachShader(program, id);

        if (message.length > 0 || config.debug)
            console.log(src.split('\n').map((str, i) =>
                ("" + (1 + i)).padStart(4, "0") + ": " + str).join('\n'));

        if (message.length > 0)
            throw message;
    });
    gl.linkProgram(program);
    gl.useProgram(program);

    let frameCallbacks = config.frame ? [config.frame] : [];
    // uniforms
    Object.keys(config.uniforms).forEach(uf => {
        let loc = gl.getUniformLocation(program, uf);
        let type = config.uniforms[uf];
        let isFunc = typeof type === 'function';
        if (isFunc)
            type = (Array.isArray(type(0)) ? type(0).length : 1) + 'f';
        let f = gl[`uniform${type}`];
        this[uf] = '1f' === type ? v => f.call(gl, loc, v) : v => f.call(gl, loc, ...v);
        if (!isFunc)
            return
        let val;
        frameCallbacks.push(t => {
            let newVal = config.uniforms[uf](val, t);
            newVal !== val && this[uf](val = newVal);
        });
        this[uf](val = config.uniforms[uf](0));
    });

    // textures
    if (config.textures) {
        gl.uniform1iv(
            gl.getUniformLocation(program, 'tex'),
            config.textures.map((_,i) => i));

        config.textures.forEach((url, index) => {
            let loader = new Image();
            loader.crossOrigin = "anonymous";
            if(url.indexOf('svg') > -1) {
                if (url.indexOf('xmlns') === -1)
                    url = url.split('<svg ').join(`<svg xmlns="http://www.w3.org/2000/svg" `)
                url = "data:image/svg+xml;base64," + btoa(url);
            }
            loader.src = url;
            loader.onload = function () {
                let texture = gl.createTexture();
                gl.activeTexture(gl.TEXTURE0 + index);
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, loader);

                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            }
        });
    }

    // vertex data
    let triangle = new Float32Array([-1, 3, -1, -1, 3, -1]);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, triangle, gl.STATIC_DRAW);

    let vert = gl.getAttribLocation(program, "vert");
    gl.vertexAttribPointer(vert, 2, gl.FLOAT, 0, 0, 0);
    gl.enableVertexAttribArray(vert);

    ////

    this.newSize = (w, h) => {
        this.resolution([canvas.width = w, canvas.height = h]);
        gl.viewport(0, 0, w, h);
    }

    this.resize = (w, h) => {
        if (canvas.width === (w|0) && canvas.height === (h|0)) return;
        this.newSize(w, h)
    };

    if (!config.target) {
        document.body.append(canvas);
        if (false === config.fullscreen)
            return
        document.body.style.margin = 0;
        document.body.style.overflow = 'hidden';
        addEventListener("resize", () => this.resize(innerWidth, innerHeight));
        this.newSize(innerWidth, innerHeight);
    } else {
        this.newSize(canvas.width, canvas.height);
    }

    gl.drawArrays(gl.TRIANGLES, 0, 3);

    if (false !== config.loop) {
        let drawFrame = t => {
            this.time(t/1000);
            frameCallbacks.forEach(cb => cb(t));
            gl.drawArrays(gl.TRIANGLES, 0, 3);
            requestAnimationFrame(drawFrame);
        };
        requestAnimationFrame(drawFrame);
    }
}