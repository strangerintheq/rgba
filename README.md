# RGBA.js - yet another tiny webgl/fragment shader tool

---
 
 
 
 focusing on hiding webgl/javascript code from you 
 
 and giving ablility to write fragment shader code only
 
 first created for using in my codepen experiments 

 https://codepen.io/strangerintheq




---

## features

 - texture loading (including svg)


 - 2 embedded uniforms (`float time` and `vec2 resolution`)
 
 
 - Auto uniforms (`float`, `vec2`, `vec3`, `vec4`, `sampler2D`)
 
 
 - `requestAnimationFrame` loop (can be disabled)
 
 
 - Embedded full screen pass (single triangle) 
 
 ![](https://i.stack.imgur.com/5Ny6k.png)



---

## usage

    <script src="https://rawcdn.githack.com/strangerintheq/rgba/0.0.4/rgba.js"></script>
    <script>
        RGBA(`
            vec2 uv = gl_FragCoord.xy / resolution;
            gl_FragColor = vec4(uv, 1.0, 1.0);
        `);
    </script>

this code is using `resolution` uniform added by library code:

    uniform vec2 resolution; // screen resolution





---

## examples


https://codepen.io/collection/AWEWzK


