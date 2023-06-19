import * as PIXI from 'pixi.js';
import { GameService } from '../../service/gameservice';

export interface Location {
    x: number;
    y: number;
}

export abstract class Entity {

    protected sprite: PIXI.Sprite;
    protected color: string;
    protected velocity: number;
    protected _alive: boolean;
    protected size: number;

    protected constructor(location: Location, color: string, size: number, sprite: PIXI.Sprite, velocity: number = 1, alive = true) {
        this.sprite = sprite;
        this.sprite.anchor.set(0.5);
        this.sprite.x = location.x;
        this.sprite.y = location.y;
        this.velocity = velocity;
        this.color = color;
        this.size = size;
        this._alive = alive;
        GameService.app.stage.addChild(this.sprite);
    }

    public destroy(): void {
        GameService.app.stage.removeChild(this.sprite);
    }

    get x(): number { return this.sprite.x }
    get y(): number { return this.sprite.y }
    get getLocation(): Location { return { x: this.sprite.x, y: this.sprite.y, } }
    get isAlive(): boolean { return this.alive }
    get alive(): boolean { return this._alive; }
    set alive(alive: boolean) { this._alive = alive;/* if(!alive) console.trace()*/ }

    get getSize(): number { return this.size }

    public abstract move(target: Entity): void;

    public distance(target: Location): number {
        return Math.hypot(target.x - this.x, target.y - this.y);
    }
}