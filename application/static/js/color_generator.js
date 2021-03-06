function hslToRgb(h, s, l) {
    var r, g, b;
    if (s == 0) {
        r = g = b = l; // achromatic
    }
    else {
        var hue2rgb = function hue2rgb(p, q, t) {
            if (t < 0)
                t += 1;
            if (t > 1)
                t -= 1;
            if (t < 1 / 6)
                return p + (q - p) * 6 * t;
            if (t < 1 / 2)
                return q;
            if (t < 2 / 3)
                return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function generate(config) {
    /*
    Parameters:
        -config:
            -num(int): Number of colors to generate, required
            -sat(int): Color saturation in [0, 100], required
            -lum(int): Color luminosity in [0, 100], required
            -alpha(float): Transparency value in [0, 1], optional (default: 1)
            -offset(float): hue offset in [0, 1], optional (default: 1)
    */
    var colors = [];

    // set optional argument values if not present
    if(!config.offset)config.offset=0;
    if(!config.alpha)config.alpha=1;

    for (var i = 0; i < config.num; i++) {
        let color = hslToRgb((i / config.num) + config.offset, config.sat / 100, config.lum / 100)
        color.push(config.alpha)
        colors.push('rgba(' + color.toString() + ')');
    }
    return colors;
}