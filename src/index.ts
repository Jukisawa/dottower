import * as PIXI        from 'pixi.js';
import { GameService }  from './service';

const app = new PIXI.Application({
    background: '#3d4145',
    resizeTo: window,
    width: window.innerWidth,
    height: window.innerHeight,
});

document.body.appendChild(app.view as any);
document.body.style.padding = '0';
document.body.style.margin = '0';
// @ts-ignore
app.renderer.view.style.position = 'absolute';
// @ts-ignore
app.view.addEventListener( 'mousedown', event => console.log( event ))


new GameService(app);