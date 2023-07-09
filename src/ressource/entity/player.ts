import { PlayerTypeResource }   from '../ressource.types';

export const base: PlayerTypeResource = {
    base: {
        level       : 1,
        exp         : 0,
        attack      : 25,
        attackRange : 780,
        hp          : 100,
        armor       : 3,
        attackSpeed : 80,
        velocity    : 0,
    },
    size        : 35,               // radius
    color       : '#b7323d',        // fallback if no asset is provided -> defaults to #fff
    assetPath   : 'assets/img/annie.png'
}