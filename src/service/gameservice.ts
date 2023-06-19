import { Subject } from 'rxjs';
import { fromEvent } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { distinctUntilChanged } from 'rxjs/operators';
import { map, startWith } from 'rxjs/operators';
import { Projectile } from '../model/entity/projectile';
import { Tower } from '../model/entity/tower';
import { Creature } from '../model/entity/creature';
import * as PIXI from 'pixi.js';


/* * * * * * * * * * * * * * * * * * * * * */
/*                 Options                 */
/* * * * * * * * * * * * * * * * * * * * * */
const showFPS = false;

/**
 * @name        GameService
 * @description
 */
export class GameService {
    assets = [
        'assets/nia.png',
        'assets/ganyu.png',
        'assets/annie.png',
        'assets/rem.png',
        'assets/astolfo.png',
    ]

    public static app: PIXI.Application;

    protected readonly onDestroy: Subject<void>;
    protected readonly tower: Tower;

    protected enemies: Array<Creature>;
    protected projectiles: Array<Projectile>;

    protected times: Array<number>;
    protected readonly fps: Subject<number>;

    constructor(app: PIXI.Application) {
        GameService.app = app;
        this.tower = new Tower(app.screen.width / 2, app.screen.height / 2, PIXI.Sprite.from('assets/nia.png'));
        this.enemies = [];
        this.projectiles = [];

        this.times = [];
        this.fps = new Subject<number>();
        this.onDestroy = new Subject<void>();

        // run loop
        this.gameLoop();

        // run static events
        this.events()
    }

    protected gameLoop(): void {
        this.calcFPS();

        this.playerEvents();
        this.projectileEvents();
        this.enemyEvents();

        // wait for next tick
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    protected playerEvents(): void {
        // attack
        if (this.tower.canAttack()) {
            this.tower.lastAttack = performance.now();

            if (this.enemies.length > 0) {
                const closestEnemy = this.enemies.reduce((closest, next) => {
                    if (!closest) return next;
                    return next.distance(this.tower.getLocation) < closest.distance(this.tower.getLocation)
                        ? next
                        : closest
                });

                const projectile = new Projectile(
                    this.tower.x,
                    this.tower.y,
                    this.tower.damage,
                    '#FF00EC',
                    PIXI.Sprite.from('https://www.pngfind.com/pngs/m/20-203501_sprite-i-made-as-its-source-image-gloucester.png'),
                    closestEnemy,
                    100000,
                    1
                );

                this.projectiles.push(projectile);

            }
        }

        // dead
        if (!this.tower.isAlive) {
            this.enemies.every(e => e.destroy());
            this.enemies = [];

            this.projectiles.every(e => e.destroy());
            this.projectiles = [];

            this.tower.playerReset({
                x: GameService.app.screen.width / 2,
                y: GameService.app.screen.height / 2,
            });

            window.alert("lol noob");
        }
    }

    protected projectileEvents(): void {
        //Projectile Actions
        this.projectiles.forEach(projectile => {
            projectile.move();

            this.enemies.forEach(enemy => {
                const distance = enemy.distance(projectile.getLocation);

                if ((distance - projectile.getAoe) < 30) {
                    projectile.hitEnemy(enemy);
                }
            });
        });

        this.projectiles = this.projectiles
            .filter(e => e.isAlive)
            .map(e => {
                return e;
            });
    }

    protected enemyEvents(): void {

        //Enemy Actions
        this.enemies.forEach(element => {

            element.move(this.tower);

            if (element.canAttack()) {
                if (Math.abs(element.x - this.tower.x) < 30 && Math.abs(element.y - this.tower.y) < 30) {
                    this.tower.changeState('hp', -element.damage);
                    element.lastAttack = performance.now();
                }
            }
        });

        this.enemies = this.enemies
            .filter(e => {
                if (!e.isAlive) {
                    e.destroy();
                    this.tower.gainExp(10);
                }
                else
                    return e.isAlive
            });
    }

    protected events(): void {

        const enemySize = 30;
        const enemyVelocity = 4.5;

        const variationY = Math.floor((Math.random() - 0.5) * GameService.app.screen.height);
        const variationX = Math.floor((Math.random() - 0.5) * GameService.app.screen.width);

        setInterval((_: any) => {
            switch (Math.floor(Math.random() * 4)) {
                case 0:
                    this.enemies.push(new Creature({
                        x: -enemySize,
                        y: GameService.app.screen.height / 2 + variationY,
                    }, enemySize, enemyVelocity, 'red', PIXI.Sprite.from(this.assets[Math.floor(Math.random() * this.assets.length)]), 100, 1000, true));
                    break;

                case 1:
                    this.enemies.push(new Creature({
                        x: GameService.app.screen.height + 30,
                        y: GameService.app.screen.height / 2 + variationY,
                    }, enemySize, enemyVelocity, 'red', PIXI.Sprite.from(this.assets[Math.floor(Math.random() * this.assets.length)]), 100, 1000, true));
                    break;

                case 2:
                    this.enemies.push(new Creature({
                        x: GameService.app.screen.width / 2 + variationX,
                        y: -30,
                    }, enemySize, enemyVelocity, 'red', PIXI.Sprite.from(this.assets[Math.floor(Math.random() * this.assets.length)]), 100, 1000, true));
                    break;

                case 3:
                    this.enemies.push(new Creature({
                        x: GameService.app.screen.width / 2 + variationX,
                        y: GameService.app.screen.height + 30,
                    }, enemySize, enemyVelocity, 'red', PIXI.Sprite.from(this.assets[Math.floor(Math.random() * this.assets.length)]), 100, 1000, true));
                    break;
            }
        }, 1000);

        if (showFPS) this.fps
            .pipe(takeUntil(this.onDestroy))
            .pipe(distinctUntilChanged())
            .subscribe(fps => console.info({ fps }));

        fromEvent(document, 'visibilitychange')
            .pipe(takeUntil(this.onDestroy))
            .pipe(
                map(() => document.visibilityState),
                startWith(document.visibilityState)
            )
            .pipe(distinctUntilChanged())
            .subscribe(change => {
                console.log('onVisibilityChange', Date.now(), change)
            })
    }

    protected calcFPS() {
        const now = performance.now();
        while (this.times.length > 0 && this.times[0] <= now - 1000) {
            this.times.shift();
        }
        this.times.push(now);
        this.fps.next(this.times.length);
    }

    public destroy(): void {
        this.onDestroy.next();
        this.onDestroy.complete();
    }
}