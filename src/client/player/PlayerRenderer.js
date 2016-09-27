import { Renderer } from 'soundworks/client';

function decibelTolinear(val) {
  return Math.exp(0.11512925464970229 * val); // pow(10, val / 20)
};

/**
 * A simple canvas renderer.
 * The class renders a dot moving over the screen and rebouncing on the edges.
 */
export default class PlayerRenderer extends Renderer {
  constructor(vx, vy) {
    super(0); // update rate = 0: synchronize updates to frame rate

    this.width = 0;
    this.height = 0;

    this.intensity = 0;
  }

  /**
   * Initialize rederer state.
   * @param {Number} dt - time since last update in seconds.
   */
  init() {
    this.width = this.canvasWidth;
    this.height = this.canvasHeight;
  }

  /**
   * Update rederer state.
   * @param {Number} dt - time since last update in seconds.
   */
  update(dt) {
  }

  /**
   * Draw into canvas.
   * Method is called by animation frame loop in current frame rate.
   * @param {CanvasRenderingContext2D} ctx - canvas 2D rendering context
   */
  render(ctx) {
    ctx.save();
    ctx.globalAlpha = this.intensity;
    ctx.fillStyle = '#ee1111';
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.restore();
  }
}
