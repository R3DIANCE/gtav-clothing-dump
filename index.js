"use strict";
class ClothingItem {
    constructor(name, component, drawable, texture, pedModel) {
        this.Name = name;
        this.Component = component;
        this.Drawable = drawable;
        this.Texture = texture;
        this.PedModel = pedModel;
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
var masks = new Array();
var hairs = new Array();
var torsos = new Array();
var legs = new Array();
var bags = new Array();
var shoes = new Array();
var accessories = new Array();
var undershirts = new Array();
var armors = new Array();
var decals = new Array();
var tops = new Array();
var hats = new Array();
var glasses = new Array();
var ears = new Array();
var watches = new Array();
var bracelets = new Array();
mp.gui.chat.safeMode = false;
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
function getClothingDump(component) {
    var dump = new Array();
    const maxDrawables = getMaxDrawableVariations(component);
    const componentCategory = getComponentCategory(component);
    mp.gui.chat.push(`<p style="color:yellow;">[STARTED]<span style="color:white;"> copy of ${componentCategory}</span></p>`);
    for (let i = 0; i < maxDrawables; i++) {
        const maxTextures = getMaxTextureVariations(component, i);
        if (i >= maxDrawables - 1) {
            mp.gui.chat.push(`<p style="color:green;">[COMPLETED]<span style="color:white;"> copy of ${componentCategory}</span></p>`);
            return dump;
        }
        else {
            for (let x = 0; x < maxTextures; x++) {
                const drawable = i;
                const texture = x;
                const componentHash = mp.game.invoke(Natives.GET_HASH_NAME_FOR_COMPONENT, mp.players.local.handle, component, drawable, texture);
                if (componentHash == null)
                    continue;
                const componentData = getShopPedComponent(componentHash);
                if (componentData == null)
                    continue;
                const componentName = mp.game.gxt.get(componentData.textLabel);
                if (componentName == "NULL")
                    continue;
                dump.push(new ClothingItem(componentName, component, drawable, texture, mp.players.local.model));
            }
        }
    }
    return dump;
}
function getPropDump(component) {
    var dump = new Array();
    const maxDrawables = getMaxPropDrawableVariations(component);
    const componentCategory = getPropComponentCategory(component);
    mp.gui.chat.push(`<p style="color:yellow;">[STARTED]<span style="color:white;"> copy of ${componentCategory}</span></p>`);
    for (let i = 0; i < maxDrawables; i++) {
        const maxTextures = getMaxPropTextureVariationscomponent(component, i);
        if (i >= maxDrawables - 1) {
            mp.gui.chat.push(`<p style="color:green;">[COMPLETED]<span style="color:white;"> copy of ${componentCategory}</span></p>`);
            return dump;
        }
        else {
            for (let x = 0; x < maxTextures; x++) {
                const drawable = i;
                const texture = x;
                const componentHash = mp.game.invoke(Natives.GET_HASH_NAME_FOR_PROP, mp.players.local.handle, component, drawable, texture);
                if (componentHash == null)
                    continue;
                const componentData = getShopPedProp(componentHash);
                if (componentData == null)
                    continue;
                const componentName = mp.game.gxt.get(componentData.textLabel);
                if (componentName == "NULL")
                    continue;
                dump.push(new ClothingItem(componentName, component, drawable, texture, mp.players.local.model));
            }
        }
    }
    return dump;
}
function getComponentCategory(component) {
    var result = clothingCategory.find(x => x.Id == component);
    return result != null ? result.Name : "empty";
}
function getPropComponentCategory(component) {
    var result = propCategory.find(x => x.Id == component);
    return result != null ? result.Name : "empty";
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
mp.keys.bind(0x72, false, () => {
    // clothing
    getClothingDump(1).forEach(x => masks.push(x));
    getClothingDump(2).forEach(x => hairs.push(x));
    getClothingDump(3).forEach(x => torsos.push(x));
    getClothingDump(4).forEach(x => legs.push(x));
    getClothingDump(5).forEach(x => bags.push(x));
    getClothingDump(6).forEach(x => shoes.push(x));
    getClothingDump(7).forEach(x => accessories.push(x));
    getClothingDump(8).forEach(x => undershirts.push(x));
    getClothingDump(9).forEach(x => armors.push(x));
    getClothingDump(10).forEach(x => decals.push(x));
    getClothingDump(11).forEach(x => tops.push(x));
    // props
    getPropDump(0).forEach(x => hats.push(x));
    getPropDump(1).forEach(x => glasses.push(x));
    getPropDump(2).forEach(x => ears.push(x));
    getPropDump(6).forEach(x => watches.push(x));
    getPropDump(7).forEach(x => bracelets.push(x));
});
mp.keys.bind(0x73, false, () => {
    // clothing
    mp.storage.data.masks = masks;
    mp.storage.data.hairs = hairs;
    mp.storage.data.torsos = torsos;
    mp.storage.data.legs = legs;
    mp.storage.data.bags = bags;
    mp.storage.data.shoes = shoes;
    mp.storage.data.accessories = accessories;
    mp.storage.data.undershirts = undershirts;
    mp.storage.data.armors = armors;
    mp.storage.data.decals = decals;
    mp.storage.data.tops = tops;
    // props
    mp.storage.data.hats = hats;
    mp.storage.data.glasses = glasses;
    mp.storage.data.ears = ears;
    mp.storage.data.watches = watches;
    mp.storage.data.bracelets = bracelets;
    mp.storage.flush();
    mp.gui.chat.push(`<p style="color:purple;">[SAVED]<span style="color:white;"> your data has been saved to local storage</span></p>`);
});
