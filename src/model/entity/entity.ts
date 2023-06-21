import { Container }                    from 'pixi.js';
import { Graphics }                     from 'pixi.js';
import { Sprite, SpriteSource }         from 'pixi.js';
import { Location }                     from '../../types/base.types';
import { GameService }                  from '../../service';

export type Option<Value extends Record<string, any>, ValueType extends EntityType<Value>> = Partial<Record<keyof ValueType, ValueType[keyof ValueType]>>
export interface EntityType<Value extends Record<string, any>> {
    size        : number;           // radius
    angle?      : number;           // visual angle in degrees
    asset?      : SpriteSource;
    color?      : string;           // fallback if no asset is provided -> defaults to #fff

    base        : Value;
    current?    : Value;
}
export abstract class Entity<Value extends Record<string, any> = any, ValueType extends EntityType<Value> = any> {
    protected          visual: Sprite|Graphics;
    protected readonly values: ValueType;

    protected constructor(
        location    : Location,
        type        : ValueType,
        options     : Option<Value, ValueType> = {}
    ) {
        this.values = this.mergeValues( type, options );

        if (this.values.asset) {
            this.visual         = Sprite.from(this.values.asset);
            this.visual.anchor.set(0.5);
            this.visual.width   = this.values.size;
            this.visual.height  = this.values.size;
            this.visual.x       = location.x;
            this.visual.y       = location.y;
            this.visual.angle   = this.values.angle ?? 0;
        } else {
            this.visual = new Graphics();
            this.visual
                .beginFill(this.values.color ?? '#fff')
                .drawCircle(location.x, location.y, this.values.size);
            this.visual.angle = this.values.angle ?? 0;
        }

        GameService.instance.addVisualToScene('game', this.visual);
    }

    public destroy(): void {
        this.visual.destroy();
    }

    public attach( element: Container ): Entity<ValueType> {
        element.addChild(this.visual);
        return this;
    }

    public get x(): number { return this.visual.x }
    public get y(): number { return this.visual.y }

    public get location(): Location { return { x: this.visual.x, y: this.visual.y, } }

    public get size(): number { return this.values.size }

    public distance(target: Location): number {
        return Math.hypot(target.x - this.x, target.y - this.y);
    }

    private mergeValues<Value extends Record<string, any>, ValueType extends EntityType<Value> = any>( type: ValueType, options: Option<Value, ValueType> ): ValueType {
        return {
            ...type,
            ...Object
                .keys(options)
                .reduce( (result: Partial<ValueType>, key) => {
                    if (options.hasOwnProperty(key) && options[key as keyof ValueType]) {
                        return { ...result, [key]: options[key as keyof ValueType] }
                    }
                    return result;
                }, {}),
        };
    }
}