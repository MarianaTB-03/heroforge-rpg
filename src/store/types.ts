export type StatKey = 'str' | 'agi' | 'int';

export type BuildPreset = 'WARRIOR' | 'MAGE' | 'ROGUE';

export type ItemCategory = 'weapon' | 'shield' | 'armor' | 'boots' | 'accessory';

export interface Item {
  id: string;
  name: string;
  icon: string;
  category: ItemCategory;
  bonusStr: number;
  bonusAgi: number;
  bonusInt: number;
  bonusDef: number;
  weight: number;
}
