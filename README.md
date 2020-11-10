# RGBA.js - yet another tiny webgl/fragment shader tool

---
 
 
 
 focusing on hiding webgl/javascript code from you 
 
 and giving ablility to write fragment shader code only
 
 first created for using in my codepen experiments 

 https://codepen.io/collection/AWEWzK




---
0.0.5

- added possibility to record video 

        RGBA(`...`, {record: true})


## features

 - embedded full screen pass (single triangle) 
 
 - texture loading (svg too)

 - auto uniforms (`float`, `vec2`, `vec3`, `vec4`, `sampler2D`)
 
 - `requestAnimationFrame` loop (can be disabled)
 
 - 2 embedded uniforms (`float time` and `vec2 resolution`)

 - can add canvas to webpage or use external canvas 

 - simple debug mode
 
 ![](https://i.stack.imgur.com/5Ny6k.png)



---

## basic usage


first argument passing to `RGBA` function is a fragment shader source code

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

## textures

second argument passing to `RGBA` function is a settings holder object

field `textures` is an `Array` of textures urls mapped to auto provided `sampler2D[]` unform array `tex`





    RGBA(`
        vec2 uv = gl_FragCoord.xy / resolution;
        vec4 c0 = texture2D(tex[0], uv);
        vec4 c1 = texture2D(tex[1], uv);
        gl_FragColor = mix(c0, c1, sin(time)*0.5 + 0.5);
    `, { 
        textures: [
            'https://picsum.photos/id/1/800/600',
            'https://picsum.photos/id/3/800/600',
        ]
    });




---

## examples


https://codepen.io/collection/AWEWzK


