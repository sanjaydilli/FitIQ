# Vada Chennai: Streets of the North

A fan-made, open-world browser game inspired by the Tamil film **Vada Chennai** (2018).
Everything — art, code, story text — is original; no assets from the film are used.
Non-commercial tribute.

## How to play

Open `index.html` in any modern browser. No build step, no dependencies, no server needed.

```
# or serve it locally:
cd games/vada-chennai && python3 -m http.server 8080
# then visit http://localhost:8080
```

## The game

You are **Anbu**, a young carrom champion from a North Madras fishing settlement.
Explore a hand-built open world — the harbour piers, the fish market, the carrom club,
the tea kadai, the temple and Guna's den — while the story pulls you deeper into
the gang politics of Vada Chennai.

### Story missions

1. **Padma** sends you to the carrom club — win the club match in a physics-based
   **carrom minigame** (slingshot the striker, pocket 6 coins in 12 strikes).
2. Help **Chandra** haul in the catch in a timing-based **fishing minigame**.
3. Run a parcel for **Velu** across the settlement — a stealth mission where the
   rival gang's red-shirts patrol the roads and will snatch the parcel on sight.
4. Defend the market from **Thambi's thugs** in open combat.
5. Choose your ending: *protect the people*, or *rule by fear*.

### Systems

- Open world (120×90 tiles) with collision, y-sorted rendering and a live minimap
- Day/night cycle with glowing windows at night
- Money (₹) and Respect stats; enemies drop respect, shells on the beach hide cash
- Tea kadai heals you for ₹20
- Wandering NPCs with flavour dialogue; quest arrow + minimap marker guidance
- Tiny WebAudio sound effects, zero external assets — a single self-contained HTML file

### Controls

| Key | Action |
|-----|--------|
| WASD / Arrows | Move |
| E / Enter | Talk · interact · advance dialogue |
| Space | Punch (also: hook the fish while fishing) |
| Mouse | Place, aim and shoot the carrom striker |
| H | Show help |
