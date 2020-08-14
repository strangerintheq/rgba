# RGBA.js - super tiny webgl/fragment shader tool

examples: https://codepen.io/collection/AWEWzK

---
 
 
 
 this mini library focusing on hiding webgl/javascript code from you and giving ablility to write only fragment shader code
 
 




## usage
 
 just add last tag script to your html page
 
    <script src="https://rawcdn.githack.com/strangerintheq/rgba/0.0.4/rgba.js"></script>






## features


 - Embedded full screen pass (single triangle) 
 
 ![](https://i.stack.imgur.com/5Ny6k.png)
 
 
 - Auto uniforms (`float`, `vec2`, `vec3`, `vec4`, `sampler2D`)
 
 
 - `requestAnimationFrame` loop
 




## simplest example

    RGBA(`
        vec2 uv = gl_FragCoord.xy/resolution - 0.5;
        uv.x *= resolution.x/resolution.y;
        for (float i=0.; i<4.; i++)
           uv = abs(uv) / dot(uv, uv) - sin(time)*0.1 - 1.;
        gl_FragColor = vec4(uv, uv.x+uv.y, 1.);
    `)

this code is using 2 uniforms added by library code:

    uniform vec2 resolution; // screen resolution
    uniform float time; // frame time in seconds


