# Vada Chennai 3D: Streets of the North

A fan-made, **GTA-style 3D open-world** browser game inspired by the Tamil film
**Vada Chennai** (2018). Third-person camera, drivable auto-rickshaw, and the full
story campaign of the 2D version — now in 3D.

All art, code and story text are original; no assets from the film are used.
Non-commercial tribute. Rendering by [three.js](https://threejs.org) (MIT, vendored
as `three.min.js`, see `THREE_LICENSE`).

## How to play

Open `index.html` in any modern browser — the folder is fully self-contained
(no build step, no network needed).

```
# or serve it locally:
cd games/vada-chennai-3d && python3 -m http.server 8080
# then visit http://localhost:8080
```

## The game

You are **Anbu**, a young carrom champion from a North Madras fishing settlement.
Explore a 480×360 m low-poly world — harbour piers over the sea, the fish market,
the carrom club, the tea kadai, a temple with a gopuram, market stalls and Guna's
den — on foot or behind the handlebar of an auto-rickshaw.

### GTA-style systems

- **Third-person camera** that follows you walking and swings back wider while driving
- **Drivable auto-rickshaw** (F to enter/exit) with acceleration, drag, speed-scaled
  steering, collisions and a km/h speedometer — you can even run down thugs
- **Day/night cycle**: the sun orbits, the sky and fog shift, street lamps and
  building windows light up at night
- **Open combat** (punches, knockback, HP bars), money (₹) and respect stats,
  tea-kadai healing, collectible shells on the beach
- Live minimap + floating 3D quest arrow

### Story missions

1. Win the club match in a physics-based **carrom minigame**
2. Haul in the catch in a timing-based **fishing minigame**
3. **Stealth delivery** — red-shirt patrols with visible detection rings will
   snatch the parcel on sight
4. Defend the market from **Thambi's thugs**
5. Choose your ending: *protect the people*, or *rule by fear*

### Controls

| Key | Action |
|-----|--------|
| W / S | Walk or drive forward / back |
| A / D | Turn |
| F | Enter / exit the auto-rickshaw |
| E / Enter | Talk · interact · advance dialogue |
| Space | Punch (also: hook the fish while fishing) |
| Mouse | Place, aim and shoot the carrom striker |
| H | Show help |

Prefer 2D? The original top-down version lives in [`../vada-chennai`](../vada-chennai).
