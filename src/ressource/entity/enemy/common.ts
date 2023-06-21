import { UnitTypeResource }     from '../../ressource.types';

export const smallBlob: UnitTypeResource = {
    base: {
        level       : 1,
        attack      : 5,
        hp          : 25,
        armor       : 0,
        attackSpeed : 800,
        velocity    : 4,
    },
    size        : 15,               // radius
    color       : '#3a32b7',        // fallback if no asset is provided -> defaults to #fff
}

export const mediumBlob: UnitTypeResource = {
    base: {
        level       : 1,
        attack      : 6,
        hp          : 30,
        armor       : 1,
        attackSpeed : 900,
        velocity    : 3,
    },
    size        : 25,               // radius
    color       : '#b78832',        // fallback if no asset is provided -> defaults to #fff
}

export const largeBlob: UnitTypeResource = {
    base: {
        level       : 2,
        attack      : 8,
        hp          : 40,
        armor       : 3,
        attackSpeed : 1100,
        velocity    : 2,
    },
    size        : 35,               // radius
    color       : '#32b788',        // fallback if no asset is provided -> defaults to #fff
}

export const bossBlob: UnitTypeResource = {
    base: {
        level       : 3,
        attack      : 12,
        hp          : 100,
        armor       : 5,
        attackSpeed : 1500,
        velocity    : 1,
    },
    size        : 35,               // radius
    color       : '#32b788',        // fallback if no asset is provided -> defaults to #fff
}