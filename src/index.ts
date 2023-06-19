import * as PIXI from 'pixi.js';

const app = new PIXI.Application({
    background: '#3d4145',
    resizeTo: window,
    width: window.innerWidth,
    height: window.innerHeight,
});

// @ts-ignore
document.body.appendChild(app.view);

let bunnies: Array<{
    xGrowth: number;
    yGrowth: number;
    lifetime: number;
    sprite: PIXI.Sprite;
}> = [];

const assets = [
    'assets/nia.png',
    'assets/ganyu.png',
    'assets/annie.png',
    'assets/rem.png',
    'assets/astolfo.png',
]

setInterval( _ => {
 for ( let i = 0; i < 100; i++) {

     const bunny = {
         xGrowth: ((Math.random() * 10 ) - 5) / 10,
         yGrowth: ((Math.random() * 10 ) + 9) / 10,
         lifetime: Math.random() * 250,
         sprite: PIXI.Sprite.from(assets[Math.floor(Math.random() * assets.length)]),
     };

     bunny.sprite.anchor.set(0.5);

     const scale = (Math.random() * 128);
     bunny.sprite.width = scale;
     bunny.sprite.height = scale;

     bunny.yGrowth *= (128 - scale) * 0.25;

     bunny.sprite.x = app.screen.width * Math.random();
     bunny.sprite.y = -50;

     app.stage.addChild(bunny.sprite);
     bunnies.push(bunny);
 }

}, 10)

// Listen for animate update
app.ticker.add((delta) =>
{
    bunnies = bunnies
        .filter((bunny, i) => {
            bunny.sprite.x += bunny.xGrowth;
            bunny.sprite.y += bunny.yGrowth;
            bunny.sprite.rotation += 0.1 * delta;

            bunny.lifetime--;

            if (bunny.lifetime <= 20) {
                bunny.sprite.alpha = bunny.lifetime / 20;
                if (bunny.lifetime <= 0) {
                    bunny.sprite.destroy();
                    return false;
                }
            }
            return true;
        });
});

