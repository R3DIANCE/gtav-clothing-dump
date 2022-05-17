"use strict";
class ClothingItem {
    constructor(name, component, drawable, texture) {
        this.Name = name;
        this.Component = component;
        this.Drawable = drawable;
        this.Texture = texture;
    }
}
class CategoryItem {
    constructor(id, name) {
        this.Id = id;
        this.Name = name;
    }
}
const REPLACE_PATTERN = /\u0000/g;
const Natives = {
    GET_SHOP_PED_COMPONENT: "0x74C0E2A57EC66760",
    GET_SHOP_PED_PROP: "0x5D5CAFF661DDF6FC",
    GET_HASH_NAME_FOR_COMPONENT: "0x0368B3A838070348",
    GET_HASH_NAME_FOR_PROP: "0x5D6160275CAEC8DD",
};
const delay = 250;
const clothingCategory = [
    new CategoryItem(0, "head"),
    new CategoryItem(1, "masks"),
    new CategoryItem(2, "hair"),
    new CategoryItem(3, "torsos"),
    new CategoryItem(4, "legs"),
    new CategoryItem(5, "bags"),
    new CategoryItem(6, "shoes"),
    new CategoryItem(7, "accessories"),
    new CategoryItem(8, "undershirts"),
    new CategoryItem(9, "armor"),
    new CategoryItem(10, "decals"),
    new CategoryItem(11, "tops"),
];
const propCategory = [
    new CategoryItem(0, "hats"),
    new CategoryItem(1, "glasses"),
    new CategoryItem(2, "ears"),
    new CategoryItem(6, "watches"),
    new CategoryItem(7, "bracelets"),
];
function getString(buffer, offset, length = 64) {
    return String.fromCharCode.apply(null, Array.from(new Uint8Array(buffer, offset, length))).replace(REPLACE_PATTERN, "");
}
function getShopPedComponent(componentHash) {
    let buffer = [new ArrayBuffer(136)];
    if (mp.game.invoke(Natives.GET_SHOP_PED_COMPONENT, componentHash >> 0, buffer) === 0)
        return null;
    const { 0: lockHash, 2: uniqueNameHash, 4: locate, 6: drawableIndex, 8: textureIndex, 10: unk1, 12: eCompType, 14: unk2, 16: unk3 } = new Uint32Array(buffer[0]);
    return {
        lockHash,
        uniqueNameHash,
        locate,
        drawableIndex,
        textureIndex,
        unk1,
        eCompType,
        unk2,
        unk3,
        textLabel: getString(buffer[0], 72),
    };
}
function getShopPedProp(propHash) {
    let buffer = [new ArrayBuffer(136)];
    if (mp.game.invoke(Natives.GET_SHOP_PED_PROP, propHash >> 0, buffer) === 0)
        return null;
    const { 0: lockHash, 2: uniqueNameHash, 4: locate, 6: propIndex, 8: textureIndex, 10: unk1, 12: eAnchorPoint, 14: unk2, 16: unk3 } = new Uint32Array(buffer[0]);
    return {
        lockHash,
        uniqueNameHash,
        locate,
        propIndex,
        textureIndex,
        unk1,
        eAnchorPoint,
        unk2,
        unk3,
        textLabel: getString(buffer[0], 72)
    };
}
function getComponentVariations(component) {
    const maxDrawables = getMaxDrawableVariations(component);
    for (let x = 0; x < maxDrawables; x++) {
        setTimeout(() => {
            const maxTextures = getMaxTextureVariations(component, x);
            for (let y = 0; y < maxTextures; y++) {
                const componentHash = mp.game.invoke(Natives.GET_HASH_NAME_FOR_COMPONENT, mp.players.local.handle, component, x, y);
                if (componentHash != null) {
                    const componentData = getShopPedComponent(componentHash);
                    if (componentData != null) {
                        const componentName = mp.game.gxt.get(componentData.textLabel);
                        const componentCategory = getComponentCategory(component);
                        const genderName = getPlayerGender();
                        if (componentName != "NULL") {
                            setTimeout(() => {
                                mp.gui.chat.push(`name: ${componentName}, component: ${component}, drawable: ${x}, texture: ${y}, folder: ${genderName}_${componentCategory}`);
                                //mp.events.callRemote("server:clothing:insert", component, x, y, componentName, `${genderName}_${componentCategory}`);
                            }, delay * y);
                        }
                    }
                }
            }
        }, delay * x);
    }
}
function getPropComponentVariations(component) {
    const maxDrawables = getMaxPropDrawableVariations(component);
    for (let x = 0; x < maxDrawables; x++) {
        setTimeout(() => {
            const maxTextures = getMaxPropTextureVariationscomponent(component, x);
            for (let y = 0; y < maxTextures; y++) {
                const componentHash = mp.game.invoke(Natives.GET_HASH_NAME_FOR_PROP, mp.players.local.handle, component, x, y);
                if (componentHash != null) {
                    const componentData = getShopPedProp(componentHash);
                    if (componentData != null) {
                        const componentName = mp.game.gxt.get(componentData.textLabel);
                        const componentCategory = getPropComponentCategory(component);
                        const genderName = getPlayerGender();
                        if (componentName != "NULL") {
                            setTimeout(() => {
                                mp.gui.chat.push(`name: ${componentName}, component: ${component}, drawable: ${x}, texture: ${y}, folder: ${genderName}_${componentCategory}`);
                                //mp.events.callRemote("server:clothing:insert", component, x, y, componentName, `${genderName}_${componentCategory}`);
                            }, delay * y);
                        }
                    }
                }
            }
        }, delay * x);
    }
}
function getComponentCategory(component) {
    var result = clothingCategory.find(x => x.Id == component);
    return result != null ? result.Name : "empty";
}
function getPropComponentCategory(component) {
    var result = propCategory.find(x => x.Id == component);
    return result != null ? result.Name : "empty";
}
function getPlayerGender() {
    return mp.players.local.model == mp.game.joaat("mp_m_freemode_01") ? "male" : "female";
}
function getMaxDrawableVariations(component) {
    var _a;
    return (_a = mp.players.local) === null || _a === void 0 ? void 0 : _a.getNumberOfDrawableVariations(component);
}
function getMaxTextureVariations(component, drawable) {
    var _a;
    return (_a = mp.players.local) === null || _a === void 0 ? void 0 : _a.getNumberOfTextureVariations(component, drawable);
}
function getMaxPropDrawableVariations(component) {
    var _a;
    return (_a = mp.players.local) === null || _a === void 0 ? void 0 : _a.getNumberOfPropDrawableVariations(component);
}
function getMaxPropTextureVariationscomponent(component, drawable) {
    var _a;
    return (_a = mp.players.local) === null || _a === void 0 ? void 0 : _a.getNumberOfPropTextureVariations(component, drawable);
}
mp.keys.bind(0x71, false, () => {
    mp.players.local.model = mp.players.local.model == mp.game.joaat("mp_m_freemode_01") ? mp.game.joaat("mp_f_freemode_01") : mp.game.joaat("mp_m_freemode_01");
});
mp.events.add("client:clothing:generate", (component, isProp) => {
    if (!isProp)
        getComponentVariations(component);
    else
        getPropComponentVariations(component);
});
