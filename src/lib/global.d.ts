import type { Config, RenderState } from './config.ts'

declare global {
  interface HTMLElementEventMap {
    'lines-canvas:config-changed': CustomEvent<{ update: Partial<Config>, config: Config }>;
    'lines-canvas:state-changed': CustomEvent<{ update: Partial<RenderState>, state: RenderState }>;
  }
}