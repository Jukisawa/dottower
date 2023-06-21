import * as PIXI                from 'pixi.js';
import {Assets, Graphics, Sprite} from 'pixi.js';
import { Subject }              from 'rxjs';
import { PlayerResources }      from '../ressource/entity';
import { EnemyResources }       from '../ressource/entity';
import { UnitTypeResource }     from '../ressource/ressource.types';
import { ProjectileResources }  from '../ressource/entity';
import { Player }               from '../model/entity/player';
import {Unit, UnitType} from '../model/entity/unit';
import { Projectile }           from '../model/entity/projectile';
import { Location }             from '../types/base.types';

/* * * * * * * * * * * * * * * * * * * * * */
/*                 Options                 */
/* * * * * * * * * * * * * * * * * * * * * */
const showFPS = false;

/**
 * @name        GameService
 * @description
 */
export class GameService {
    protected static singleton: GameService;

    protected readonly $onDestroy   : Subject<void>;

    protected scenes                : Record<string, PIXI.Container>;

    // @ts-ignore
    protected player                : Player;

    protected enemyResources        : Array<{ probability: number, type: UnitTypeResource }>;
    protected enemies               : Array<Unit>;
    protected projectiles           : Array<Projectile>;

    constructor(public readonly pixi: PIXI.Application) {
        this.$onDestroy         = new Subject<void>();

        this.scenes             = {};
        this.enemyResources     = [];
        this.enemies            = [];
        this.projectiles        = [];

        GameService.singleton   = this;
        this.init();
    }

    public static get instance(): GameService {
        return GameService.singleton;
    }

    /* * * * * * * * * * * * * * * * * * * * * */
    /*                Lifecycle                */
    /* * * * * * * * * * * * * * * * * * * * * */
    public onDestroy(): void {
        this.$onDestroy.next();
        this.$onDestroy.complete();
    }

    /* * * * * * * * * * * * * * * * * * * * * */
    /*                 Events                  */
    /* * * * * * * * * * * * * * * * * * * * * */

    public addVisualToScene( scene: 'game', visual: Graphics|Sprite ): void {
        this.scenes[scene].addChild(visual);
    }

    /* * * * * * * * * * * * * * * * * * * * * */
    /*                Internal                 */
    /* * * * * * * * * * * * * * * * * * * * * */
    /**
     * @description initialize app and show stating "page"
     *
     * @protected
     */
    protected init(): void {
        // load scene # Main Menu
        this.loadMainMenu();
    }

    /**
     * @description: todo:: create service for static scenes
     *
     * @protected
     */
    protected loadMainMenu(): void {
        if (this.scenes.hasOwnProperty('mainMenu')) {
            Object
                .keys(this.scenes)
                .forEach( key => {
                    this.scenes[key].visible = key == 'mainMenu';
                });
            return;
        }

        const mainMenu = new PIXI.Container();

        this.pixi.renderer.background.color = '#1a5276';

        const centerY       : number = this.pixi.renderer.height / 2;
        const centerX       : number = this.pixi.renderer.width / 2;
        const buttonHeight  : number = 64;
        const buttonWidth   : number = 300;

        const buttonYOffset : number = -50;
        const buttonXOffset : number = 0;

        const button = new PIXI.Graphics();
        button.beginFill('#0e6655')
            .lineStyle(2, '#343434', 1)
            .drawRect(
                centerX - (buttonWidth / 2) + buttonXOffset,
                centerY - (buttonHeight / 2) + buttonYOffset,
                buttonWidth,
                buttonHeight,
            )
            .endFill();
        mainMenu.addChild(button);
        const style = new PIXI.TextStyle({
            fontFamily: 'Tahoma',
            fontSize: 48,
            fill: '#343434',
        });
        const textWidth = 250;
        const text = new PIXI.Text('Neues Spiel', style);
        text.x = (centerX - (buttonWidth / 2) + buttonXOffset) + (buttonWidth - textWidth) * 0.5;
        text.y = (centerY - (buttonHeight / 2) + buttonYOffset)
        text.width = textWidth;

        mainMenu.addChild(text);

        // @ts-ignore
        button.interactive = true;
        button.on('pointerdown', () => this.startGame());

        this.pixi.stage.addChild(mainMenu);
        this.scenes['mainMenu'] = mainMenu;
    }

    protected async startGame(): Promise<void> {

        const game = new PIXI.Container();
        this.pixi.stage.addChild(game);
        this.scenes['game'] = game;

        // load level

        // load entities
        // todo :: asset loader -> lazyLoad on startup or load all level assets on "new game" start
        await Promise.all([
            new Promise<void>( async res => {
                if (EnemyResources.common.smallBlob.assetPath)
                    EnemyResources.common.smallBlob.asset = await Assets.load(EnemyResources.common.smallBlob.assetPath);
                res();
            }),
            new Promise<void>( async res => {
                if (EnemyResources.common.mediumBlob.assetPath)
                    EnemyResources.common.mediumBlob.asset = await Assets.load(EnemyResources.common.mediumBlob.assetPath);
                res();
            }),
            new Promise<void>( async res => {
                if (EnemyResources.common.largeBlob.assetPath)
                    EnemyResources.common.largeBlob.asset = await Assets.load(EnemyResources.common.largeBlob.assetPath);
                res();
            }),
            new Promise<void>( async res => {
                if (PlayerResources.base.assetPath)
                    PlayerResources.base.asset = await Assets.load(PlayerResources.base.assetPath);
                res();
            }),
            new Promise<void>( async res => {
                if (ProjectileResources.player.basicAttack.assetPath)
                    ProjectileResources.player.basicAttack.asset = await Assets.load(ProjectileResources.player.basicAttack.assetPath);
                res();
            }),
        ]);
        this.enemyResources = [
            { probability: 0.1, type: EnemyResources.common.largeBlob },
            { probability: 0.2, type: EnemyResources.common.mediumBlob },
            { probability: 0.7, type: EnemyResources.common.smallBlob },
        ];

        // load ui

        // create player

        this.player = new Player({
            x: this.pixi.renderer.width / 2,
            y: this.pixi.renderer.height / 2
        }, PlayerResources.base );

        // start loop
        this.scenes['mainMenu'].visible = false;
        this.scenes['game'].visible = true;
        this.pixi.ticker.add( delta => this.gameLoop( delta ));
        this.events();
    }

    protected gameLoop( delta: number ): void {
        this.playerEvents();
        this.projectileEvents();
        this.enemyEvents();
    }

    protected playerEvents(): void {
        // attack
        if (this.player.canAttack()) {
            if (this.enemies.length > 0) {
                const closestEnemy = this.getClosestEnemyInRage(this.player.location, this.player.current.attackRange)
                if (closestEnemy) {
                    this.player.attackNow();
                    const projectile = new Projectile(
                        this.player.location,
                        closestEnemy,
                        ProjectileResources.player.basicAttack,
                    );
                    this.projectiles.push(projectile);
                }
            }
        }

        // dead
        if (!this.player.isAlive) {
            this.enemies.forEach(e => e.destroy());
            this.enemies = [];

            this.projectiles.forEach(e => e.destroy());
            this.projectiles = [];

            window.alert("lol noob");

            this.player.playerReset();
        }
    }

    protected projectileEvents(): void {
        //Projectile Actions
        this.projectiles.forEach(projectile => {
            projectile.move();

            this.enemies.forEach(enemy => {
                const distance = enemy.distance(projectile.location);
                if (distance <= enemy.size + projectile.size) {
                    projectile.hitTarget(enemy);
                }
            });
        });

        this.projectiles = this.projectiles
            .filter(projectile => {
                const isAlive = projectile.aliveCheck();
                if (!isAlive) projectile.destroy();
                return isAlive
            });
    }

    protected enemyEvents(): void {

        //Enemy Actions
        this.enemies.forEach( enemy => {
            enemy.move(this.player);
            if (enemy.canAttack()) {
                if (enemy.distance(this.player.location) <= this.player.size + enemy.size) {
                    enemy.attackNow();
                    this.player.changeValue('hp', -enemy.current.attack);
                }
            }
        });

        this.enemies = this.enemies
            .filter( enemy => {
                if (!enemy.isAlive) {
                    enemy.destroy();
                    // this.player.gainExp(10); todo :: add XP to enemy resource
                }
                return enemy.isAlive
            });
    }

    public getClosestEnemyInRage( location: Location, range: number ): Unit|null {
        const result = this.enemies
            .reduce( (closest, enemy) => {
                if (!enemy.isAlive) return closest;
                const distance = enemy.distance(location);
                if (closest && closest.distance < distance) return  closest;
                if (distance <= range) return { distance, enemy };
                return closest;
            }, {} as { distance: number, enemy: Unit });
        return result?.enemy ?? null;
    }

    public getEnemiesInRage( location: Location, range: number ): Array<Unit> {
        return this.enemies
            .reduce( (results, enemy) => {
                if (!enemy.isAlive) return results;
                const distance = enemy.distance(location);
                if (distance <= range) {
                    return [ ...results, { distance, enemy }];
                }
                return  results;
            }, [] as Array<{ distance: number, enemy: Unit }>)
            .sort((itemA, itemB) => {
                if (itemA.distance < itemB.distance) return +1;
                if (itemA.distance > itemB.distance) return -1;
                return 0;
            })
            .map(({ enemy }) => enemy );
    }

    protected getRandomEnemyType(): UnitTypeResource {
        const probability = Math.random();
        let counter = 0;
        for ( const resource of this.enemyResources ) {
            counter += resource.probability;
            if ( counter <= probability) return resource.type
        }
        return this.enemyResources[this.enemyResources.length - 1].type;
    }

    protected events(): void {
        const variationY = Math.floor((Math.random() - 0.5) * this.pixi.screen.height);
        const variationX = Math.floor((Math.random() - 0.5) * this.pixi.screen.width);

        setInterval((_: any) => {
            const res = this.getRandomEnemyType();
            switch (Math.floor(Math.random() * 4)) {
                case 0:
                    this.enemies.push(new Unit({
                        x: res.size,
                        y: this.pixi.screen.height / 2 + variationY,
                    }, this.getRandomEnemyType()));
                    break;

                case 1:
                    this.enemies.push(new Unit({
                        x: this.pixi.screen.width + res.size,
                        y: this.pixi.screen.height / 2 + variationY,
                    }, this.getRandomEnemyType()));
                    break;

                case 2:
                    this.enemies.push(new Unit({
                        x: this.pixi.screen.width / 2 + variationX,
                        y: -res.size,
                    }, this.getRandomEnemyType()));
                    break;

                case 3:
                    this.enemies.push(new Unit({
                        x: this.pixi.screen.width / 2 + variationX,
                        y: this.pixi.screen.height + res.size,
                    }, this.getRandomEnemyType()));
                    break;
            }
        }, 3000);
    }
}