# ⚒️ HeroForge RPG — Estado visual con Redux Toolkit en React Native

Mini-juego RPG hecho con **React Native (Expo) + TypeScript + Redux Toolkit**.
Cada acción despachada en una zona de la pantalla actualiza al mismo tiempo las
otras zonas, sin pasar props entre ellas.

---

## 1. Cómo ejecutarlo

Requisitos: Node.js 22.13 o superior y la app **Expo Go** en el teléfono
(o un emulador Android/iOS).

```bash
git clone <url-de-este-repositorio>
cd heroforge-rpg
npm install
npx expo start
```

Luego se escanea el código QR con Expo Go o se abre en el emulador.

**Video explicativo:** _(pega aquí el enlace a tu video)_

---

## 2. Estructura del proyecto

```
App.tsx                      → Provider + las 4 zonas hermanas
src/
├── components/              → SOLO interfaz (UI)
│   ├── HeroAvatarHUD.tsx        Zona A: avatar, clase, barras (solo lee)
│   ├── StatsControlPanel.tsx    Zona B: atributos, presets, reseteo
│   ├── ArmoryGrid.tsx           Zona C: ítems, equipar, alerta de sobrecarga
│   ├── ReduxLiveInspector.tsx   Zona D: combate + consola de acciones
│   ├── GameClock.tsx            reloj invisible: regenera maná según la AGI
│   └── ui/                      ProgressBar animada y tema de colores
└── store/                   → SOLO lógica de estado
    ├── index.ts                 configureStore, RootState, hooks tipados
    ├── actions.ts               gameReset (acción global)
    ├── constants.ts             reglas de balance del juego
    ├── types.ts                 tipos compartidos
    ├── selectors.ts             TODO el estado derivado
    ├── data/itemsCatalog.ts     catálogo de 6 ítems
    ├── slices/
    │   ├── statsSlice.ts
    │   ├── inventorySlice.ts
    │   ├── bossSlice.ts
    │   └── actionLogSlice.ts
    └── thunks/combatThunks.ts   combate, curación y tic de maná
```

---

## 3. Arquitectura de Redux

### Flujo unidireccional

```
Componente → dispatch(acción) → Reducer (slice) → nuevo State → Selector → re-render
```

### Slices

| Slice | Guarda | Acciones |
|---|---|---|
| `stats` | `availablePoints`, `str`, `agi`, `int`, `currentHp`, `currentMana` | `incrementStat`, `decrementStat`, `applyBuildPreset`, `resetStats`, `takeDamage`, `healHero`, `spendMana`, `regenMana`, `clampMana` |
| `inventory` | `catalog`, `equippedIds` | `toggleEquipItem`, `clearEquipment` |
| `boss` | `level`, `currentHp`, `runEnded` | `damageBoss`, `nextBoss`, `endRun` |
| `actionLog` | `entries` (últimas 5), `nextSeq` | Se llena solo con `builder.addMatcher` |

- **`gameReset`** es una acción global creada con `createAction`. Los slices
  `stats`, `inventory` y `boss` la escuchan en sus `extraReducers`, así **una
  sola acción reinicia todo el juego**.
- **`actionLog`** usa `isAnyOf(...)` + `addMatcher` para registrar acciones de
  los otros slices sin que los componentes despachen nada extra.

### Regla de oro: estado derivado (`selectors.ts`)

Ningún valor calculado se guarda en un slice. Todos salen de selectores
memorizados con `createSelector`:

| Selector | Cálculo |
|---|---|
| `selectTotalStats` | atributos base + bonos de los ítems equipados (incluye `def`) |
| `selectTotalWeight` | suma del peso de los ítems equipados |
| `selectMaxCarryCapacity` | `10 + (STR total × 2)` |
| `selectIsOverencumbered` | `peso > capacidad` |
| `selectWeightStatus` | verde < 70 %, amarillo hasta 100 %, rojo si se pasa |
| `selectMaxMana` | `20 + (INT total × 5)` |
| `selectManaRegenIntervalMs` | `5 s − (AGI total − 5) × 0,25 s`, entre 1 s y 5 s |
| `selectCombatPower` | `STR×3 + AGI×2 + INT×3`, −30 % si hay sobrecarga |
| `selectAttackPreview` | daño del próximo ataque (completo con maná, 50 % sin maná) |
| `selectCanHeal` / `selectCanAttack` | si los botones de combate están activos |
| `selectDamageReduction` | `DEF × 2 %`, con tope del 60 % |
| `selectHeroVisualClass` | clase, ícono y color de aura |
| `selectHeroCondition` | expresión del avatar según la vida |
| `selectBossInfo` | nombre, vida máxima (`100 × nivel`), rango de daño |

### ¿Por qué hay thunks?

Los reducers deben ser **puros**: el mismo estado con la misma acción siempre
da el mismo resultado. Por eso el **azar** del daño del jefe y el
**temporizador** del reset viven en `combatThunks.ts`. Los reducers solo
reciben números ya calculados dentro del `action.payload`.

Un clic en **Atacar** despacha estas acciones (se ven en la consola):

```
stats/spendMana   → 10
boss/damageBoss   → 40
stats/takeDamage  → 12
```

### Regeneración de maná con el tiempo

El paso del tiempo también es un efecto secundario, así que tampoco puede ir
en un reducer. `<GameClock />` es un componente que no dibuja nada: con
`useEffect` + `setInterval` despacha el thunk `regenManaTick` cada cierto
tiempo,
que llama al reducer `regenMana` con `{ amount: 1, max }`. El thunk no hace
nada si el maná ya está lleno o el héroe está derrotado.

El intervalo viene del selector `selectManaRegenIntervalMs`: cuanta más
Agilidad total, más rápido se recarga. Si la AGI cambia (un [+], un preset o
las Botas Élficas), el `useEffect` se reinicia con el nuevo intervalo.

`regenMana` **no aparece en la consola** a propósito: llega una y otra vez y
taparía las acciones del jugador.

---

## 4. Reglas del juego

| Regla | Valor |
|---|---|
| Puntos iniciales | 15 (atributos base 5 / 5 / 5, mínimo 1) |
| Presets | Guerrero 15/8/7 · Mago 7/8/15 · Pícaro 7/15/8 (STR/AGI/INT); cada uno reparte los 15 puntos |
| Vida máxima | 100 |
| Ataque | cuesta 10 de maná; sin maná, ataque débil al 50 % |
| Regeneración | +1 de maná cada 5 s con AGI 5; −0,25 s por punto de AGI extra, mínimo 1 s (AGI 21). Se pausa si el héroe está derrotado |
| Curación | gasta todo el maná actual y cura esa cantidad (tope 100 HP) |
| Jefe | vida `100 × nivel`; daño `8 + 4 × nivel`, con variación ±25 % |
| Al vencer al jefe | elegir **Siguiente jefe** o **Terminar aquí** |
| Si el héroe muere | se ve el avatar derrotado 2,5 s y luego `game/reset` |
| Clases | ver tabla siguiente |

### Clases del héroe (`selectHeroVisualClass`)

Se evalúan en este orden sobre los atributos **totales** (base + ítems):

| Clase | Sprite | Condición | Aura |
|---|---|---|---|
| 🏰 Tanque Pesado | 🏋️ | Defensa total ≥ 15 (solo la dan los ítems) | Ámbar |
| 🪓 Guerrero Berserker | 🧔 | STR dominante y ≥ 15 | Rojo |
| 🔮 Archimago | 🧙 | INT dominante y ≥ 15 | Azul |
| 🌙 Asesino Sombrío | 🥷 | AGI dominante y ≥ 15 | Verde |
| 🌾 Aldeano | 🧑 | Ninguna de las anteriores | Gris |

El avatar combina tres capas que vienen de selectores distintos: el **sprite**
según la clase, la **expresión** según la vida (`selectHeroCondition`) y el
**arma en mano** (`selectEquippedWeapon`).

### Ítems

| Ítem | Bonos | Peso |
|---|---|---|
| 🗡️ Espada de Fuego | +5 STR | 8 kg |
| 🛡️ Escudo de Titanio | +1 STR, +8 DEF | 14 kg |
| 🪄 Báculo Arcano | +6 INT | 4 kg |
| 👢 Botas Élficas | +5 AGI, +1 DEF | 2 kg |
| 🦺 Armadura Maldita | +3 STR, −2 AGI, −2 INT, +10 DEF | 22 kg |
| 📿 Amuleto Rúnico | +2 AGI, +2 INT, +2 DEF | 1 kg |

**Cómo provocar la sobrecarga:** con los atributos iniciales, equipar la
Armadura Maldita y el Escudo de Titanio (36 kg contra una capacidad de 28 kg).
Después, el preset **Guerrero** sube la capacidad a 48 kg y la quita.

---

## 5. Decisiones sobre puntos ambiguos del enunciado

- **Presets:** se usaron los de la sección técnica (`WARRIOR`, `MAGE`, `ROGUE`).
- **Nombres de acciones:** se usaron los de la sección 3.1
  (`applyBuildPreset`, `clearEquipment`) y se agregó `resetStats` porque la
  interfaz exige el botón "Poción de Reseteo".
- **Clases:** la guía tiene dos versiones (tabla de la Zona A y código base de
  la sección 4). Se usan los cuatro nombres de la Zona A, que es el requisito
  visual; la lógica de "estadística dominante" de la sección 3.2; y del código
  base, el umbral de 15, los colores de aura y "Asesino Sombrío" para AGI,
  porque la tabla no define una clase para la Agilidad y el preset `ROGUE`
  quedaría sin clase. "Tanque Pesado" depende de la defensa, que solo viene
  de los ítems, para cumplir con "según la combinación de stats e ítems".
- **Defensa:** se agregó `bonusDef` a los ítems; reduce el daño del jefe y
  permite la clase "Tanque Pesado".
- **Maná:** `currentMana` se guarda porque es un recurso que se gasta; el
  máximo es derivado. Si baja el máximo (al quitar el Báculo), `clampMana`
  recorta el valor guardado antes de usarlo.
- **Jefe:** se agregó un cuarto slice (`bossSlice`) para su vida y nivel.
- **"−50 % Velocidad":** es solo el texto de la alerta; la penalización real
  es la del selector (−30 % de poder).