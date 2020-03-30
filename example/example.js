example('simplest example', `new RGBA(\`
    \tvec2 uv = gl_FragCoord.xy / resolution;
    \tgl_FragColor = vec4(uv, sin(time), 1.0);
    \`);
`);

example('auto uniforms', ` let rgba = new RGBA(\`
    \tvec2 uv = gl_FragCoord.xy / resolution;
    \tgl_FragColor = vec4(min(uv, xy), sin(time), 1.0);
    \`, {uniforms: {xy: '2f'}});
    
    addEventListener('mousemove', e => 
    \trgba.xy([e.x/innerWidth, 1.0 - e.y/innerHeight]));
`);

example('textures', `new RGBA(\`
    \tvec2 uv = gl_FragCoord.xy / resolution;
    \tgl_FragColor = mix(
    \t\ttexture2D(tex[0], uv), 
    \t\ttexture2D(tex[1], uv), 
    \t\tsign(sin(uv.x + uv.y*0.2 + time*2.0))*0.5+0.5);
    \`, { 
    \ttextures: [
    \t\t'https://picsum.photos/id/1/300',
    \t\t'https://picsum.photos/id/2/300',
    \t]
    });
`);

example('disable requestAnimationFrame loop', `new RGBA(\`
    \tvec2 uv = gl_FragCoord.xy / resolution;
    \tgl_FragColor = vec4(uv, sin(time), 1.0);
    \`, {loop: false});
`);

function example(name, code) {

    let id = '_' + Math.random().toString(36).substring(2)

    document.body.innerHTML += `
        <hr><h3>${name}</h3><section>
            <code>${code.split('\n').join('<br>').split('\t').join('&nbsp;&nbsp;')}</code>
            <iframe id="${id}"></iframe>
        </section>
    `;

    let iframeContent = `
        <!DOCTYPE html><html>
        <head><script src="../src/rgba.js"></script></head>
        <body><script>${code}</script></body></html>
    `;

    setTimeout(() => {
        var iframe = document.querySelector('#' + id);
        iframe = iframe.contentWindow || iframe.contentDocument.document || iframe.contentDocument;
        iframe = iframe.document;
        iframe.open('text/html', 'replace');
        iframe.write(iframeContent);
        iframe.close();
    })
}