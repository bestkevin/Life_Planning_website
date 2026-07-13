import { heartfeltFragmentShader, heartfeltVertexShader } from "./heartfeltShader.js";

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const message = gl.getShaderInfoLog(shader) || "Unknown shader compile error";
        gl.deleteShader(shader);
        throw new Error(message);
    }

    return shader;
}

function createProgram(gl, vertexSource, fragmentSource) {
    const program = gl.createProgram();
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const message = gl.getProgramInfoLog(program) || "Unknown program link error";
        gl.deleteProgram(program);
        throw new Error(message);
    }

    return program;
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.decoding = "async";
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error(`Failed to load image: ${src}`));
        image.src = src;
    });
}

export function createHeartfeltRain(canvas, imageSrc, options = {}) {
    const gl = canvas.getContext("webgl2", {
        alpha: false,
        antialias: false,
        depth: false,
        stencil: false,
        premultipliedAlpha: false,
        preserveDrawingBuffer: false,
    });

    if (!gl) {
        throw new Error("WebGL2 is required for the rain shader.");
    }

    const program = createProgram(gl, heartfeltVertexShader, heartfeltFragmentShader);
    const positionLocation = gl.getAttribLocation(program, "a_position");
    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    const timeLocation = gl.getUniformLocation(program, "u_time");
    const rainAmountLocation = gl.getUniformLocation(program, "u_rainAmount");
    const textureLocation = gl.getUniformLocation(program, "u_texture_0");

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
        gl.STATIC_DRAW,
    );

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    let animationFrame = 0;
    let running = true;
    let width = 0;
    let height = 0;
    let startTime = performance.now();
    let rainAmount = options.rainAmount ?? 0.55;
    let animateRainAmount = options.animateRainAmount ?? true;
    let onFrame = options.onFrame;

    const resize = () => {
        const bounds = canvas.getBoundingClientRect();
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        const nextWidth = Math.max(1, Math.round(bounds.width * pixelRatio));
        const nextHeight = Math.max(1, Math.round(bounds.height * pixelRatio));

        if (nextWidth === width && nextHeight === height) {
            return;
        }

        width = nextWidth;
        height = nextHeight;
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
    };

    const render = (now) => {
        if (!running) return;

        resize();

        const elapsed = (now - startTime) * 0.001;
        const currentRainAmount = animateRainAmount
            ? Math.sin(elapsed * 0.05) * 0.3 + 0.7
            : rainAmount;

        gl.useProgram(program);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(textureLocation, 0);
        gl.uniform2f(resolutionLocation, width, height);
        gl.uniform1f(timeLocation, elapsed);
        gl.uniform1f(rainAmountLocation, currentRainAmount);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
        onFrame?.(canvas);

        animationFrame = requestAnimationFrame(render);
    };

    const init = async () => {
        const image = await loadImage(imageSrc);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
        resize();
        animationFrame = requestAnimationFrame(render);
    };

    const ready = init();

    return {
        ready,
        destroy() {
            running = false;
            cancelAnimationFrame(animationFrame);
            gl.deleteProgram(program);
            gl.deleteBuffer(buffer);
            gl.deleteTexture(texture);
        },
        setRainAmount(value) {
            rainAmount = value;
            animateRainAmount = false;
        },
    };
}
