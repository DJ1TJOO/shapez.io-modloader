import { gItemRegistry } from "../core/global_registries";
import { ShapeItem } from "./items/shape_item";
import { ColorItem } from "./items/color_item";
import { BooleanItem } from "./items/boolean_item";

export function addVanillaItemsToAPI() {
    window["shapezAPI"].ingame.items[ShapeItem.getId()] = ShapeItem;
    window["shapezAPI"].ingame.items[ColorItem.getId()] = ColorItem;
    window["shapezAPI"].ingame.items[BooleanItem.getId()] = BooleanItem;
}

export function initItemRegistry() {
    for (const itemId in window["shapezAPI"].ingame.items) {
        if (!window["shapezAPI"].ingame.items.hasOwnProperty(itemId)) continue;
        const itemClass = window["shapezAPI"].ingame.items[itemId];
        gItemRegistry.register(itemClass);
    }
}