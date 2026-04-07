console.info("[SOCIETY] shippingBinNamed.js loaded");

const shippingBins = [
  "shippingbin:basic_shipping_bin",
  "shippingbin:smart_shipping_bin",
];

const getCustomNameJson = (item) => {
  if (!item || !item.nbt?.display?.Name) return null;
  return String(item.nbt.display.Name);
};

const getStoredCustomName = (nbt) => {
  if (!nbt || !nbt.data) return null;
  return nbt.data.customName || nbt.data.custom_name || null;
};

global.getShippingBinName = (nbt, legacy) => {
  if (nbt && nbt.contains('customName')) {
    let json = nbt.getString('customName');
    let data = JSON.parse(json);
    if (legacy) {
      return textComponentToLegacy(data);
    }
    else {
      return Text.of(data);
    }
  }
  return null;
};

const textComponentToLegacy = (data) => {
  const colorMap = {
    black: "§0", dark_blue: "§1", dark_green: "§2", dark_aqua: "§3",
    dark_red: "§4", dark_purple: "§5", gold: "§6", gray: "§7",
    dark_gray: "§8", blue: "§9", green: "§a", aqua: "§b",
    red: "§c", light_purple: "§d", yellow: "§e", white: "§f"
  };
  let prefix = "";
  if (data.color) prefix += colorMap[data.color.toLowerCase()] ?? "§f";
  if (data.bold) prefix += "§l";
  if (data.italic) prefix += "§o";
  if (data.underlined) prefix += "§n";
  if (data.strikethrough) prefix += "§m";
  if (data.obfuscated) prefix += "§k";
  const text = data.text ?? "";
  return prefix + text;
};

BlockEvents.placed(shippingBins, (e) => {
  const { player, block } = e;
  if (!player) return;
  let item = player.getHeldItem("main_hand");
  if (item.id !== block.id) item = player.getHeldItem("off_hand");
  if (item.id !== block.id) return;
  const customName = getCustomNameJson(item);
  if (!customName) return;
  let nbt = block.getEntityData();
  nbt.merge({ data: { customName: customName } });
  global.setBlockEntityData(block, nbt);
});

BlockEvents.broken(shippingBins, (e) => {
  const { block } = e;
  const nbt = block.getEntityData();
  const customName = getStoredCustomName(nbt);
  const drop = customName
    ? Item.of(block.id, `{display:{Name:${NBT.stringTag(String(customName))}}}`)
    : Item.of(block.id);
  block.popItem(drop);
});
