function svgNoise(w, h=w, freq= 0.01, octaves= 13) {
    return `<svg width="${w}px" height="${h}px">
        <filter id="n">
            <feTurbulence type="fractalNoise" 
                baseFrequency="${freq}" 
                numOctaves="${octaves}" />
        </filter>
        <circle r="${w+h}" filter="url(#n)"></circle>
    </svg>`
}
