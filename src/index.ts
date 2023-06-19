import * as PIXI from 'pixi.js';
import { GameService } from './service/gameservice';

const app = new PIXI.Application({
    background: '#3d4145',
    resizeTo: window,
    width: window.innerWidth,
    height: window.innerHeight,
});

// @ts-ignore
document.body.appendChild(app.view);

const game = new GameService(app);