# Game Dev Patterns — Build Games That Run

## The Game Loop (Non-Negotiable)

```
while (running) {
  const dt = clock.tick();           // Delta time (fixed or variable)
  input.poll();                      // Read input once per frame
  update(dt);                        // Deterministic simulation
  render();                          // Draw current state
}
```

**Rules:**
- Fixed timestep for physics: `dt = 1/60` always
- Input read ONCE per frame, stored, passed to update
- Update is pure: same input + state = same output
- Render interpolates between states for smooth visuals

## State Management

```typescript
// Single source of truth
interface GameState {
  player: PlayerState;
  enemies: EnemyState[];
  level: LevelState;
  ui: UIState;
}

// Updates are pure functions
function update(state: GameState, input: Input, dt: number): GameState {
  return {
    ...state,
    player: updatePlayer(state.player, input, dt),
    enemies: state.enemies.map(e => updateEnemy(e, state.player, dt)),
    // ...
  };
}
```

**No global mutable state.** Ever.

## Asset Pipeline

| Asset Type | Format | Pipeline |
|------------|--------|----------|
| Sprites | PNG → Atlas (TexturePacker) | Load → Atlas → Region |
| Audio | OGG/MP3 → Compressed | Load → Pool → Play |
| Levels | JSON/Tiled → Binary | Load → Parse → Instantiate |
| Shaders | GLSL/WGSL → Compiled | Load → Compile → Cache |

**Generate atlases at build time.** Never pack at runtime.

## Deterministic Simulation (For Replay/Testing/MP)

```typescript
// Seed everything
const rng = new SeededRNG(seed);
const physics = new DeterministicPhysics(fixedTimestep);

// Record inputs for replay
const inputLog: InputFrame[] = [];

// Replay: same seed + same inputs = same result
function replay(seed: number, inputs: InputFrame[]): GameState[] {
  const states: GameState[] = [];
  let state = initialState(seed);
  for (const input of inputs) {
    state = update(state, input, FIXED_DT);
    states.push(state);
  }
  return states;
}
```

## Entity Component System (ECS) — Optional But Powerful

```typescript
// Components = data only
interface Position { x: number; y: number; }
interface Velocity { dx: number; dy: number; }
interface Sprite { texture: string; frame: number; }

// Systems = logic (query components, mutate)
function movementSystem(entities: Entity[], dt: number) {
  for (const e of entities.with(Position, Velocity)) {
    e.position.x += e.velocity.dx * dt;
    e.position.y += e.velocity.dy * dt;
  }
}
```

**Use when:** Many entity types, complex interactions, performance matters.

## Frame Budgeting

| Target | Frame Budget | Update Budget | Render Budget |
|--------|--------------|---------------|---------------|
| 60 FPS | 16.67ms | ~8ms | ~8ms |
| 120 FPS | 8.33ms | ~4ms | ~4ms |

**Profile every frame.** `performance.now()` at start/end of update/render.

## Input Handling

```typescript
interface Input {
  move: { x: number; y: number };  // -1 to 1
  actions: Set<string>;             // "jump", "attack", "pause"
  mouse: { x: number; y: number; down: boolean; };
}

// Normalize once, use everywhere
function normalizeInput(raw: RawInput): Input {
  return {
    move: { x: clamp(raw.horizontal, -1, 1), y: clamp(raw.vertical, -1, 1) },
    actions: new Set(raw.pressedKeys),
    mouse: raw.mouse,
  };
}
```

## Save/Load (Deterministic)

```typescript
interface SaveData {
  version: number;
  seed: number;
  frame: number;
  state: GameState;  // Serialized
  inputLog: InputFrame[];  // For replay verification
}

function save(game: Game): string {
  return JSON.stringify({
    version: SAVE_VERSION,
    seed: game.seed,
    frame: game.frame,
    state: serialize(game.state),
    inputLog: game.inputLog,
  });
}

function load(data: string): Game {
  const parsed = JSON.parse(data);
  // Verify version, reconstruct
}
```

## Testing Games

```typescript
// Deterministic test
test("player jumps correctly", () => {
  const game = new Game(SEED);
  game.input.actions.add("jump");
  game.update(FIXED_DT);
  expect(game.state.player.velocity.y).toBeGreaterThan(0);
});

// Replay test
test("level 1 completes deterministically", () => {
  const inputs = loadInputLog("level1-speedrun.json");
  const states = replay(SEED, inputs);
  expect(states[states.length - 1].level.completed).toBe(true);
});
```

## Your Game Dev Rules (Add to .ai-rules.md)

```markdown
- RULE: Fixed timestep for all simulation (1/60s)
- RULE: Single state object, pure update functions
- RULE: Input read once per frame, normalized
- RULE: Assets built at compile time, not runtime
- RULE: Deterministic RNG seeded at game start
- RULE: Replay system = testing system = multiplayer foundation
```