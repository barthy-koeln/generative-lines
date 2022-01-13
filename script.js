import * as TWEEN from "https://cdn.skypack.dev/@tweenjs/tween.js@18.6.4";

const CANVAS_SIZE = 1024;
const PADDING = 64;
const LINES_SIZE = CANVAS_SIZE - PADDING;

const canvas = document.getElementById("canvas");
const container = document.querySelector(".container");
const controlsContainer = document.getElementById("controls");
const rerollButton = document.getElementById("reroll");
const downloadButton = document.getElementById("download");
const replayButton = document.getElementById("replay");
const context = canvas.getContext("2d", {
  alpha: true
});

const controls = {
  titleRandomness: "Randomness <small>(will reroll)</small>",
  steps: {
    default: 6,
    min: 2,
    max: 24,
    callback: reroll
  },
  colors: {
    default: 3,
    min: 2,
    max: 24,
    callback: reroll
  },
  titleAppearance: "Appearance <small>(will only redraw)</small>",
  background: {
    default: "#222222",
    callback: backgroundChanged,
    type: "color"
  },
  lines: {
    default: 12,
    min: 1,
    max: 48,
    callback: redraw
  },
  distance: {
    default: 12,
    min: -64,
    max: 64,
    unit: "px",
    callback: redraw
  },
  amplitude: {
    default: 100,
    min: -100,
    max: 100,
    unit: "%",
    callback: redraw
  },
  thickness: {
    default: 1,
    min: 1,
    max: 12,
    unit: "px",
    callback: redraw
  },
  easing: {
    default: "Quadratic",
    callback: redraw,
    type: "select",
    choices: Object.keys(TWEEN.Easing)
  }
};

let animation = null;
let colors = [];
let distances = [];
const values = {};
for (const [name, options] of Object.entries(controls)) {
  if (typeof options === "string") {
    controlsContainer.insertAdjacentHTML(
      "beforeend",
      `<div class="controls__title"><h5>${options}</h5></div>`
    );

    continue;
  }

  const isSelect = options.type === "select";
  const inputElementMarkup = isSelect
    ? createSelect(name, options)
    : createInput(name, options);
  const event = isSelect ? "change" : "input";

  controlsContainer.insertAdjacentHTML(
    "beforeend",
    `
      <div class="control">
        <label
          for="${name}"
          class="control__label"
        >
          ${name}: <span class="control__value">${options.default}</span>
          ${options.unit || ""}
        </label>
        ${inputElementMarkup}
      </div>
    `
  );

  const input = document.querySelector(`[name="${name}"]`);
  input.addEventListener(event, onInputChange.bind(null, input, options));

  values[name] = options.default;
}

rerollButton.addEventListener("click", reroll);
downloadButton.addEventListener("click", download);
replayButton.addEventListener("click", () => redraw(2000));
reroll();

setTimeout(function () {
  const hiddenElements = document.querySelectorAll(".hidden");
  for (const element of hiddenElements) {
    element.classList.remove("hidden");
  }
}, 2000);

function createSelect(name, options) {
  const choices = createChoices(options.choices, options.default);
  return `
    <select
      name="${name}"
      id="${name}"
      class="control__input"
    >
      ${choices}
    </select>
  `;
}

function createInput(name, options) {
  return `
     <input
        type="${options.type || "range"}"
        name="${name}"
        id="${name}"
        ${options.min ? `min="${options.min}"` : ""}
        ${options.max ? `max="${options.max}"` : ""}
        ${options.min ? `step="${options.step || 1}"` : ""}
        value="${options.default}"
        class="control__input"
    />
  `;
}

function getEasing(easing) {
  const pack = TWEEN.Easing[easing];
  return pack.InOut || pack.None;
}

function createChoices(choices, defaultValue) {
  return choices
    .map(
      (choice) => `
      <option value="${choice}" ${choice === defaultValue ? "selected" : ""}>
        ${choice}
      </option>
    `
    )
    .join("\n");
}

function download() {
  const link = document.createElement("a");
  
  const valueString = Object.entries(values).map(([name, value]) => `${value}_${name}`).join('-')
  
  link.download = `generative_lines-${valueString}.png`;
  link.href = canvas.toDataURL();
  link.click();
}

function onInputChange(input, options) {
  const valueSpan = input.parentNode.querySelector(".control__value");
  values[input.name] = options.min ? parseInt(input.value, 10) : input.value;
  valueSpan.innerText = input.value;
  options.callback();
}

function fillArray(N, callback) {
  return Array.from({ length: N }, callback);
}

function getRandomFloat() {
  return Math.random() - 0.5;
}

function createGradient(width, colors) {
  const colorDistance = 1 / (colors.length - 1);
  const gradient = context.createLinearGradient(0, 0, width, 0);
  colors.forEach((color, index) =>
    gradient.addColorStop(index * colorDistance, color)
  );

  return gradient;
}

function getRandomColor() {
  return chroma.random().set("hsl.l", 0.6).saturate(2);
}

function getEasedCurvePoints(points, pixelsPerStep, steps, easingFunction) {
  const renderPoints = [];

  for (let index = 0; index < points.length - 1; index++) {
    const start = points[index];
    const target = points[index + 1];
    const distance = target[1] - start[1];

    for (let step = 0; step < steps; step++) {
      const linearFactor = step / steps;
      const easedFactor = easingFunction(linearFactor);
      const x = start[0] + linearFactor * pixelsPerStep;
      const y = start[1] + easedFactor * distance;

      renderPoints.push([x, y]);
    }
  }

  return renderPoints;
}

function createLines(
  numSteps,
  numLines,
  lineDistance,
  width,
  height,
  paddingX,
  paddingY,
  amplitude,
  easing
) {
  const lineDistanceSum = numLines * lineDistance;
  const lineHeight = (height - lineDistanceSum - numLines - 2 * paddingY) / 2;
  const innerWidth = width - 2 * paddingX;
  const pixelsPerStep = innerWidth / (numSteps - 1);

  const points = distances.map((point, index) => {
    const pointX = index * pixelsPerStep;
    const pointY = lineHeight + point * lineHeight * amplitude;

    return [pointX, pointY];
  });

  const lines = [];

  for (let lineIndex = 0; lineIndex < numLines; lineIndex++) {
    const scale = 1 - lineIndex * 0.02;
    const scaledPixelsPerStep = scale * pixelsPerStep;
    const offsetX = paddingX + (innerWidth - scale * innerWidth) / 2;
    const offsetY = paddingY + lineIndex + lineIndex * lineDistance;
    const offsetPoints = points.map(([x, y]) => [
      offsetX + scale * x,
      offsetY + y
    ]);

    lines.push(
      getEasedCurvePoints(
        offsetPoints,
        scaledPixelsPerStep,
        pixelsPerStep,
        easing
      )
    );
  }

  return lines;
}

function render(lines, t = 0, start = 0, timestamp = 0, duration = 0) {
  const elapsed = timestamp - start;
  const pointsPerLine = lines[0].length;
  const timeFactor =
    duration === 0 ? 1 : TWEEN.Easing.Quadratic.InOut(elapsed / duration);

  const stepsToRender =
    duration === 0
      ? pointsPerLine - 1
      : Math.min(
          Math.floor(timeFactor * pointsPerLine) - t,
          pointsPerLine - t - 2
        );

  if (stepsToRender > 0) {
    for (const points of lines) {
      // https://stackoverflow.com/a/7058606/3808452
      context.beginPath();

      context.moveTo(points[t][0], points[t][1]);

      let index;
      const loopStart = t + 1;
      for (index = loopStart; index < loopStart + stepsToRender - 2; index++) {
        var xc = (points[index][0] + points[index + 1][0]) / 2;
        var yc = (points[index][1] + points[index + 1][1]) / 2;
        context.quadraticCurveTo(points[index][0], points[index][1], xc, yc);
      }

        // curve through the last two points
        context.quadraticCurveTo(
          points[index][0],
          points[index][1],
          points[index + 1][0],
          points[index + 1][1]
        );

      context.stroke();
    }
  }

  const nextT = t + stepsToRender;
  if (nextT >= pointsPerLine - 1) {
    return;
  }

  animation = requestAnimationFrame((newTime) =>
    render(lines, nextT, start, newTime, duration)
  );
}

function reroll() {
  colors = fillArray(values.colors, getRandomColor);
  distances = fillArray(values.steps, getRandomFloat);
  redraw(2000);
}

function redraw(animationDuration = 0) {
  cancelAnimationFrame(animation);
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;

  const maxSize = Math.min(window.innerWidth, window.innerHeight, CANVAS_SIZE);
  const scale = maxSize / CANVAS_SIZE;

  if (scale < 1) {
    canvas.style.transform = `scale(${scale})`;
  }

  const lines = createLines(
    values.steps,
    values.lines,
    values.distance,
    CANVAS_SIZE,
    CANVAS_SIZE,
    PADDING,
    PADDING,
    values.amplitude / 100,
    getEasing(values.easing)
  );

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = values.background;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = createGradient(canvas.offsetWidth, colors);
  context.lineWidth = values.thickness;
  context.lineCap = "square";

  if (animationDuration === 0) {
    animation = requestAnimationFrame(() => render(lines));
    return;
  }

  animation = requestAnimationFrame((timestamp) => {
    render(lines, 0, timestamp, timestamp, animationDuration);
  });
}

function backgroundChanged() {
  container.style.background = values.background;
  redraw();
}
